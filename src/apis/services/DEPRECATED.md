# DEPRECATED: Services API

## Deprecation Notice

The Services functionality has been consolidated into the unified Products & Subscriptions management system. This API is maintained for backward compatibility but should not be used in new code.

## Migration Path

New code should use the following APIs instead:

- For services: `src/apis/services/hooks.js` (same API, but accessed through the unified management page)
- For categories: `src/apis/categories/hooks.js`

## Timeline

- **Phase 1 (Current)**: Services UI removed, routes redirected to Products & Subscriptions
- **Phase 2**: Update any components that directly use the Services API to use the unified system
- **Phase 3**: Complete removal of standalone Services components

## Documentation

For more information about the migration, see `Updated/PRODUCTS_SERVICES_MIGRATION.md`.
