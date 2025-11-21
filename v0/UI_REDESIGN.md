# UI/UX Complete Redesign

## Overview
This is a complete frontend redesign of the Catalog & Scheduler application, rebuilt from scratch with a minimalist, architectural aesthetic while maintaining full compatibility with the backend API contract.

## Design Principles

### Aesthetic
- **Minimalist & Architectural**: Clean, sans-serif typography with generous whitespace
- **Neutral Color Palette**: Whites, warm greys, charcoal, blacks - no bright colors
- **Inspiration**: Notion, Linear.app, Programma.design, Apple Settings, Minimalist Dashboards

### UX Patterns
- **Seamless Navigation**: No unnecessary page reloads
- **Modal Editing**: Add/edit operations via modals instead of full pages
- **Inline Actions**: Direct actions on list items where appropriate
- **Loading States**: Skeleton loaders, not spinners
- **Context Preservation**: User remains aware of context when editing

## Architecture

### Layout
\`\`\`
MainLayout
├── Sidebar Navigation (fixed on desktop, collapsible on mobile)
├── Top Bar (minimal, responsive)
└── Main Content Area
    └── Page Components
\`\`\`

### Page Structure

1. **Homepage** (`/`)
   - Clean search bar (Google-like)
   - Quick stats overview
   - Starting point for all workflows

2. **Search Results** (`/search?q=...`)
   - Live search integration with API
   - Product result cards with actions
   - Brand and category filters

3. **Products Dashboard** (`/products`)
   - Table view of all products
   - Inline add button
   - Edit/delete via modal and buttons
   - Pagination and filtering

4. **Brands Dashboard** (`/brands`)
   - Table view of all brands
   - Add new brands
   - Edit/delete via modal
   - Contact information display

5. **Project Scheduler** (`/scheduler`)
   - Create new projects
   - CSV import for material schedules
   - Expandable project details
   - Schedule item management

## Components

### Layouts
- `MainLayout` - Primary layout with sidebar + header

### Search
- `SearchInput` - Dual-mode search component (large homepage, regular search bar)

### Modals
- `ProductModal` - Add/edit products with all fields
- `BrandModal` - Add/edit brands with contact info

### UI Primitives (shadcn)
- Button, Input, Textarea, Label, Select
- Dialog, Table, Skeleton
- All styled with design system tokens

## Design System

### Colors
- **Background**: `oklch(1 0 0)` (white)
- **Foreground**: `oklch(0.18 0 0)` (charcoal)
- **Primary**: `oklch(0.25 0 0)` (dark grey)
- **Secondary**: `oklch(0.55 0 0)` (medium grey)
- **Muted**: `oklch(0.92 0 0)` (light grey)
- **Destructive**: Red accent for delete/error actions

### Typography
- **Font**: Geist (sans-serif)
- **Heading sizes**: 3xl, 2xl, lg for h1, h2, h3
- **Line height**: 1.4-1.6 for readability

### Spacing
- Uses Tailwind's spacing scale (p-4, gap-6, etc.)
- Never arbitrary values

## API Integration

### Endpoints Used
- `GET /api/brands` - Fetch all active brands
- `POST /api/brands` - Create brand
- `PATCH /api/brands/:id` - Update/soft-delete brand
- `GET /api/products` - Fetch products with pagination
- `POST /api/products` - Create product
- `PATCH /api/products/:id` - Update/deactivate product
- `GET /api/search/products?q=...` - Search products
- `GET /api/projects` - Fetch projects
- `POST /api/projects` - Create project
- `POST /api/projects/:id/schedule` - Add schedule item
- `DELETE /api/projects/:id/schedule/:itemId` - Delete schedule item

## Responsive Design
- **Mobile-first** approach
- **Sidebar** collapsible on mobile (menu icon)
- **Tables** scrollable on small screens
- **Modals** responsive and full-screen on mobile

## State Management
- Uses React hooks (useState, useEffect)
- SWR-compatible for future data fetching improvements
- Proper loading and error states throughout

## Accessibility
- Semantic HTML (main, header, nav)
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliant

## Future Enhancements
1. Dark mode toggle
2. Advanced filtering and sorting
3. Bulk operations on products/brands
4. CSV export functionality
5. User preferences and layouts
6. Real-time collaboration features
\`\`\`

Great! Now let me create one more important file - a Button component fix to ensure the loading state works:
