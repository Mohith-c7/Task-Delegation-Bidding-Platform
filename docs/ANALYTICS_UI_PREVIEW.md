# Analytics Dashboard UI Preview

## Dashboard Analytics Page (`/analytics`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TaskHub    📊 Dashboard  📝 My Tasks  💰 My Bids  📈 Analytics  🎯 My Performance │
│                                                          John Doe | Logout   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Analytics Dashboard                          [Last 30 days ▼]              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Tasks  │  Open Tasks  │  Completed   │  Total Bids  │
│     150      │      25      │     100      │     450      │
│ 66.7% rate   │  Available   │  Finished    │  48.5h avg   │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────┬─────────────────────────────────────┐
│  Task Trends                        │  Tasks by Priority                  │
│                                     │                                     │
│  ╭─────────────────────────────╮   │         ╭─────────╮                │
│  │     ╱╲    ╱╲                │   │        ╱           ╲               │
│  │    ╱  ╲  ╱  ╲    ╱╲         │   │       │  Low: 30    │              │
│  │   ╱    ╲╱    ╲  ╱  ╲        │   │       │  Med: 60    │              │
│  │  ╱            ╲╱    ╲       │   │       │  High: 40   │              │
│  │ ╱                    ╲      │   │       │  Crit: 20   │              │
│  │╱                      ╲     │   │        ╲           ╱               │
│  ╰─────────────────────────────╯   │         ╰─────────╯                │
│  ─ Created  ─ Completed            │                                     │
└─────────────────────────────────────┴─────────────────────────────────────┘

┌─────────────────────────────────────┬─────────────────────────────────────┐
│  Tasks by Status                    │  Top Skills in Demand               │
│                                     │                                     │
│         ╭─────────╮                │  React      ████████████ 35        │
│        ╱           ╲               │  Node.js    ██████████ 28          │
│       │  Open: 25   │              │  Python     ████████ 22            │
│       │  Assigned:10│              │  Go         ██████ 18              │
│       │  Progress:15│              │  TypeScript █████ 15               │
│       │  Done: 100  │              │                                     │
│        ╲           ╱               │  ■ Tasks  ■ Bids                   │
│         ╰─────────╯                │                                     │
└─────────────────────────────────────┴─────────────────────────────────────┘

┌─────────────────────────────────────┬─────────────────────────────────────┐
│  Top Bidders                        │  Top Task Owners                    │
│                                     │                                     │
│  Name        Bids  Success  Done   │  Name        Posted  Done  Avg Bids│
│  ─────────────────────────────────  │  ─────────────────────────────────  │
│  John Doe     50    70.0%    30    │  Jane Smith    45     40     3.2   │
│  Alice Lee    45    75.5%    28    │  Bob Wilson    38     35     2.8   │
│  Bob Chen     40    68.0%    25    │  Carol Davis   32     30     3.5   │
│  Sarah Kim    38    72.0%    24    │  Dave Brown    28     25     2.9   │
│  Mike Jones   35    65.0%    20    │  Eve Taylor    25     22     3.1   │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

## Personal Analytics Page (`/my-analytics`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TaskHub    📊 Dashboard  📝 My Tasks  💰 My Bids  📈 Analytics  🎯 My Performance │
│                                                          John Doe | Logout   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  My Performance                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                    Overall Performance Score                                 │
│                                                                              │
│                              76.5%                                           │
│                                                                              │
│                  Based on success rate and on-time delivery                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Tasks Posted │ Bids Placed  │ Success Rate │ On-Time Rate │
│      20      │      30      │    60.0%     │    83.3%     │
│ 15 completed │   18 won     │ Bid approval │  Delivered   │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────┬─────────────────────────────────────┐
│  As Task Owner                      │  As Bidder                          │
│                                     │                                     │
│  Total Tasks Posted        20       │  Total Bids Placed         30       │
│  Tasks Completed           15       │  Bids Won                  18       │
│  Completion Rate         75.0%      │  Win Rate                60.0%      │
│                                     │  Avg Completion Time     45.5h      │
└─────────────────────────────────────┴─────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  Performance Insights                                                        │
│                                                                              │
│  ✓ Reliable Delivery!                                                       │
│    You consistently deliver tasks on time. Task owners trust you!           │
│                                                                              │
│  ⚠ Room for Improvement                                                     │
│    Consider improving your bid proposals to increase your success rate.     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

### Summary Cards
- **Total Tasks**: Gray background, blue accent
- **Open Tasks**: Blue background
- **Completed Tasks**: Green background
- **Total Bids**: Purple background

### Charts
- **Task Trends Line Chart**:
  - Created: Blue line (rgb(59, 130, 246))
  - Completed: Green line (rgb(34, 197, 94))

- **Priority Doughnut Chart**:
  - Low: Green (rgba(34, 197, 94, 0.8))
  - Medium: Blue (rgba(59, 130, 246, 0.8))
  - High: Orange (rgba(251, 146, 60, 0.8))
  - Critical: Red (rgba(239, 68, 68, 0.8))

- **Status Doughnut Chart**:
  - Open: Blue
  - Assigned: Orange
  - In Progress: Purple
  - Completed: Green
  - Closed: Gray

- **Skill Demand Bar Chart**:
  - Tasks: Blue bars
  - Bids: Green bars

### Performance Indicators
- **Excellent (≥70%)**: Green with checkmark ✓
- **Good (50-69%)**: Blue with info icon ℹ
- **Needs Improvement (<50%)**: Yellow with warning ⚠

## Responsive Design

### Desktop (≥1024px)
- 4 columns for summary cards
- 2 columns for charts
- Full-width tables

### Tablet (768px - 1023px)
- 2 columns for summary cards
- 1 column for charts
- Scrollable tables

### Mobile (<768px)
- 1 column for all elements
- Stacked layout
- Touch-friendly controls
- Horizontal scroll for tables

## Interactive Elements

### Time Range Selector
```
[Last 7 days ▼]  [Last 30 days ▼]  [Last 90 days ▼]  [Last year ▼]
```

### Hover Effects
- Cards: Slight elevation on hover
- Chart points: Show exact values
- Table rows: Highlight on hover
- Buttons: Color transition

### Loading States
```
┌─────────────────────────────────────┐
│                                     │
│         Loading analytics...        │
│                                     │
└─────────────────────────────────────┘
```

### Error States
```
┌─────────────────────────────────────┐
│                                     │
│    ⚠ Failed to load analytics      │
│                                     │
└─────────────────────────────────────┘
```

## Accessibility Features

- **ARIA Labels**: All charts and interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Descriptive text for all metrics
- **Color Contrast**: WCAG AA compliant
- **Focus Indicators**: Clear focus states
- **Alt Text**: Descriptive labels for visual elements

## Animation & Transitions

- **Chart Animations**: Smooth entry animations (0.5s)
- **Card Hover**: Scale transform (0.2s)
- **Page Transitions**: Fade in (0.3s)
- **Data Updates**: Smooth value transitions

## Mobile Optimizations

- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for chart navigation
- Optimized chart sizes for small screens
- Collapsible sections for better space usage
- Bottom navigation for easy thumb access
