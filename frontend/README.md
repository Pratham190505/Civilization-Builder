# Civilization Builder - Frontend Theme Documentation

## Overview

The Civilization Builder frontend features a **modern dark-first design system** with support for light mode. The UI is built using **Tailwind CSS v4**, **Radix UI**, and **shadcn/ui** components, creating a cohesive and accessible dashboard experience.

---

## 🎨 Theme System

### Theme Architecture

- **Primary Framework**: Tailwind CSS v4 with custom CSS variables
- **Component Library**: Radix UI (unstyled, accessible primitives)
- **Pre-built Components**: shadcn/ui (Radix UI + Tailwind CSS styled components)
- **Theme Implementation**: CSS custom properties (CSS variables) + Tailwind `@theme` directive
- **Theme Switching**: React Context (localStorage persistence)
- **Default Theme**: Dark mode (can be toggled to light mode)

### Theme Modes

#### Light Mode
```css
:root {
  --background: #f3f7fd;
  --foreground: #0f172a;
  --surface: #ffffff;
  --surface-2: #f8fbff;
  --muted: #eaf1fb;
  --muted-foreground: #64748b;
  --border: rgba(148, 163, 184, 0.28);
  --border-strong: rgba(59, 130, 246, 0.18);
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --sidebar: #f8fbff;
  --sidebar-foreground: #0f172a;
  --sidebar-muted: #64748b;
  --sidebar-hover: rgba(59, 130, 246, 0.06);
  --sidebar-active: rgba(59, 130, 246, 0.12);
  --success: #10b981;
  --success-foreground: #059669;
  --warning: #f59e0b;
  --warning-foreground: #d97706;
  --danger: #ef4444;
  --danger-foreground: #dc2626;
  --violet: #8b5cf6;
  --violet-foreground: #7c3aed;
  --platinum: #8b5cf6;
  --gold: #f59e0b;
  --silver: #94a3b8;
  --bronze: #f97316;
}
```

#### Dark Mode (Default)

Activated by adding the `.dark` class to the HTML root element.

```css
.dark {
  --background: #0b0f1c;
  --foreground: #e6e8ef;
  --surface: #121829;
  --surface-2: #0f1424;
  --muted: #1a2236;
  --muted-foreground: #94a3b8;
  --border: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.14);
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --sidebar: #090d1a;
  --sidebar-foreground: #e6e8ef;
  --sidebar-muted: #6b7280;
  --sidebar-hover: rgba(255, 255, 255, 0.04);
  --sidebar-active: rgba(37, 99, 235, 0.22);
}
```

---

## 🎯 Color Palette

### Semantic Colors

| Variable | Light Value | Dark Value (Default) | Usage |
|----------|-----------|-----------|-------|
| `--background` | #f3f7fd | #0b0f1c | Page background |
| `--foreground` | #0f172a | #e6e8ef | Text color |
| `--surface` | #ffffff | #121829 | Card backgrounds |
| `--surface-2` | #f8fbff | #0f1424 | Nested surfaces |
| `--muted` | #eaf1fb | #1a2236 | Disabled/muted elements |
| `--muted-foreground` | #64748b | #94a3b8 | Secondary text |
| `--border` | rgba(148,163,184,0.28) | rgba(255,255,255,0.07) | Default borders |
| `--border-strong` | rgba(59,130,246,0.18) | rgba(255,255,255,0.14) | Strong borders |
| `--primary` | #2563eb | #2563eb | CTA buttons, links |
| `--primary-foreground` | #ffffff | #ffffff | Text on primary |
| `--sidebar` | #f8fbff | #090d1a | Sidebar background |
| `--sidebar-foreground` | #0f172a | #e6e8ef | Sidebar text |
| `--sidebar-muted` | #64748b | #6b7280 | Sidebar inactive items |
| `--sidebar-hover` | rgba(59,130,246,0.06) | rgba(255,255,255,0.04) | Sidebar hover state |
| `--sidebar-active` | rgba(59,130,246,0.12) | rgba(37,99,235,0.22) | Sidebar active state (varies by mode) |

### Status Colors

| Color | Value | Usage |
|-------|-------|-------|
| `--success` | #10b981 | Success states |
| `--success-foreground` | #34d399 | Text on success |
| `--warning` | #f59e0b | Warning states |
| `--warning-foreground` | #fbbf24 | Text on warning |
| `--danger` | #ef4444 | Error/danger states |
| `--danger-foreground` | #f87171 | Text on danger |

### Accent Colors (Rankings)

| Color | Value | Usage |
|-------|-------|-------|
| `--violet` | #8b5cf6 | Platinum ranking |
| `--violet-foreground` | #a78bfa | Platinum text |
| `--gold` | #f59e0b | Gold ranking |
| `--platinum` | #8b5cf6 | Platinum ranking |
| `--silver` | #94a3b8 | Silver ranking |
| `--bronze` | #f97316 | Bronze ranking |

---

## 📝 Typography

### Font Family

```css
@theme inline {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
```

- **Primary Font**: Inter
- **Fallback Stack**: System UI fonts (optimal for cross-platform rendering)

### Base Styles

```css
body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}
```

---

## 🔧 CSS Architecture

### Tailwind CSS Integration

**Vite Config:**
```typescript
plugins: [react(), tailwindcss(), tsconfigPaths()]
```

**CSS Entry Point (`src/styles.css`):**
```css
@import "tailwindcss" source(none);
@source "../src";
```

### Custom Variables in Tailwind

All CSS variables are exposed to Tailwind via the `@theme` directive:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-muted: var(--sidebar-muted);
  --color-sidebar-hover: var(--sidebar-hover);
  --color-sidebar-active: var(--sidebar-active);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-danger: var(--danger);
  --color-danger-foreground: var(--danger-foreground);
  --color-violet: var(--violet);
  --color-violet-foreground: var(--violet-foreground);
  --color-platinum: var(--platinum);
  --color-gold: var(--gold);
  --color-silver: var(--silver);
  --color-bronze: var(--bronze);
}
```

### Dark Mode Implementation

```css
@custom-variant dark (&:is(.dark *));
```

Dark mode is applied via the `.dark` class on the root element. Use Tailwind's `dark:` prefix for dark mode styles.

---

## 🎨 Custom Utilities

### Thin Scrollbar

```css
.scrollbar-thin::-webkit-scrollbar { 
  width: 6px; 
  height: 6px; 
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 9999px;
}

.scrollbar-thin::-webkit-scrollbar-track { 
  background: transparent; 
}
```

**Usage**: Apply `scrollbar-thin` class to scrollable containers for styled scrollbars.

---

## 🧩 Component Library Stack

### Radix UI Primitives

The project uses Radix UI for accessible, unstyled UI primitives:

- **Navigation**: Accordion, Menubar, Navigation Menu
- **Input**: Checkbox, Radio Group, Select, Switch, Input, Textarea
- **Feedback**: Alert Dialog, Toast (Sonner)
- **Overlay**: Dialog, Dropdown Menu, Popover, Hover Card, Context Menu
- **Layout**: Tabs, Collapsible, Scroll Area, Resizable Panels
- **Form**: Form with React Hook Form integration

### shadcn/ui Pre-styled Components

All Radix UI components are styled with Tailwind CSS and available as shadcn/ui components in `src/components/ui/`:

- `button.tsx` - Variants: default, destructive, outline, secondary, ghost, link
- `card.tsx` - Card container with header, title, content, footer
- `tabs.tsx` - Tabbed navigation
- `dialog.tsx` - Modal dialog
- `table.tsx` - Data table
- Plus 30+ additional components

### Styling Pattern

shadcn/ui components use **Class Variance Authority (CVA)** for variant management:

```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // ... other variants
      },
      size: {
        default: "h-9 px-4 py-2",
        // ... other sizes
      },
    },
  }
);
```

---

## 🔄 Theme Switching Implementation

### Hook: `useTheme`

Location: `src/hooks/useTheme.jsx`

```typescript
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("gds-theme") || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("gds-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Usage

**App Structure:**
```jsx
import { ThemeProvider } from "./hooks/useTheme.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
```

**Toggle Theme:**
```jsx
import { useTheme } from "../../hooks/useTheme.jsx";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  
  return (
    <button
      onClick={toggle}
      className="rounded-lg border border-border bg-surface p-2 text-foreground hover:bg-muted"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
```

### Local Storage

Theme preference is persisted in localStorage under the key `gds-theme`:
- Light mode: `"light"`
- Dark mode: `"dark"`

---

## 📦 Dependencies

### Core Styling
- `tailwindcss@^4.2.1` - Utility-first CSS framework
- `@tailwindcss/vite@^4.2.1` - Vite integration for Tailwind CSS

### Component Primitives (Radix UI)
- `@radix-ui/*` - 25+ accessible component primitives

### Styling Utilities
- `class-variance-authority@^0.7.1` - Type-safe variant management
- `clsx@^2.1.1` - Conditional class names
- `tailwind-merge@^3.5.0` - Merge Tailwind classes intelligently

### Icons
- `lucide-react@^0.575.0` - Lightweight SVG icon library
- `react-icons@^5.6.0` - Popular icon packs

### Charts & Visualization
- `recharts@^2.15.4` - Composable React chart library

### Form Handling
- `react-hook-form@^7.71.2` - Performant form library
- `@hookform/resolvers@^5.2.2` - Resolver adapters for form validation
- `zod@^3.24.2` - TypeScript-first schema validation

### Additional Components
- `sonner@^2.0.7` - Toast notifications
- `cmdk@^1.1.1` - Command menu
- `embla-carousel-react@^8.6.0` - Carousel component
- `react-resizable-panels@^4.6.5` - Resizable panel layout
- `vaul@^1.1.2` - Drawer component
- `date-fns@^4.1.0` - Date utilities
- `react-day-picker@^9.14.0` - Calendar component

---

## 🚀 Usage Examples

### Using Theme Variables in Tailwind

```jsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </button>
</div>
```

### Using CSS Variables Directly

```jsx
<div style={{ backgroundColor: 'var(--surface)' }}>
  Custom styled content
</div>
```

### Conditional Dark Mode

```jsx
<div className="bg-white dark:bg-slate-950">
  Content that changes in dark mode
</div>
```

### Using Status Colors

```jsx
<div className="text-success">Success message</div>
<div className="bg-warning text-warning-foreground">Warning alert</div>
<div className="text-danger">Error message</div>
```

---

## 🔐 Accessible Components

All components built with **Radix UI** provide:

- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Semantic HTML

### Example: Accessible Button

```jsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="lg">
  Accessible Button
</Button>
```

---

## 📱 Responsive Design

Use Tailwind's responsive prefixes for mobile-first design:

```jsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

### Breakpoints (Tailwind Default)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

## 🎯 Design System Quick Reference

### Layout Spacing
- Sidebar: `--sidebar`, `--sidebar-foreground`
- Card Surfaces: `--surface`, `--surface-2`
- Borders: `--border`, `--border-strong`

### Interactive States
- Hover: `hover:` Tailwind prefix
- Active: `.sidebar-active` for sidebar items
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`

### Color Combinations (Semantic)

| Use Case | Colors |
|----------|--------|
| Primary CTA | `bg-primary text-primary-foreground` |
| Secondary Content | `text-muted-foreground` |
| Danger Action | `bg-danger text-danger-foreground` |
| Success Feedback | `bg-success text-success-foreground` |
| Warning Alert | `bg-warning text-warning-foreground` |
| Card Container | `bg-surface border border-border` |

---

## 🛠️ Development

### Running the Development Server

```bash
npm run dev
```

Server runs on `http://localhost:8080`

### Building for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

---

## 📄 File Structure

```
src/
├── styles.css              # Main CSS file with theme variables
├── components/
│   ├── ui/                 # shadcn/ui components (30+)
│   ├── Navbar/
│   ├── Sidebar/
│   ├── Cards/
│   ├── Charts/
│   └── Tables/
├── hooks/
│   └── useTheme.jsx        # Theme context & hooks
├── lib/
│   └── utils.ts            # Utility functions (cn)
├── pages/
│   └── Dashboard/
└── layouts/
    └── MainLayout.jsx
```

---

## 🎨 Customization

### Changing the Theme

1. **Light Mode**: Edit `:root` CSS variables in `src/styles.css`
2. **Dark Mode**: Edit `.dark` CSS variables in `src/styles.css`
3. **Tailwind Config**: Variables are exposed via `@theme` directive

### Adding New Colors

```css
:root {
  --custom-color: #your-hex-value;
}

@theme inline {
  --color-custom: var(--custom-color);
}
```

Then use in Tailwind:
```jsx
<div className="bg-custom">Custom color</div>
```

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Class Variance Authority](https://cva.style)
- [React Hook Form](https://react-hook-form.com)

---

## 📝 Notes

- All colors use CSS variables for easy theme switching
- The theme system supports both light and dark modes
- Components follow shadcn/ui conventions and are fully customizable
- Theme preference is saved to localStorage and persists across sessions
- Scrollbars are styled with the `scrollbar-thin` utility class

---

**Last Updated**: 2026-06-12  
**Theme Version**: 1.0  
**Framework**: React 19.2.0 + Tailwind CSS 4.2.1
