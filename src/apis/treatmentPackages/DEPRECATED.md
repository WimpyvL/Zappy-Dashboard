# DEPRECATED: Treatment Packages API

## Deprecation Notice

The Treatment Packages functionality has been consolidated into the unified Products & Subscriptions management system. This API is maintained for backward compatibility but should not be used in new code.

## Migration Path

New code should use the following APIs instead:

- For subscription plans: `src/apis/subscriptionPlans/hooks.js`
- For categories: `src/apis/categories/hooks.js`
- For products: `src/apis/products/hooks.js`

## Timeline

- **Phase 1 (Current)**: Treatment Packages UI removed, routes redirected to Products & Subscriptions
- **Phase 2**: Update patient-facing components to use the new APIs
- **Phase 3**: Complete removal of Treatment Packages API and components

## Documentation

For more information about the migration, see `Updated/TREATMENT_PACKAGES_MIGRATION.md`.
