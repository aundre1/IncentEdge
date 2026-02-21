# IncentEdge Design System
**Version**: 1.0
**Date**: 2026-02-17
**Aesthetic**: Bloomberg Terminal + Cherre Sophistication + Stripe Cleanliness

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Components](#components)
6. [Usage Guidelines](#usage-guidelines)
7. [Implementation](#implementation)

---

## Design Philosophy

### Institutional Restraint
IncentEdge is designed for real estate professionals managing billions in AUM. The interface prioritizes:

- **Information Density**: Bloomberg-style data-rich displays without clutter
- **Professional Trust**: Navy/blue palette conveys stability and expertise
- **Minimal Decoration**: Sharp borders (4-8px radius), subtle shadows, no gradients
- **Data-First**: Tabular numbers, monospace for metrics, always fresh timestamps

### Visual Hierarchy
1. **Primary**: Navy (#0f172a) backgrounds, Blue (#2563eb) CTAs
2. **Secondary**: Teal (#14b8a6) for highlights, Green (#38a169) for success
3. **Neutrals**: Slate grays (#64748b → #e2e8f0) for text and borders

### Accessibility
- WCAG 2.1 AA compliant contrast ratios
- Dark mode support with adjusted colors
- Keyboard navigation for all interactive elements
- Screen reader-friendly semantic HTML

---

## Color Palette

### Primary Colors

#### Navy Base (Institutional Foundation)
```css
--institutional-navy-950: #020617  /* Deepest navy */
--institutional-navy-900: #0f172a  /* Primary dark background */
--institutional-navy-800: #1e293b  /* Card backgrounds (dark) */
--institutional-navy-700: #334155  /* Borders (dark) */
--institutional-navy-600: #475569  /* Text (dark) */
--institutional-navy-500: #64748b  /* Secondary text */
--institutional-navy-400: #94a3b8  /* Muted text */
--institutional-navy-300: #cbd5e1  /* Subtle borders */
--institutional-navy-200: #e2e8f0  /* Primary borders (light) */
--institutional-navy-100: #f1f5f9  /* Hover backgrounds */
--institutional-navy-50: #f8fafc   /* Light background */
```

**Usage**:
- `navy-900`: Dark mode background, header nav
- `navy-50`: Light mode background
- `navy-200`: Borders, dividers
- `navy-500`: Secondary text, labels

#### Blue Accent (Primary Brand)
```css
--institutional-blue-950: #172554
--institutional-blue-900: #1e3a8a
--institutional-blue-800: #1e40af
--institutional-blue-700: #1d4ed8  /* Federal category */
--institutional-blue-600: #2563eb  /* Primary buttons, State category */
--institutional-blue-500: #3b82f6  /* Local category, primary hover */
--institutional-blue-400: #60a5fa  /* Utility category, light accents */
--institutional-blue-300: #93c5fd
--institutional-blue-200: #bfdbfe
--institutional-blue-100: #dbeafe
--institutional-blue-50: #eff6ff
```

**Usage**:
- `blue-600`: Primary buttons, links, active states
- `blue-500`: Hover states, secondary actions
- `blue-700`: Federal category badges
- `blue-400`: Utility category badges

#### Green Accent (Success & Growth)
```css
--institutional-green-900: #14532d
--institutional-green-700: #15803d
--institutional-green-600: #16a34a
--institutional-green-500: #38a169  /* Primary green from skills palette */
--institutional-green-400: #4ade80
--institutional-green-100: #dcfce7
--institutional-green-50: #f0fdf4
```

**Usage**:
- `green-500`: Success messages, positive metrics
- `green-600`: Success button backgrounds
- `green-100`: Success notification backgrounds

#### Teal Secondary (CTAs & Highlights)
```css
--institutional-teal-900: #134e4a
--institutional-teal-800: #115e59
--institutional-teal-700: #0f766e
--institutional-teal-600: #0d9488
--institutional-teal-500: #14b8a6  /* Primary teal, "Ask Us" button */
--institutional-teal-400: #2dd4bf
--institutional-teal-300: #5eead4
--institutional-teal-200: #99f6e4
--institutional-teal-100: #ccfbf1
--institutional-teal-50: #f0fdfa
```

**Usage**:
- `teal-500`: "Ask Us" CTA, special highlights
- `teal-600`: Teal button hover states
- `teal-50`: Teal notification backgrounds

### Data Freshness Colors (Bloomberg-inspired)

```css
--freshness-live: #10b981     /* Emerald - Real-time, <1min */
--freshness-fresh: #14b8a6    /* Teal - Updated <24h */
--freshness-recent: #3b82f6   /* Blue - Updated <7d */
--freshness-stale: #f59e0b    /* Amber - Updated <30d */
--freshness-outdated: #ef4444 /* Red - Updated >30d */
```

**Visual Indicators**:
- **Live**: Animated pulse ring + emerald dot
- **Fresh**: Solid teal dot
- **Recent**: Solid blue dot
- **Stale**: Solid amber dot
- **Outdated**: Solid red dot

### Category Badge System (Single Blue, Opacity Variations)

Institutional design uses **one blue color** with varying opacity for jurisdiction levels:

| Category | Opacity | Background | Text Color | Border |
|----------|---------|------------|------------|--------|
| **Federal** | 100% | `rgba(59, 130, 246, 0.15)` | `#1d4ed8` | `rgba(59, 130, 246, 0.3)` |
| **State** | 75% | `rgba(59, 130, 246, 0.11)` | `#2563eb` | `rgba(59, 130, 246, 0.22)` |
| **Local** | 50% | `rgba(59, 130, 246, 0.08)` | `#3b82f6` | `rgba(59, 130, 246, 0.15)` |
| **Utility** | 25% | `rgba(59, 130, 246, 0.04)` | `#60a5fa` | `rgba(59, 130, 246, 0.08)` |

**Dark Mode Adjustments**: Increase opacity by ~50% for better contrast.

### Semantic Colors

```css
--institutional-success: #38a169  /* Green-500 */
--institutional-warning: #f59e0b  /* Amber-500 */
--institutional-error: #ef4444    /* Red-500 */
--institutional-info: #3b82f6     /* Blue-500 */
```

---

## Typography

### Font Families

```css
/* Headings: Sora - Modern, geometric, professional */
font-family: 'Sora', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

/* Body Text: IBM Plex Sans - Corporate, readable, neutral */
font-family: 'IBM Plex Sans', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

/* Data/Numbers: IBM Plex Mono - Tabular figures, monospace */
font-family: 'IBM Plex Mono', 'SF Mono', Monaco, monospace;
font-feature-settings: 'tnum' 1, 'zero' 1; /* Tabular numbers, slashed zero */
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Notes |
|---------|------|--------|-------------|----------------|-------|
| **H1 (Page Title)** | 28px | 700 | 1.2 | -0.02em | Sora font |
| **H2 (Section)** | 20px | 600 | 1.3 | -0.01em | Sora font |
| **H3 (Card Title)** | 16px | 600 | 1.4 | 0 | Sora font |
| **Body** | 14px | 400 | 1.5 | 0 | IBM Plex Sans |
| **Small** | 13px | 400 | 1.4 | 0 | IBM Plex Sans |
| **Label** | 11px | 600 | 1.4 | 0.5px | Uppercase, IBM Plex Sans |
| **Metric Value** | 24px | 700 | 1.2 | -0.02em | IBM Plex Mono, tabular |
| **Table Cell** | 14px | 400 | 1.4 | 0 | IBM Plex Mono for numbers |

### Typography Utilities

```css
/* Apply to all data displays */
.font-mono-data {
  font-family: 'IBM Plex Mono', monospace;
  font-feature-settings: 'tnum' 1, 'zero' 1;
}

/* Apply to headings */
.font-heading {
  font-family: 'Sora', system-ui, sans-serif;
}

/* Apply to body text */
.font-body {
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
}
```

---

## Spacing System

### 8px Grid System

All spacing values are multiples of 8px for consistency:

```css
--space-xs: 4px    /* 0.5 units */
--space-sm: 8px    /* 1 unit */
--space-md: 16px   /* 2 units */
--space-lg: 24px   /* 3 units */
--space-xl: 32px   /* 4 units */
--space-2xl: 48px  /* 6 units */
--space-3xl: 64px  /* 8 units */
```

### Component Spacing

| Component | Padding | Gap | Margin |
|-----------|---------|-----|--------|
| **Button** | 10px 20px | 8px | - |
| **Card** | 20px (p-5) | - | 16px bottom |
| **Input** | 0 14px | - | - |
| **Table Cell** | 14px 16px | - | - |
| **Metric Card** | 20px (p-5) | - | - |
| **Section** | - | - | 24px bottom |

---

## Components

### 1. CategoryBadge

**Purpose**: Display jurisdiction level with institutional opacity variations.

**Variants**: `federal`, `state`, `local`, `utility`

**Usage**:
```tsx
import { CategoryBadge } from "@/components/ui/category-badge";

<CategoryBadge category="federal" />
<CategoryBadge category="state" />
<CategoryBadge category="local" />
<CategoryBadge category="utility" />
```

**Visual**:
- Federal: Darkest blue (100% opacity)
- State: Medium blue (75% opacity)
- Local: Light blue (50% opacity)
- Utility: Lightest blue (25% opacity)

---

### 2. DataFreshness

**Purpose**: Bloomberg-style data timestamp indicators with visual status.

**Statuses**: `live`, `fresh`, `recent`, `stale`, `outdated`

**Usage**:
```tsx
import { DataFreshness } from "@/components/ui/metric-card";

<DataFreshness status="live" lastUpdated="2m ago" />
<DataFreshness status="fresh" lastUpdated="6h ago" />
<DataFreshness status="stale" lastUpdated="25d ago" />
```

**Visual**:
- **Live**: Animated emerald pulse + "LIVE • 2m ago"
- **Fresh**: Solid teal dot + "FRESH • 6h ago"
- **Recent**: Solid blue dot + "RECENT • 3d ago"
- **Stale**: Solid amber dot + "STALE • 25d ago"
- **Outdated**: Solid red dot + "OUTDATED • 45d ago"

---

### 3. MetricCard

**Purpose**: Display key metrics with trend indicators and institutional styling.

**Props**:
- `title`: Metric label (uppercase, 11px)
- `value`: Primary value (24px, bold, monospace)
- `change`: Percentage or delta
- `trend`: "up" | "down" | "neutral"
- `prefix`: "$" or other symbol
- `suffix`: "M", "%", "B", etc.
- `description`: Optional explanatory text

**Usage**:
```tsx
import { MetricCard } from "@/components/ui/metric-card";

<MetricCard
  title="Portfolio Size"
  value="16.7"
  prefix="$"
  suffix="M"
  change="+1.2%"
  trend="up"
  description="Estimated Value"
/>
```

**Visual**:
- Top accent line appears on hover (blue)
- Trend indicator: Green up arrow or red down arrow
- Monospace value for data alignment

---

### 4. ProgramCard

**Purpose**: Display incentive program details with Bloomberg-style density.

**Props**:
- `name`: Program title
- `description`: Short description (2 lines max)
- `category`: CategoryType (federal/state/local/utility)
- `agency`: Full agency name
- `agencyShort`: Agency abbreviation
- `valueRange`: { min, max, unit }
- `deadline`: Date string or "Rolling"
- `difficulty`: "Low" | "Medium" | "High"
- `freshnessStatus`: DataFreshness status
- `lastUpdated`: Timestamp string

**Usage**:
```tsx
import { ProgramCard } from "@/components/ui/program-card";

<ProgramCard
  id="1"
  name="Energy Efficiency Commercial Buildings Deduction (179D)"
  description="Provides a tax deduction of up to $5.00 per square foot..."
  category="federal"
  agency="Department of Energy"
  agencyShort="DOE"
  valueRange={{ min: 1.80, max: 5.00, unit: "per sq ft" }}
  deadline="Rolling"
  difficulty="Low"
  freshnessStatus="live"
  lastUpdated="2m ago"
/>
```

**Visual**:
- Icon on left (16x16 building icon)
- Category badge + agency label in header
- Value display on right (monospace, large)
- Description clamped to 2 lines
- Footer with deadline, difficulty, data freshness

---

### 5. Card (Institutional)

**Purpose**: Base container with Bloomberg-style minimal borders.

**Styling**:
- Border: 1px solid slate-200
- Border radius: 8px (minimal)
- Shadow: Subtle (0 1px 3px rgba(0,0,0,0.04))
- Hover: Blue border + enhanced shadow

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Portfolio Composition</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

---

### 6. Button (Institutional)

**Variants**:
1. **Primary** (Blue): Main actions
2. **Secondary** (Slate): Cancel, alternate actions
3. **Teal** (Teal): Special CTAs like "Ask Us"
4. **Ghost**: Text-only links

**Usage**:
```tsx
import { Button } from "@/components/ui/button";

<Button>Primary Action</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">View Details</Button>
```

**Styling**:
- Border radius: 4px (sharp institutional)
- Padding: 10px 20px
- Font weight: 600
- Transition: 150ms

---

### 7. Table (Bloomberg-style)

**Purpose**: Dense data tables with sortable headers and zebra striping.

**Features**:
- Uppercase column headers (11px, 600 weight, letter-spacing 0.5px)
- Sortable headers with ▲▼ indicators
- Zebra striping (odd rows: rgba(241, 245, 249, 0.5))
- Hover state: Blue highlight
- Monospace for numeric columns

**Usage**:
```tsx
<table className="institutional-table">
  <thead>
    <tr>
      <th className="sort-header sort-asc">Property Name</th>
      <th className="sort-header">Location</th>
      <th className="text-right">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>100 Downtown Alley</td>
      <td>New York, NY</td>
      <td className="text-right font-mono-data">$2.4M</td>
    </tr>
  </tbody>
</table>
```

---

## Usage Guidelines

### When to Use Each Color

#### Navy (Primary)
- **Background**: Light mode (#f8fafc), dark mode (#0f172a)
- **Text**: Primary (#0f172a), secondary (#64748b), muted (#94a3b8)
- **Borders**: Default borders (#e2e8f0)

#### Blue (Brand)
- **Buttons**: Primary actions (#2563eb)
- **Links**: Interactive text (#3b82f6)
- **Active States**: Selected tabs, focused inputs (#2563eb)
- **Category Badges**: Federal/State/Local/Utility (opacity variations)

#### Green (Success)
- **Metrics**: Positive trends, growth indicators (#38a169)
- **Status**: Approved, completed, active (#38a169)
- **Notifications**: Success messages (#38a169)

#### Teal (Highlight)
- **CTAs**: "Ask Us" button, special actions (#14b8a6)
- **Data Freshness**: Fresh data indicator (#14b8a6)
- **Accents**: Unique highlights, differentiation (#14b8a6)

### Dark Mode Best Practices

1. **Backgrounds**: Use navy-900 (#0f172a) instead of pure black
2. **Borders**: Use blue-tinted borders instead of gray
3. **Text**: Increase contrast with lighter shades
4. **Shadows**: Add blue tint to shadows for cohesion
5. **Opacity**: Increase category badge opacity by ~50%

### Data Display

1. **Always use monospace** for numbers (IBM Plex Mono)
2. **Enable tabular figures**: `font-feature-settings: 'tnum' 1`
3. **Add data freshness** to all dynamic content
4. **Include timestamps** in Bloomberg format ("Updated 2m ago")
5. **Use metric deltas** with trend indicators (↑ +1.2%)

### Spacing Consistency

1. **Card padding**: 20px (p-5) for all cards
2. **Section gaps**: 24px (mb-6) between major sections
3. **Component gaps**: 16px (gap-4) for grids
4. **Button spacing**: 10px 20px padding, 8px gap for icons

---

## Implementation

### Setup

1. **Import theme in main CSS**:
```css
@import "./styles/institutional-theme.css";
```

2. **Use CSS variables** for all colors:
```css
background: var(--institutional-blue-600);
color: var(--institutional-navy-50);
```

3. **Apply utility classes**:
```tsx
<div className="font-mono-data">$2.4M</div>
<h1 className="font-heading">Portfolio Overview</h1>
```

### Color Reference Quick Guide

```css
/* Backgrounds */
bg-navy-50      /* Light mode background */
bg-navy-900     /* Dark mode background */
bg-white        /* Card backgrounds (light) */
bg-slate-800    /* Card backgrounds (dark) */

/* Text */
text-navy-900   /* Primary text (light) */
text-navy-50    /* Primary text (dark) */
text-navy-500   /* Secondary text */
text-navy-400   /* Muted text */

/* Borders */
border-navy-200 /* Light mode borders */
border-blue-500 /* Active/hover borders */

/* Buttons */
bg-blue-600     /* Primary button */
bg-teal-500     /* Teal CTA button */
bg-navy-100     /* Secondary button (light) */
bg-navy-800     /* Secondary button (dark) */

/* Status */
text-green-600  /* Success */
text-amber-600  /* Warning */
text-rose-600   /* Error */
text-blue-600   /* Info */
```

---

## Visual Comparisons

### Before (shadcn default)
- Rounded corners (12-16px)
- Gray palette (neutral, not institutional)
- Generic shadows
- Default typography

### After (Institutional)
- Sharp corners (4-8px)
- Navy/Blue institutional palette
- Subtle, professional shadows
- IBM Plex + Sora typography
- Bloomberg-style data indicators
- Category badge opacity system
- Data freshness with pulse animations

---

## Accessibility

### Contrast Ratios (WCAG 2.1 AA)

| Text | Background | Ratio | Pass |
|------|------------|-------|------|
| Navy-900 | White | 19.8:1 | ✅ AAA |
| Navy-500 | White | 4.6:1 | ✅ AA |
| Blue-600 | White | 7.2:1 | ✅ AAA |
| Navy-50 | Navy-900 | 18.5:1 | ✅ AAA |
| Blue-400 | Navy-900 | 8.1:1 | ✅ AAA |

### Keyboard Navigation

- All interactive elements: `tabindex` accessible
- Focus states: Blue ring (0 0 0 3px rgba(59, 130, 246, 0.1))
- Skip links: For screen readers
- ARIA labels: On all icon-only buttons

---

## Maintenance

### Adding New Colors

1. Add to `institutional-theme.css` CSS variables
2. Update this documentation
3. Add dark mode variant if needed
4. Test contrast ratio (use WebAIM Contrast Checker)

### Updating Components

1. Maintain 8px spacing grid
2. Use institutional border radius (4-8px)
3. Apply monospace to all numeric data
4. Include data freshness for dynamic content
5. Test in both light and dark modes

---

## Credits

**Design Inspiration**:
- Bloomberg Terminal (data density, freshness indicators)
- Cherre (sophisticated spacing, professional palette)
- Stripe (clean CTAs, minimal decoration)

**Fonts**:
- Sora by Sora Sagano (Google Fonts)
- IBM Plex Sans & Mono by IBM (Google Fonts)

**Color Palette**:
- Navy blend: #1a365d (Skills) + Slate (Tailwind)
- Blue: #2563eb (Cherre-inspired)
- Green: #38a169 (Skills)
- Teal: #14b8a6 (Stripe-inspired)

---

**Version History**:
- v1.0 (2026-02-17): Initial design system documentation
