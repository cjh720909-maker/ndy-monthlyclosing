# Tab Module Implementation Guide

This guide explains how to implement the "Single Menu, Multi-Tab" structure used in the NDY Monthly Closing application. This pattern allows a single sidebar menu to open a dashboard that automatically launches multiple feature tabs, maintaining their state (Keep-Alive) without unmounting.

## Core Components

### 1. Tab Context (`src/context/TabContext.tsx`)
Manages the global state of tabs (list of open tabs, active tab ID).
- **Key Functions**: `openTab`, `closeTab`, `setActiveTabId`.
- **State**: `tabs` array, `activeTabId`.

### 2. Tab Manager (`src/components/TabManager.tsx`)
Renders the tab navigation bar and the content of all open tabs.
- **Key Feature**: Uses `display: none` for inactive tabs instead of unmounting them. This preserves the state (input values, scroll position) of each tab.
- **Integration**: Placed in the main layout (e.g., `AppShell` or `layout.tsx`) to wrap the content area.

## Implementation Steps

### Step 1: Sidebar Configuration
Instead of listing every feature in the sidebar, create a single "Module" menu item.
```tsx
// Sidebar.tsx
const menuItems = [
  { 
    id: 'monthly-closing', 
    name: 'Monthly Closing', 
    component: <DashboardPage /> 
  }
];
```

### Step 2: Dashboard Page (`src/app/monthly-closing/page.tsx`)
Create a dashboard component that serves as the controller for the module.
1. **Define Features**: List all sub-features (components) that belong to this module.
2. **Auto-Open Logic**: Use `useEffect` to open all tabs when the dashboard mounts.

```tsx
// DashboardPage.tsx
export default function DashboardPage() {
  const { openTab, setActiveTabId } = useTabs();
  
  const features = [
    { id: 'feature-1', name: 'Feature 1', component: <Feature1 /> },
    { id: 'feature-2', name: 'Feature 2', component: <Feature2 /> },
    // ...
  ];

  useEffect(() => {
    // 1. Open all tabs
    features.forEach(f => openTab(f.id, f.name, f.component));
    
    // 2. Set the first tab as active
    setTimeout(() => {
        if (features.length > 0) setActiveTabId(features[0].id);
    }, 50);
  }, []);

  return <div>Loading Module...</div>; // Or a dashboard UI
}
```

## Benefits
- **Clean Navigation**: Reduces sidebar clutter by grouping related features.
- **State Persistence**: Users can switch between sub-features without losing data.
- **Scalability**: Easy to merge into larger systems as a self-contained module.
