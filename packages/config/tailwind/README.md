# @project/config/tailwind

Shared Tailwind CSS configuration and theme for all apps.

## Purpose

Provides a centralized Tailwind CSS theme and configuration that ensures visual consistency across:

- Web app (`@project/web`)
- Admin app (`@project/admin`)
- Marketing site (`@project/marketing`)
- Mobile app (`@project/mobile`)

## Files

### `preset.js`

Tailwind CSS preset containing:

- **Colors**: Semantic color tokens using CSS variables (primary, secondary, destructive, muted, accent, etc.)
- **Border Radius**: Configurable radius using CSS variables
- **Animations**: Accordion animations for UI components
- **Font Family**: Geist font family

### `globals.css`

Global CSS file containing:

- Tailwind directives (`@tailwind base/components/utilities`)
- CSS custom properties for light and dark modes
- Theme color variables (HSL format)
- Chart color palette

## Usage

### In App Tailwind Config

```javascript
// apps/{web,admin,marketing,mobile}/tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [
    require('nativewind/preset'),
    require('@project/config/tailwind/preset'), // ← Shared preset
  ],
  theme: {
    extend: {}, // App-specific overrides go here
  },
  plugins: [],
};
```

### In App CSS

```css
/* apps/{web,admin,marketing,mobile}/app/globals.css */
@import '@project/config/tailwind/globals.css';
```

## Theme Colors

All colors use CSS custom properties and support light/dark modes:

- `background` / `foreground` - Base colors
- `card` / `card-foreground` - Card backgrounds
- `popover` / `popover-foreground` - Popover backgrounds
- `primary` / `primary-foreground` - Primary actions
- `secondary` / `secondary-foreground` - Secondary actions
- `destructive` / `destructive-foreground` - Destructive actions
- `muted` / `muted-foreground` - Muted/disabled states
- `accent` / `accent-foreground` - Accent colors
- `border` - Border colors
- `input` - Input borders
- `ring` - Focus ring colors

### Usage in Components

```typescript
// Using semantic color tokens
<View className="bg-card border-border">
  <Text className="text-foreground">Content</Text>
  <Button className="bg-primary text-primary-foreground">
    Action
  </Button>
</View>
```

## Dark Mode

Dark mode is supported via CSS variables. Toggle dark mode by adding the `dark` class to the root element.

## Customization

Apps can override or extend the shared theme in their own `tailwind.config.js`:

```javascript
module.exports = {
  presets: [
    require('nativewind/preset'),
    require('@project/config/tailwind/preset'),
  ],
  theme: {
    extend: {
      // App-specific customizations
      colors: {
        brand: '#your-color',
      },
    },
  },
};
```

## Benefits

- **Consistency**: All apps share the same design system
- **Maintainability**: Update theme in one place, applies everywhere
- **Type Safety**: CSS variables provide runtime theme switching
- **DRY**: No duplication of theme configuration
- **Scalability**: Easy to add new apps with consistent styling
