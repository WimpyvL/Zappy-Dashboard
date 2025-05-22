# UI Components Library

This document provides an overview of the UI Components Library, a collection of reusable UI components for the Telehealth platform.

## Overview

The UI Components Library is a set of standardized, reusable UI components that provide consistent styling and behavior across the application. These components are designed to be flexible, accessible, and easy to use.

## Components

### StatusBadge

A reusable component for displaying status information with consistent styling.

```jsx
import { StatusBadge } from 'components/ui';

// Basic usage
<StatusBadge status="pending" />

// With custom label
<StatusBadge status="approved" label="Accepted" />

// With icon
<StatusBadge 
  status="rejected" 
  icon={<SomeIcon />} 
/>
```

### Button

A versatile button component with multiple variants, sizes, and states.

```jsx
import { Button } from 'components/ui';

// Basic usage
<Button variant="primary">Submit</Button>

// Different variants
<Button variant="secondary">Cancel</Button>
<Button variant="accent">Highlight</Button>
<Button variant="blue">Info</Button>
<Button variant="green">Success</Button>
<Button variant="danger">Delete</Button>
<Button variant="link">Learn More</Button>

// Different sizes
<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button variant="primary" size="lg">Large</Button>

// With icon
<Button 
  variant="primary" 
  icon={<SomeIcon />}
>
  Add New
</Button>

// Icon on right
<Button 
  variant="blue" 
  iconRight
  icon={<SomeIcon />}
>
  Continue
</Button>

// Icon only
<Button 
  variant="primary" 
  iconOnly
  icon={<SomeIcon />}
/>

// Disabled
<Button variant="primary" disabled>Disabled</Button>
```

### Card

A versatile card component with hover effects, optional accent borders, and header/footer sections.

```jsx
import { Card } from 'components/ui';

// Basic usage
<Card>
  <p>This is a basic card with default styling.</p>
</Card>

// With accent color
<Card accentColor="primary">
  <p>Card with primary accent color</p>
</Card>

// With title
<Card title="Card Title">
  <p>This card has a title in the header section.</p>
</Card>

// With title and action
<Card 
  title="Recent Consultations" 
  action={<Button variant="primary" size="sm">New Consultation</Button>}
>
  <p>This card has both a title and an action button in the header.</p>
</Card>

// With footer
<Card 
  title="Data Summary" 
  footer={true}
  footerContent={<Button variant="link">View All Data</Button>}
>
  <p>This card has a footer section with a link.</p>
</Card>

// Disable hover effect
<Card hover={false}>
  <p>This card does not have the hover animation effect.</p>
</Card>

// Clickable card
<Card 
  onClick={() => alert('Card clicked!')}
  accentColor="accent2"
>
  <p>This entire card is clickable.</p>
</Card>
```

### Table

A reusable table component with enhanced styling, category indicators, and support for loading/empty/error states.

```jsx
import { Table } from 'components/ui';

// Define columns
const columns = [
  {
    title: 'Name',
    key: 'name',
    render: (record) => (
      <div className="font-medium">{record.name}</div>
    )
  },
  {
    title: 'Date',
    key: 'date',
  },
  {
    title: 'Status',
    key: 'status',
    render: (record) => <StatusBadge status={record.status} />
  },
  {
    title: 'Actions',
    render: (record) => (
      <Button variant="blue" size="sm">View</Button>
    )
  }
];

// Basic usage
<Table
  columns={columns}
  data={data}
/>

// With header (title and action)
<Table
  title="Recent Consultations"
  action={<Button variant="primary" size="sm">New Consultation</Button>}
  columns={columns}
  data={data}
/>

// With category styling
<Table
  columns={columns}
  data={data}
  categoryKey="category"
/>

// With row click handler
<Table
  columns={columns}
  data={data}
  onRowClick={handleRowClick}
/>

// With custom footer
<Table
  columns={columns}
  data={data}
  footer={<Pagination />}
/>

// Loading state
<Table
  columns={columns}
  data={[]}
  isLoading={true}
  loadingMessage="Loading data..."
/>

// Empty state
<Table
  columns={columns}
  data={[]}
  emptyMessage="No data available"
/>

// Error state
<Table
  columns={columns}
  data={[]}
  error="Failed to load data"
/>
```

### CategoryIndicator

A simple colored dot indicator for different categories.

```jsx
import { CategoryIndicator } from 'components/ui';

// Basic usage
<CategoryIndicator category="weight-management" />

// With label
<CategoryIndicator 
  category="mental-health" 
  label="Mental Health" 
/>
```

## Usage

To use these components, import them from the UI components library:

```jsx
import { Button, Table, StatusBadge, CategoryIndicator } from 'components/ui';
```

## Examples

You can view examples of all UI components at the [UI Components Library page](/ui-components).

## Best Practices

1. **Consistency**: Use these components consistently throughout the application to maintain a cohesive user experience.
2. **Accessibility**: These components are designed with accessibility in mind. Maintain this by using appropriate ARIA attributes and ensuring keyboard navigation works as expected.
3. **Responsiveness**: The components are responsive by default. Ensure they remain responsive in your implementation.
4. **Customization**: Use the provided props to customize the components rather than applying direct styles.
5. **Documentation**: When creating new components, follow the same documentation pattern as existing components.

## Contributing

When adding new components to the library:

1. Create the component in the `src/components/ui` directory
2. Add styles in a separate CSS file
3. Create an example component in the `src/components/ui/examples` directory
4. Export the component from `src/components/ui/index.js`
5. Update this documentation
