# Typography Component

A modern, comprehensive typography system with bold styling, gradient effects, responsive sizing, and construction-specific text formatting.

## Features

- ✅ **Bold Modern Styling**: Contemporary typography with strong visual hierarchy
- ✅ **Gradient Text Effects**: Beautiful gradient overlays for emphasis
- ✅ **Responsive Font Sizing**: Adaptive sizing across breakpoints
- ✅ **Construction-Specific Formatting**: Specialized formatting for measurements, currency, percentages
- ✅ **Accessibility Compliant**: WCAG 2.1 AA compliant with proper contrast ratios
- ✅ **Animation Support**: Smooth micro-animations with Framer Motion
- ✅ **Dark Mode Support**: Automatic color adaptation for dark themes
- ✅ **TypeScript Support**: Full type safety with comprehensive interfaces

## Components

### Typography

The main typography component for all text content.

```tsx
import { Typography } from '@/components/design-system/atoms/Typography';

// Basic usage
<Typography>Default body text</Typography>

// Display heading with gradient
<Typography 
  variant="display" 
  size="4xl" 
  gradient="primary"
  as="h1"
>
  Modern Construction Platform
</Typography>

// Responsive heading
<Typography 
  variant="heading" 
  size="2xl" 
  responsive
  weight="bold"
  as="h2"
>
  Project Overview
</Typography>

// Styled body text
<Typography 
  variant="body" 
  color="secondary"
  italic
>
  Professional construction management made simple
</Typography>
```

### ConstructionText

Specialized component for construction industry data formatting.

```tsx
import { ConstructionText } from '@/components/design-system/atoms/Typography';

// Currency formatting
<ConstructionText type="currency" value={125000.50} />
// Output: $125,000.50

// Percentage with precision
<ConstructionText type="percentage" value={87.5} precision={1} />
// Output: 87.5%

// Measurements with units
<ConstructionText type="measurement" value={1250} unit="sq ft" />
// Output: 1,250.00 sq ft

// Area calculations
<ConstructionText type="area" value={2500} unit="sq ft" />
// Output: 2,500.00 sq ft

// Volume measurements
<ConstructionText type="volume" value={150.5} unit="cu yd" />
// Output: 150.50 cu yd

// Weight measurements
<ConstructionText type="weight" value={5000} unit="lbs" />
// Output: 5,000.00 lbs

// Duration formatting
<ConstructionText type="duration" value={7320} />
// Output: 2h 2m

// Compact currency
<ConstructionText type="currency" value={1500000} compact />
// Output: $1.5M
```

## Props

### Typography Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'display' \| 'heading' \| 'body' \| 'caption' \| 'overline'` | `'body'` | Typography variant |
| `size` | `Size \| '2xl' \| '3xl' \| '4xl' \| '5xl' \| '6xl' \| '7xl' \| '8xl' \| '9xl'` | `'md'` | Font size |
| `weight` | `'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'` | Auto | Font weight |
| `color` | `'primary' \| 'secondary' \| 'muted' \| 'accent' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'primary'` | Text color |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `'left'` | Text alignment |
| `gradient` | `boolean \| 'primary' \| 'secondary' \| 'success' \| 'brand'` | `false` | Gradient effect |
| `responsive` | `boolean` | `false` | Responsive sizing |
| `truncate` | `boolean` | `false` | Truncate overflow |
| `uppercase` | `boolean` | `false` | Transform to uppercase |
| `italic` | `boolean` | `false` | Italic styling |
| `underline` | `boolean` | `false` | Underline decoration |
| `as` | `keyof JSX.IntrinsicElements` | `'p'` | HTML element |

### ConstructionText Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'measurement' \| 'currency' \| 'percentage' \| 'area' \| 'volume' \| 'weight' \| 'duration'` | Required | Format type |
| `value` | `number \| string` | Required | Value to format |
| `unit` | `string` | - | Unit of measurement |
| `precision` | `number` | `2` | Decimal precision |
| `locale` | `string` | `'en-US'` | Locale for formatting |
| `currency` | `string` | `'USD'` | Currency code |
| `showUnit` | `boolean` | `true` | Show unit suffix |
| `compact` | `boolean` | `false` | Compact notation |

## Variants

### Display
- **Purpose**: Hero headings, page titles
- **Font**: Display font family (Poppins)
- **Weight**: Black (900)
- **Tracking**: Tighter letter spacing
- **Leading**: None (tight line height)

### Heading
- **Purpose**: Section headings, component titles
- **Font**: Display font family (Poppins)
- **Weight**: Bold (700)
- **Tracking**: Tight letter spacing
- **Leading**: Tight line height

### Body
- **Purpose**: Main content, paragraphs
- **Font**: Primary font family (Inter)
- **Weight**: Normal (400)
- **Tracking**: Normal letter spacing
- **Leading**: Normal line height

### Caption
- **Purpose**: Small text, labels, metadata
- **Font**: Primary font family (Inter)
- **Weight**: Medium (500)
- **Tracking**: Wide letter spacing
- **Leading**: Snug line height

### Overline
- **Purpose**: Category labels, section markers
- **Font**: Primary font family (Inter)
- **Weight**: Bold (700)
- **Tracking**: Widest letter spacing
- **Transform**: Uppercase

## Gradient Effects

### Primary Gradient
Blue gradient from brand-blue-600 to brand-blue-800
```css
background: linear-gradient(to right, #2563eb, #1e40af);
```

### Secondary Gradient
Orange gradient from brand-orange-600 to brand-orange-800
```css
background: linear-gradient(to right, #ea580c, #9a3412);
```

### Success Gradient
Green gradient from success-600 to success-800
```css
background: linear-gradient(to right, #059669, #065f46);
```

### Brand Gradient
Multi-color brand gradient
```css
background: linear-gradient(to right, #2563eb, #ea580c, #1e40af);
```

## Responsive Sizing

When `responsive={true}`, text sizes adapt across breakpoints:

| Size | Mobile | Small | Medium+ |
|------|--------|-------|---------|
| `xs` | `text-xs` | `text-sm` | - |
| `sm` | `text-sm` | `text-base` | - |
| `md` | `text-base` | `text-lg` | - |
| `lg` | `text-lg` | `text-xl` | - |
| `xl` | `text-xl` | `text-2xl` | - |
| `2xl` | `text-xl` | `text-2xl` | `text-3xl` |
| `3xl` | `text-2xl` | `text-3xl` | `text-4xl` |
| `4xl` | `text-3xl` | `text-4xl` | `text-5xl` |

## Construction Text Formatting

### Currency
- Supports multiple locales and currencies
- Compact notation for large values
- Proper decimal precision
- Color: Success green

### Percentage
- Automatic percentage conversion
- Configurable precision
- Color: Brand blue

### Measurements
- Area, volume, weight, and linear measurements
- Unit display control
- Proper number formatting
- Color: Brand orange

### Duration
- Automatic time unit conversion
- Hours, minutes, seconds display
- Intelligent formatting based on duration
- Color: Warning yellow

## Accessibility

### WCAG 2.1 AA Compliance
- ✅ Proper contrast ratios (4.5:1 for normal text, 3:1 for large text)
- ✅ Semantic HTML elements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility

### Color Contrast
All color variants meet WCAG contrast requirements:
- Primary: 4.5:1 contrast ratio
- Secondary: 4.5:1 contrast ratio
- Muted: 4.5:1 contrast ratio (minimum readable)
- Accent colors: 4.5:1+ contrast ratio

### Dark Mode
Automatic color adaptation for dark themes with maintained contrast ratios.

## Animation

### Entrance Animation
- Fade in with subtle upward movement
- Duration: 400ms
- Easing: Cubic bezier (0.4, 0, 0.2, 1)
- Delay: 100ms

### Hover Effects
- Scale transform for gradient text
- Smooth transitions
- Performance optimized

### Reduced Motion
Respects `prefers-reduced-motion` setting for accessibility.

## Examples

### Hero Section
```tsx
<div className="text-center space-y-4">
  <Typography 
    variant="display" 
    size="6xl" 
    gradient="brand"
    responsive
    as="h1"
  >
    ConstructPro
  </Typography>
  <Typography 
    variant="heading" 
    size="xl" 
    color="secondary"
    responsive
    as="h2"
  >
    Professional Construction Management
  </Typography>
</div>
```

### Project Stats
```tsx
<div className="grid grid-cols-3 gap-4">
  <div>
    <Typography variant="caption" color="muted">Total Cost</Typography>
    <ConstructionText type="currency" value={2500000} />
  </div>
  <div>
    <Typography variant="caption" color="muted">Completion</Typography>
    <ConstructionText type="percentage" value={87.5} />
  </div>
  <div>
    <Typography variant="caption" color="muted">Area</Typography>
    <ConstructionText type="area" value={15000} unit="sq ft" />
  </div>
</div>
```

### Content Hierarchy
```tsx
<article className="space-y-6">
  <Typography variant="heading" size="3xl" as="h1">
    Project Update Report
  </Typography>
  
  <Typography variant="heading" size="xl" as="h2">
    Progress Overview
  </Typography>
  
  <Typography variant="body" color="secondary">
    This week we completed the foundation work and began framing. 
    The project is currently <ConstructionText type="percentage" value={35} /> 
    complete and on schedule.
  </Typography>
  
  <Typography variant="caption" color="muted" uppercase>
    Last updated: March 15, 2024
  </Typography>
</article>
```

## Best Practices

### Hierarchy
1. Use `display` for hero headings and main page titles
2. Use `heading` for section titles and component headings
3. Use `body` for main content and descriptions
4. Use `caption` for metadata and small text
5. Use `overline` for category labels and section markers

### Gradients
- Use sparingly for emphasis and branding
- Prefer `primary` gradient for main CTAs
- Use `brand` gradient for hero elements
- Avoid gradients on body text for readability

### Responsive Design
- Enable responsive sizing for headings and display text
- Keep body text at fixed sizes for readability
- Test across all breakpoints

### Construction Data
- Use `ConstructionText` for all numeric data
- Include appropriate units for measurements
- Use compact notation for large currency values
- Maintain consistent precision across similar data types

### Performance
- Components are optimized with React.memo where appropriate
- Animations respect reduced motion preferences
- Minimal re-renders with stable class generation