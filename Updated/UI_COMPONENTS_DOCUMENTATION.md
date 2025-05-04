# UI Components Documentation

This document provides an overview of the redesigned UI components created for the Zappy Health patient interface.

## Core Components

### 1. PriorityActionCard

A card component with a yellow background and blue accent line to highlight important tasks.

**Props:**
- `title`: The title of the card
- `description`: The description or subtitle of the card
- `actionText`: The text for the action button
- `onAction`: The function to call when the action button is clicked
- `icon`: Optional icon to display before the title
- `children`: Optional children to render inside the card

**Example Usage:**
```jsx
<PriorityActionCard
  title="Take your meds today"
  description="Semaglutide - due by 8:00 PM"
  actionText="Mark Done"
  onAction={() => handleMedicationTaken()}
  icon={<Check className="h-4 w-4 text-white" />}
/>
```

### 2. StatusBadge

A badge component for displaying status indicators with different color variants.

**Props:**
- `status`: The status to display (active, todo, done, or custom text)
- `variant`: The color variant (success, warning, info, purple, or gray)
- `icon`: Optional icon to display before the text

**Example Usage:**
```jsx
<StatusBadge status="active" variant="success" />
<StatusBadge status="todo" variant="warning" />
<StatusBadge status="done" variant="info" />
```

### 3. TreatmentCard

A card component for displaying treatment information with color-coded headers based on treatment type.

**Props:**
- `type`: The treatment type ('weight' or 'hair')
- `title`: The title of the treatment
- `subtitle`: The subtitle or description of the treatment
- `status`: The status of the treatment (active, paused, etc.)
- `nextTask`: The next task for this treatment (with title and description)
- `details`: Array of detail objects with label and value
- `primaryAction`: The primary action button (with text and onClick)
- `secondaryAction`: The secondary action button (with text and onClick)
- `resourceLinks`: Array of resource link objects (with icon, text, and onClick)

**Example Usage:**
```jsx
<TreatmentCard
  type="weight"
  title="Semaglutide 0.5mg"
  subtitle="Weekly injection for weight management"
  status="active"
  nextTask={{
    title: "Next dose: Today by 8:00 PM",
    description: "Take your medication on time for best results"
  }}
  details={[
    { label: "Dosage", value: "0.5mg weekly injection" },
    { label: "Storage", value: "Refrigerate (36-46°F)" }
  ]}
  primaryAction={{
    text: "Check-in",
    onClick: () => handleCheckIn('weight')
  }}
  secondaryAction={{
    text: "Message",
    onClick: () => handleMessageProvider('weight')
  }}
  resourceLinks={[
    {
      icon: <FileText className="h-4 w-4 text-blue-600" />,
      text: "Medication Guide",
      onClick: () => showModal('weight-instructions')
    }
  ]}
/>
```

### 4. TabNavigation

A component for within-page tab navigation.

**Props:**
- `tabs`: Array of tab objects with id, label, and optional icon
- `activeTab`: The ID of the currently active tab
- `onTabChange`: Function to call when a tab is clicked
- `variant`: The style variant ('underline' or 'pills')

**Example Usage:**
```jsx
<TabNavigation
  tabs={[
    { id: 'treatments', label: 'Treatments', icon: <Pill className="h-4 w-4" /> },
    { id: 'notes', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'insights', label: 'Insights', icon: <Info className="h-4 w-4" /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### 5. BottomNavigation

A fixed bottom navigation bar with 5 main sections: Home, Care, Programs, Shop, and Learn.

**Props:**
- `activePage`: The currently active page
- `notifications`: Object with notification counts for each section

**Example Usage:**
```jsx
<BottomNavigation 
  activePage="care"
  notifications={{
    home: 0,
    care: 2,
    programs: 0,
    shop: 0,
    learn: 1
  }}
/>
```

### 6. ProductCard

A card component for displaying product information in the Shop page and cross-sell sections.

**Props:**
- `title`: The product title
- `description`: The product description
- `imageUrl`: URL to the product image
- `price`: The product price
- `originalPrice`: The original price (for displaying discounts)
- `badge`: Optional badge text (e.g., "Works with Wegovy®")
- `badgeVariant`: The color variant for the badge
- `tag`: Optional tag text (e.g., "Weight", "Hair")
- `tagVariant`: The color variant for the tag
- `onAddToCart`: Function to call when the Add button is clicked
- `onViewDetails`: Function to call when the product card is clicked for details

**Example Usage:**
```jsx
<ProductCard
  title="Tirzepatide"
  description="New weight management medication with dual hormone action"
  imageUrl="https://example.com/tirzepatide.jpg"
  price={199.99}
  originalPrice={249.99}
  badge="New"
  badgeVariant="success"
  tag="Weight"
  tagVariant="weight"
  onAddToCart={() => handleAddProduct({name: 'Tirzepatide'})}
  onViewDetails={() => navigate('/marketplace/tirzepatide')}
/>
```

### 7. ReferralBanner

A banner component for displaying referral promotions.

**Props:**
- `title`: The main title text
- `subtitle`: The subtitle or description text
- `buttonText`: The text for the action button
- `onButtonClick`: Function to call when the button is clicked
- `icon`: Optional icon to display
- `referralCount`: Optional number of successful referrals to display

**Example Usage:**
```jsx
<ReferralBanner
  title="Share with a buddy, get $20 credit"
  subtitle="Invite friends to join Zappy Health."
  buttonText="Invite"
  onButtonClick={handleReferral}
  referralCount={3}
  icon={<Plus className="h-5 w-5 text-[#2D7FF9]" />}
/>
```

### 8. MessagePreviewCard

A card component for displaying message previews on the home page.

**Props:**
- `senderName`: The name of the message sender
- `messagePreview`: A preview of the message content
- `timeAgo`: How long ago the message was sent (e.g., "Yesterday", "2 hours ago")
- `senderIcon`: Optional icon representing the sender
- `onClick`: Function to call when the card is clicked

**Example Usage:**
```jsx
<MessagePreviewCard
  senderName="Dr. Sarah Smith"
  messagePreview="Your recent lab results look good. Your cholesterol levels have improved significantly."
  timeAgo="2 hours ago"
  senderIcon={<User className="h-5 w-5 text-blue-600" />}
  onClick={handleMessageClick}
/>
```

## Implementation

These components have been implemented in the PatientServicesPageV3.jsx file as a demonstration of the redesigned UI. The page now features:

1. A modern, clean design with consistent typography
2. Color-coded treatment cards for different treatment types
3. Priority action cards for important tasks
4. A bottom navigation bar for easy access to main sections
5. Improved product cards with badges and tags
6. A referral banner to encourage user engagement

## Design System

The redesigned components follow a consistent design system with the following color palette:

- Primary Blue: #2D7FF9
- Success Green: #10b981
- Warning Yellow: #FFD100
- Purple: #8b5cf6
- Gray: #4b5563

Typography is consistent across components with appropriate sizing for different elements:
- Headings: font-bold, text-lg or text-xl
- Body text: text-sm
- Small text: text-xs

Spacing is consistent with appropriate margins and padding to create a clean, organized layout.

## Next Steps

To further enhance the UI, consider:

1. Creating additional components for other common UI patterns
2. Implementing dark mode support
3. Adding animations for transitions between states
4. Creating a comprehensive style guide for the design system
