# LDesign Router Example

This is a comprehensive example application demonstrating the features and capabilities of LDesign Router.

## Features Demonstrated

### Core Routing
- Basic routing with Vue Router integration
- Dynamic routes with parameters
- Route guards and navigation hooks
- Programmatic navigation

### Device Adaptation
- Automatic device type detection (desktop, tablet, mobile)
- Responsive component rendering
- Device-specific route handling

### Tab Management
- Multi-tab navigation interface
- Tab persistence across sessions
- Drag and drop tab reordering
- Tab closing and management

### Breadcrumb Navigation
- Automatic breadcrumb generation
- Custom breadcrumb configuration
- Hierarchical navigation display

### Caching System
- Multiple caching strategies (LRU, LFU, FIFO)
- Component state preservation
- Cache performance monitoring

### Animation Effects
- Route transition animations
- Customizable animation types
- Performance-optimized transitions

### Permission Management
- Role-based access control
- Route-level permissions
- Dynamic permission checking

### Theme System
- Light/dark theme switching
- System theme detection
- Custom theme support
- Theme persistence

### Internationalization
- Multi-language support
- Dynamic language switching
- Locale-specific formatting
- Browser language detection

### Development Tools
- Performance monitoring
- Navigation tracking
- Cache statistics
- Debug information

## Getting Started

### Prerequisites
- Node.js 16.0.0 or higher
- npm 7.0.0 or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format
```

## Project Structure

```
example/
├── locales/           # Internationalization files
│   ├── zh-CN.json    # Chinese translations
│   └── en-US.json    # English translations
├── views/            # Page components
│   ├── Home.vue      # Home page
│   ├── About.vue     # About page
│   ├── Contact.vue   # Contact page
│   └── User.vue      # User profile page
├── App.vue           # Root component
├── main.ts           # Application entry point
├── index.html        # HTML template
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Package configuration
```

## Configuration

The example demonstrates various configuration options:

### Router Configuration
```typescript
const router = createLDesignRouter({
  history: createWebHashHistory(),
  routes: [...],

  // Device management
  deviceManager: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    }
  },

  // Tab management
  tabsManager: {
    enabled: true,
    persistent: true,
    closable: true,
    draggable: true
  },

  // Theme management
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    persistent: true,
    systemDetection: true
  },

  // Internationalization
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    persistent: true,
    browserLanguageDetection: true
  }
})
```

## Usage Examples

### Basic Navigation
```vue
<template>
  <RouterLink to="/about">
    About
  </RouterLink>
  <RouterView />
</template>
```

### Using Composables
```vue
<script setup>
import { useDevice, useRoute, useRouter, useTabs } from '@ldesign/router'

const router = useRouter()
const route = useRoute()
const device = useDevice()
const tabs = useTabs()

// Navigate programmatically
function goToUser() {
  router.push('/user/123')
}

// Add a new tab
function addTab() {
  tabs.addTab({
    name: 'new-tab',
    path: '/new-page',
    title: 'New Page'
  })
}
</script>
```

### Theme Switching
```vue
<script setup>
import { useTheme } from '@ldesign/router'

const theme = useTheme()

function toggleTheme() {
  theme.setTheme(theme.currentTheme === 'light' ? 'dark' : 'light')
}
</script>
```

### Internationalization
```vue
<script setup>
import { useI18n } from '@ldesign/router'

const i18n = useI18n()

function switchLanguage() {
  i18n.setLocale(i18n.currentLocale === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<template>
  <h1>{{ i18n.t('home.title') }}</h1>
</template>
```

## Performance

The example includes performance monitoring and optimization:

- **Bundle Size**: Optimized for minimal bundle size
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Smart caching for improved performance
- **Lazy Loading**: Components loaded on demand

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

MIT License - see the [LICENSE](../LICENSE) file for details.
