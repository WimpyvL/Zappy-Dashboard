# Webhook Handler Monitoring Guide

This document describes the monitoring setup for the Stripe webhook handler.

## Quick Start

1. Initialize monitoring:
```bash
./scripts/monitoring.sh init
```

2. View dashboards:
```bash
./scripts/monitoring.sh urls
```

3. Check status:
```bash
./scripts/monitoring.sh check
```

## Monitoring Stack

### Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards
- **Alertmanager**: Alert routing and notifications
- **Loki**: Log aggregation
- **Jaeger**: Distributed tracing
- **Node Exporter**: System metrics

### Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Webhook    │───▶│  Prometheus  │───▶│   Grafana    │
└──────────────┘    └──────────────┘    └──────────────┘
       │                    │                   │
       │                    ▼                   │
       │            ┌──────────────┐           │
       └──────────▶│ Alertmanager │◀──────────┘
                   └──────────────┘
                          │
                          ▼
                   Notifications
                 (Email, Slack, etc.)
```

## Available Metrics

### Request Metrics

- `webhook_requests_total`: Total number of requests
- `webhook_errors_total`: Total number of errors
- `webhook_request_duration_seconds`: Request latency
- `webhook_concurrent_requests`: Current concurrent requests

### Event Processing

- `webhook_events_processed_total`: Total events processed
- `webhook_event_processing_duration_seconds`: Processing time
- `webhook_events_by_type_total`: Events by type
- `webhook_queue_size`: Event queue size

### Performance

- `webhook_memory_usage_bytes`: Memory usage
- `webhook_cpu_usage_percent`: CPU usage
- `webhook_db_connections`: Database connections
- `webhook_db_query_duration_seconds`: Query duration

### Cache

- `webhook_cache_hits_total`: Cache hits
- `webhook_cache_misses_total`: Cache misses
- `webhook_cache_operation_duration_seconds`: Cache operation latency

### Security

- `webhook_signature_failures_total`: Invalid signatures
- `webhook_rate_limited_total`: Rate limited requests

## Dashboards

### Overview Dashboard

- Request rate and errors
- Response time percentiles
- Queue size and processing time
- Resource usage gauges

### Performance Dashboard

- Latency heatmaps
- Resource usage trends
- Database performance
- Cache effectiveness

### Event Dashboard

- Event type distribution
- Processing success rate
- Event volume trends
- Queue metrics

## Alerting

### Critical Alerts

- High error rate (>10% for 5m)
- High latency (p95 > 1s for 5m)
- Database connection issues
- Cache connection issues

### Warning Alerts

- Increased error rate (>5% for 15m)
- Elevated latency (p95 > 500ms for 15m)
- High memory usage (>85%)
- High CPU usage (>75%)

### Notification Channels

- **Critical**: Email, Slack, PagerDuty
- **Warning**: Email, Slack
- **Info**: Slack only

## Maintenance

### Daily Tasks

1. Check monitoring status:
```bash
./scripts/monitoring.sh check
```

2. View latest metrics:
```bash
./scripts/monitoring.sh metrics
```

3. Generate report:
```bash
./scripts/monitoring.sh report
```

### Weekly Tasks

1. Backup monitoring data:
```bash
./scripts/monitoring.sh backup
```

2. Update dashboards:
```bash
./scripts/monitoring.sh update
```

### Monthly Tasks

1. Review alert history
2. Adjust thresholds if needed
3. Update documentation

## Troubleshooting

### Common Issues

1. Missing metrics:
   ```bash
   # Check Prometheus targets
   curl http://localhost:9090/api/v1/targets
   ```

2. Alert not firing:
   ```bash
   # Check alert rules
   curl http://localhost:9090/api/v1/rules
   ```

3. Dashboard not updating:
   ```bash
   # Reload Grafana dashboards
   ./scripts/monitoring.sh update
   ```

### Recovery Actions

1. Reset monitoring stack:
   ```bash
   ./scripts/monitoring.sh reset
   ```

2. Restore from backup:
   ```bash
   ./scripts/monitoring.sh restore backup_20250524.tar.gz
   ```

## Best Practices

1. **Metrics**
   - Use consistent naming
   - Include relevant labels
   - Keep cardinality under control

2. **Alerts**
   - Set appropriate thresholds
   - Include clear descriptions
   - Define proper severity levels

3. **Dashboards**
   - Group related metrics
   - Use consistent time ranges
   - Include documentation

4. **Maintenance**
   - Regular backups
   - Periodic review of alerts
   - Update documentation

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)
- [Monitoring Best Practices](https://sre.google/sre-book/monitoring-distributed-systems/)