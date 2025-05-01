// utils/supabase/batchedQueries.js
import { supabase } from '../../lib/supabase';

/**
 * Execute multiple Supabase queries in parallel with proper error handling
 * @param {Array} queries - Array of query configuration objects
 * @param {Object} options - Options for batch execution
 * @returns {Object} - Object with results for each query
 * 
 * @example
 * const results = await executeBatchedQueries([
 *   {
 *     key: 'services',
 *     query: () => supabase.from('services').select('*')
 *   },
 *   {
 *     key: 'products',
 *     query: () => supabase.from('products').select('*')
 *   }
 * ]);
 * 
 * // Access results
 * const services = results.services.data;
 * const products = results.products.data;
 */
export const executeBatchedQueries = async (queries, options = {}) => {
  const { 
    abortEarly = false, // Whether to abort all remaining queries if one fails
    logErrors = true    // Whether to log errors to console
  } = options;

  // Prepare results object
  const results = {};
  
  try {
    // Create an array of promises to execute in parallel
    const queryPromises = queries.map(async ({ key, query }) => {
      try {
        const result = await query();
        return { key, result };
      } catch (error) {
        if (logErrors) {
          console.error(`Error executing batched query for key "${key}":`, error);
        }
        if (abortEarly) {
          throw error;
        }
        return { key, result: { data: null, error } };
      }
    });
    
    // Execute all queries in parallel
    const queryResults = await Promise.all(queryPromises);
    
    // Process results
    queryResults.forEach(({ key, result }) => {
      results[key] = result;
    });
    
    return results;
  } catch (error) {
    if (logErrors) {
      console.error('Batched query execution aborted:', error);
    }
    throw error;
  }
};

/**
 * Efficiently fetch entities along with related entities in a single batch
 * @param {Object} config - Configuration for the entity fetch
 * @param {string} config.primaryTable - The main table to query
 * @param {string[]} config.primaryIds - Array of IDs to fetch
 * @param {Object[]} config.relations - Array of relation configurations
 * @returns {Object} - Object with primary entities and their related data
 * 
 * @example
 * const result = await fetchEntitiesWithRelations({
 *   primaryTable: 'services',
 *   primaryIds: ['1', '2', '3'],
 *   relations: [
 *     {
 *       table: 'service_products',
 *       foreignKey: 'service_id',
 *       select: 'product_id, price'
 *     },
 *     {
 *       table: 'service_plans',
 *       foreignKey: 'service_id',
 *       select: 'plan_id, duration'
 *     }
 *   ]
 * });
 */
export const fetchEntitiesWithRelations = async ({
  primaryTable,
  primaryIds,
  relations,
  primarySelect = '*',
  orderBy = { column: 'created_at', ascending: false }
}) => {
  if (!primaryIds || !primaryIds.length) {
    return { 
      primary: [], 
      relations: {} 
    };
  }

  const queries = [
    {
      key: 'primary',
      query: () => supabase
        .from(primaryTable)
        .select(primarySelect)
        .in('id', primaryIds)
        .order(orderBy.column, { ascending: orderBy.ascending })
    },
    ...relations.map(relation => ({
      key: relation.table,
      query: () => supabase
        .from(relation.table)
        .select(relation.select || '*')
        .in(relation.foreignKey, primaryIds)
    }))
  ];

  const results = await executeBatchedQueries(queries);

  // Process relations into a more usable format
  const relationsByPrimaryId = {};
  
  primaryIds.forEach(id => {
    relationsByPrimaryId[id] = {};
    relations.forEach(relation => {
      relationsByPrimaryId[id][relation.table] = [];
    });
  });

  // Group related entities by their primary ID
  relations.forEach(relation => {
    const relatedEntities = results[relation.table].data || [];
    relatedEntities.forEach(entity => {
      const primaryId = entity[relation.foreignKey];
      if (relationsByPrimaryId[primaryId]) {
        relationsByPrimaryId[primaryId][relation.table].push(entity);
      }
    });
  });

  return {
    primary: results.primary.data || [],
    relations: relationsByPrimaryId
  };
};

/**
 * Batch fetches multiple resources by their IDs across different tables
 * @param {Object} resources - Object with table names as keys and arrays of IDs as values
 * @returns {Object} - Object with table names as keys and arrays of entities as values
 * 
 * @example
 * const result = await batchFetchResources({
 *   patients: ['1', '2', '3'],
 *   providers: ['101', '102'],
 *   services: ['201', '202', '203']
 * });
 * 
 * // Access results
 * const patients = result.patients;
 * const providers = result.providers;
 */
export const batchFetchResources = async (resources) => {
  const queries = Object.entries(resources).map(([table, ids]) => ({
    key: table,
    query: () => supabase
      .from(table)
      .select('*')
      .in('id', ids)
  }));

  const results = await executeBatchedQueries(queries);
  
  // Simplify the results structure by directly providing the data arrays
  const simplifiedResults = {};
  Object.keys(results).forEach(key => {
    simplifiedResults[key] = results[key].data || [];
  });
  
  return simplifiedResults;
};