import React from 'react';
import {
  Badge,
  TabButton,
  PageHeader,
  SearchAndFilters,
  ProductTable,
  SubscriptionPlansTable,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  Modal,
  ProductSelectionItem,
} from '@/pages/products/ProductComponents';
import { Filter, Calendar } from 'lucide-react';

export default function ProductComponentsStoryboard() {
  // Sample data for components
  const sampleProducts = [
    {
      id: 'prod_1',
      name: 'Finasteride 1mg',
      type: 'medication',
      description: 'Prescription medication for hair loss treatment',
      price: 49.99,
      active: true,
    },
    {
      id: 'prod_2',
      name: 'Minoxidil 5% Solution',
      type: 'medication',
      description: 'Topical solution for hair regrowth',
      price: 29.99,
      active: true,
    },
    {
      id: 'prod_3',
      name: 'Hair Loss Consultation',
      type: 'service',
      description: 'Initial consultation with a hair loss specialist',
      price: 99.99,
      active: false,
    },
  ];

  const samplePlans = [
    {
      id: 'plan_1',
      name: 'Hair Loss Basic Plan',
      description: 'Monthly supply of finasteride',
      billingFrequency: 'monthly',
      price: 49.99,
      discount: 0,
      active: true,
    },
    {
      id: 'plan_2',
      name: 'Hair Loss Premium Plan',
      description: 'Monthly supply of finasteride and minoxidil',
      billingFrequency: 'monthly',
      price: 79.99,
      discount: 10,
      active: true,
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'medication', label: 'Medications' },
    { value: 'supplement', label: 'Supplements' },
    { value: 'service', label: 'Services' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="bg-white p-4">
      <h1 className="text-2xl font-bold mb-6">Product Components</h1>

      <div className="space-y-8">
        {/* Basic Components */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Basic Components</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="border p-4 rounded-md">
              <h3 className="text-md font-medium mb-2">Badges</h3>
              <div className="flex space-x-2">
                <Badge className="bg-accent1/10 text-accent1">Medication</Badge>
                <Badge className="bg-accent2/10 text-accent2">Supplement</Badge>
                <Badge className="bg-accent4/10 text-accent4">Service</Badge>
              </div>
            </div>

            <div className="border p-4 rounded-md">
              <h3 className="text-md font-medium mb-2">Tab Buttons</h3>
              <div className="flex border-b">
                <TabButton isActive={true} onClick={() => {}}>
                  Products
                </TabButton>
                <TabButton isActive={false} onClick={() => {}}>
                  Subscription Plans
                </TabButton>
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-md mb-4">
            <h3 className="text-md font-medium mb-2">Page Header</h3>
            <PageHeader
              title="Product Management"
              onAddClick={() => console.log('Add clicked')}
              addButtonText="Add Product"
            />
          </div>

          <div className="border p-4 rounded-md">
            <h3 className="text-md font-medium mb-2">Search and Filters</h3>
            <SearchAndFilters
              searchTerm=""
              onSearchChange={() => {}}
              placeholder="Search products..."
              filters={[
                {
                  icon: Filter,
                  value: 'all',
                  onChange: () => {},
                  options: filterOptions,
                },
                {
                  icon: Calendar,
                  value: 'all',
                  onChange: () => {},
                  options: statusOptions,
                },
              ]}
            />
          </div>
        </section>

        {/* Tables */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Tables</h2>

          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Product Table</h3>
            <ProductTable
              products={sampleProducts}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">
              Subscription Plans Table
            </h3>
            <SubscriptionPlansTable
              plans={samplePlans}
              onEdit={() => {}}
              onDelete={() => {}}
              getProductNameById={(id) => `Product ${id}`}
            />
          </div>
        </section>

        {/* Form Components */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Form Components</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded-md">
              <FormInput
                label="Product Name"
                name="name"
                value="Finasteride 1mg"
                onChange={() => {}}
                placeholder="Enter product name"
                required
              />

              <FormSelect
                label="Product Type"
                name="type"
                value="medication"
                onChange={() => {}}
                options={[
                  { value: 'medication', label: 'Medication' },
                  { value: 'supplement', label: 'Supplement' },
                  { value: 'service', label: 'Service' },
                ]}
                required
              />
            </div>

            <div className="border p-4 rounded-md">
              <FormTextarea
                label="Description"
                name="description"
                value="Prescription medication for hair loss treatment"
                onChange={() => {}}
                rows={3}
                placeholder="Enter product description"
              />

              <FormCheckbox
                label="Active"
                name="active"
                checked={true}
                onChange={() => {}}
              />
            </div>
          </div>
        </section>

        {/* Modal and Selection Items */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Modal and Selection Items
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4 rounded-md">
              <h3 className="text-md font-medium mb-2">Modal (Preview)</h3>
              <div className="border border-dashed p-4 rounded-md bg-gray-50">
                <p className="text-sm text-gray-600">
                  Modal component would appear here when opened
                </p>
              </div>
            </div>

            <div className="border p-4 rounded-md">
              <h3 className="text-md font-medium mb-2">
                Product Selection Items
              </h3>
              <div className="space-y-2">
                {sampleProducts.map((product, index) => (
                  <ProductSelectionItem
                    key={product.id}
                    product={product}
                    isSelected={index === 0}
                    onSelect={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
