# 🎨 HIMS Application - Theme & Color System

## Quick Start - Change Application Colors

To change colors throughout the **entire application**, simply edit one file:

```
src/style/theme.css
```

### How to Change Primary Color

**Example:** Change from Teal (#006666) to Blue (#0066cc)

1. Open `src/style/theme.css`
2. Find the PRIMARY COLORS section:

```css
:root {
  /* ========== PRIMARY COLORS ========== */
  --primary-color: #0066cc;           /* Change this! */
  --primary-dark: #0052a3;            /* Darker shade */
  --primary-light: #3399ff;           /* Lighter shade */
  --primary-accent: #66ccff;          /* Bright accent */
  
  /* ... rest stays the same */
}
```

3. Save the file - **All components update automatically!**

---

## What Changes When You Update Colors?

When you modify `--primary-color`, the following components automatically update:

### ✅ Header
- Background color
- Home button gradient
- Logo/text color

### ✅ Sidebar (Medical Records & All Modules)
- Background gradient
- Menu item hover states
- Active menu highlighting
- Dashboard button

### ✅ Module Cards (Selection Area)
- Icon colors
- Hover effects
- Title text gradient

### ✅ Buttons & Links
- Primary button backgrounds
- Gradient effects
- Hover states

### ✅ All Future Modules
- Any new module using the theme system will inherit colors automatically

---

## Available Theme Variables

### Primary Colors
```css
--primary-color: #006666;           /* Main brand color */
--primary-dark: #004d4d;            /* Darker shade */
--primary-light: teal;              /* Lighter shade */
--primary-accent: #20c997;          /* Bright accent */
```

### Secondary Colors
```css
--secondary-color: #f0ad4e;         /* Warning/Logout button */
--secondary-dark: #ec971f;          /* Darker secondary */
```

### Text Colors
```css
--text-primary: #2d465e;            /* Main text */
--text-secondary: #6c757d;          /* Secondary text */
--text-white: #ffffff;              /* White text */
--text-light: rgba(255, 255, 255, 0.9);
```

### Background Colors
```css
--bg-main: #f5f5f5;                 /* Main background */
--bg-white: #ffffff;                /* Card backgrounds */
--bg-light: #f8f9fa;                /* Light backgrounds */
--bg-lighter: #e9ecef;              /* Even lighter */
```

### Sidebar Colors
```css
--sidebar-bg-start: var(--primary-color);
--sidebar-bg-end: var(--primary-dark);
--sidebar-header-bg: rgba(0, 102, 102, 0.3);
--sidebar-item-hover: rgba(255, 255, 255, 0.1);
--sidebar-item-active: var(--primary-light);
--sidebar-text: var(--text-white);
```

### Layout Dimensions
```css
--header-height: 60px;
--sidebar-width: 260px;
--sidebar-width-collapsed: 70px;
```

### Borders & Shadows
```css
--border-radius: 6px;
--border-radius-sm: 4px;
--border-radius-lg: 8px;
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
```

### Transitions
```css
--transition-fast: 0.2s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;
```

---

## Predefined Gradients

Use these gradients for consistent styling:

```css
--gradient-primary: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
--gradient-primary-reverse: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
--gradient-sidebar: linear-gradient(180deg, var(--sidebar-bg-start) 0%, var(--sidebar-bg-end) 100%);
--gradient-card: linear-gradient(135deg, var(--bg-white) 0%, var(--bg-light) 100%);
--gradient-text: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 50%, var(--primary-accent) 100%);
```

---

## How to Use in Your Components

### In CSS Files

```css
/* Import theme variables at the top */
@import '../../style/theme.css';

/* Use variables */
.my-component {
    background: var(--primary-color);
    color: var(--text-white);
    border-radius: var(--border-radius);
    transition: all var(--transition-normal);
}

.my-button {
    background: var(--gradient-primary);
}

.my-button:hover {
    background: var(--gradient-primary-reverse);
}
```

### In TSX/React Components

```tsx
// Add className instead of inline styles
<div className="app-header">...</div>

// In corresponding CSS:
.app-header {
    background: var(--header-bg);
}
```

---

## Utility Classes

Ready-to-use utility classes:

```css
/* Backgrounds */
.bg-primary                 /* Solid primary color */
.bg-gradient-primary        /* Primary gradient */
.bg-sidebar                 /* Sidebar gradient */

/* Text */
.text-primary-color         /* Primary color text */
.text-gradient              /* Gradient text effect */

/* Borders */
.border-primary             /* Primary color border */

/* Shadows */
.shadow-sm-custom           /* Small shadow */
.shadow-md-custom           /* Medium shadow */
.shadow-lg-custom           /* Large shadow */
```

---

## Files Using Theme System

All these files automatically use the centralized theme:

1. ✅ `src/style/theme.css` - **Main theme file**
2. ✅ `src/style/commonStyle.css` - Module cards, selection area
3. ✅ `src/main-layout/header/header.css` - Header styles
4. ✅ `src/medical-records/styles/sidebar.css` - Sidebar styles
5. ✅ `src/components/footer.css` - Footer watermark

---

## Color Scheme Examples

### Example 1: Corporate Blue
```css
:root {
  --primary-color: #0066cc;
  --primary-dark: #0052a3;
  --primary-light: #3399ff;
  --primary-accent: #66ccff;
}
```

### Example 2: Modern Purple
```css
:root {
  --primary-color: #6B46C1;
  --primary-dark: #553C9A;
  --primary-light: #9F7AEA;
  --primary-accent: #D6BCFA;
}
```

### Example 3: Professional Green
```css
:root {
  --primary-color: #059669;
  --primary-dark: #047857;
  --primary-light: #10B981;
  --primary-accent: #6EE7B7;
}
```

### Example 4: Healthcare Red
```css
:root {
  --primary-color: #DC2626;
  --primary-dark: #B91C1C;
  --primary-light: #EF4444;
  --primary-accent: #FCA5A5;
}
```

---

## Best Practices

### ✅ DO:
- Always use CSS variables for colors
- Import `theme.css` at the top of your CSS files
- Use predefined gradients for consistency
- Test color changes across all modules

### ❌ DON'T:
- Use hardcoded hex colors (e.g., `#006666`)
- Use inline styles for colors
- Create duplicate color definitions
- Skip importing theme.css

---

## Adding New Colors

If you need a new color variable:

1. Open `src/style/theme.css`
2. Add it to the appropriate section:

```css
:root {
  /* Add under PRIMARY COLORS or create new section */
  --my-custom-color: #yourcolor;
}
```

3. Use it in your CSS:

```css
.my-element {
    color: var(--my-custom-color);
}
```

---

## Migration Checklist

When creating new components:

- [ ] Import `theme.css` at top of CSS file
- [ ] Use `var(--primary-color)` instead of `#006666`
- [ ] Use `var(--transition-normal)` instead of `0.3s ease`
- [ ] Use predefined spacing variables
- [ ] Use predefined gradients
- [ ] Test with different color schemes

---

## Support & Questions

For questions about the theme system:
1. Check this README
2. Look at existing components (Header.tsx, Sidebar.tsx)
3. Review theme.css for all available variables

---

**Last Updated:** November 19, 2025
**Version:** 1.0
**Maintainer:** HIMS Development Team
