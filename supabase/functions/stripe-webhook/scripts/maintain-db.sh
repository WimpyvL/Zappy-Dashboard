#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE=".logs/db-maintenance.log"
ARCHIVE_DIR=".archive"
RETENTION_DAYS=90
VACUUM_THRESHOLD=20 # Percentage of dead tuples
ANALYZE_THRESHOLD=10 # Percentage of changed rows

# Initialize directories
mkdir -p .logs .archive

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Execute SQL and handle errors
execute_sql() {
    local sql=$1
    local error_msg=${2:-"SQL execution failed"}
    
    if ! psql "$DATABASE_URL" -c "$sql"; then
        log "${RED}$error_msg${NC}"
        return 1
    fi
    return 0
}

# Check database connection
check_connection() {
    log "Checking database connection..."
    
    if ! psql "$DATABASE_URL" -c "SELECT 1;"; then
        log "${RED}Database connection failed${NC}"
        exit 1
    fi
    
    log "${GREEN}Database connection successful${NC}"
}

# Analyze table statistics
analyze_tables() {
    log "Analyzing table statistics..."
    
    local tables=$(psql "$DATABASE_URL" -t -c "
        SELECT schemaname || '.' || tablename
        FROM pg_tables
        WHERE schemaname = 'public';
    ")
    
    for table in $tables; do
        log "Analyzing $table..."
        execute_sql "ANALYZE VERBOSE $table;" "Failed to analyze $table"
    done
}

# Vacuum tables
vacuum_tables() {
    log "Vacuuming tables..."
    
    local tables=$(psql "$DATABASE_URL" -t -c "
        SELECT schemaname || '.' || tablename,
               n_dead_tup::float / n_live_tup * 100 as dead_ratio
        FROM pg_stat_user_tables
        WHERE n_live_tup > 0
        AND n_dead_tup / n_live_tup > $VACUUM_THRESHOLD / 100.0;
    ")
    
    if [ -z "$tables" ]; then
        log "No tables need vacuuming"
        return 0
    fi
    
    for table in $tables; do
        log "Vacuuming $table..."
        execute_sql "VACUUM VERBOSE $table;" "Failed to vacuum $table"
    done
}

# Archive old data
archive_old_data() {
    log "Archiving old data..."
    
    local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)
    local archive_file="$ARCHIVE_DIR/stripe_events_$(date +%Y%m%d).sql"
    
    log "Archiving events older than $cutoff_date..."
    
    # Export old data
    pg_dump "$DATABASE_URL" \
        --table=public.stripe_events \
        --data-only \
        --where="created_at < '$cutoff_date'" \
        > "$archive_file"
    
    if [ $? -ne 0 ]; then
        log "${RED}Failed to create archive${NC}"
        return 1
    fi
    
    # Delete archived data
    execute_sql "
        DELETE FROM stripe_events 
        WHERE created_at < '$cutoff_date';" \
        "Failed to delete archived data"
    
    log "${GREEN}Successfully archived old data to $archive_file${NC}"
}

# Reindex tables
reindex_tables() {
    log "Reindexing tables..."
    
    local tables=$(psql "$DATABASE_URL" -t -c "
        SELECT schemaname || '.' || tablename
        FROM pg_tables
        WHERE schemaname = 'public';
    ")
    
    for table in $tables; do
        log "Reindexing $table..."
        execute_sql "REINDEX TABLE $table;" "Failed to reindex $table"
    done
}

# Update table statistics
update_statistics() {
    log "Updating table statistics..."
    
    execute_sql "ANALYZE VERBOSE;" "Failed to update statistics"
}

# Check for bloat
check_bloat() {
    log "Checking for table bloat..."
    
    psql "$DATABASE_URL" -c "
        WITH constants AS (
            SELECT current_setting('block_size')::numeric AS bs,
                   23 AS hdr,
                   4 AS ma
        ),
        bloat_info AS (
            SELECT
                schemaname, tablename, bs*tblpages AS real_size,
                (tblpages-est_tblpages)*bs AS extra_size,
                CASE WHEN tblpages - est_tblpages > 0
                    THEN 100 * (tblpages - est_tblpages)/tblpages::float
                    ELSE 0
                END AS bloat_ratio
            FROM (
                SELECT ceil(reltuples/((bs-page_hdr)/tpl_size)) + ceil(toasttuples/4) AS est_tblpages,
                    tblpages, fillfactor, bs, tblid, schemaname, tablename, heappages, toastpages
                FROM (
                    SELECT
                        ( 4 + tpl_hdr_size + tpl_data_size + (2*ma)
                          - CASE WHEN tpl_hdr_size%ma = 0 THEN ma ELSE tpl_hdr_size%ma END
                        ) AS tpl_size, bs - page_hdr AS size_per_block, (heappages + toastpages) AS tblpages,
                        heappages, toastpages, reltuples, toasttuples, bs, page_hdr, tblid, schemaname, tablename, fillfactor
                    FROM (
                        SELECT
                            tbl.oid AS tblid, ns.nspname AS schemaname, tbl.relname AS tablename,
                            tbl.reltuples, tbl.relpages AS heappages, coalesce(toast.relpages, 0) AS toastpages,
                            coalesce(toast.reltuples, 0) AS toasttuples,
                            coalesce(substring(array_to_string(tbl.reloptions, ' ') FROM 'fillfactor=([0-9]+)')::smallint, 100) AS fillfactor,
                            current_setting('block_size')::numeric AS bs,
                            CASE WHEN version()~'mingw32' OR version()~'64-bit|x86_64|ppc64|ia64|amd64' THEN 8 ELSE 4 END AS ma,
                            24 AS page_hdr,
                            23 + CASE WHEN MAX(coalesce(s.null_frac,0)) > 0 THEN ( 7 + count(*) ) / 8 ELSE 0::int END
                              + CASE WHEN tbl.relhasoids THEN 4 ELSE 0 END AS tpl_hdr_size,
                            sum( (1-coalesce(s.null_frac, 0)) * coalesce(s.avg_width, 1024) ) AS tpl_data_size
                        FROM pg_attribute AS att
                            JOIN pg_class AS tbl ON att.attrelid = tbl.oid
                            JOIN pg_namespace AS ns ON ns.oid = tbl.relnamespace
                            LEFT JOIN pg_stats AS s ON s.schemaname=ns.nspname AND s.tablename = tbl.relname AND s.attname=att.attname
                            LEFT JOIN pg_class AS toast ON tbl.reltoastrelid = toast.oid
                        WHERE NOT att.attisdropped
                            AND tbl.relkind = 'r'
                        GROUP BY 1,2,3,4,5,6,7,8,9,10
                    ) AS s1
                ) AS s2
            ) AS s3
            WHERE schemaname = 'public'
        )
        SELECT
            schemaname || '.' || tablename AS table,
            pg_size_pretty(real_size) AS actual_size,
            pg_size_pretty(extra_size) AS bloat_size,
            round(bloat_ratio::numeric, 2) || '%' AS bloat_ratio
        FROM bloat_info
        WHERE bloat_ratio > 10
        ORDER BY bloat_ratio DESC;
    "
}

# Main maintenance process
main() {
    log "Starting database maintenance..."
    
    check_connection
    analyze_tables
    vacuum_tables
    archive_old_data
    reindex_tables
    update_statistics
    check_bloat
    
    log "Database maintenance completed"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --vacuum-only)
            vacuum_tables
            exit 0
            ;;
        --analyze-only)
            analyze_tables
            exit 0
            ;;
        --archive-only)
            archive_old_data
            exit 0
            ;;
        --check-bloat)
            check_bloat
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
done

# Run main process if no specific command provided
main