# @ldesign/router-vue2

Vue 2 router adapter for LDesign Router system.

## Installation

```bash
pnpm add @ldesign/router-vue2 vue-router@3
```

## Usage

```typescript
import { createVue2Router } from '@ldesign/router-vue2'

const router = createVue2Router({
  mode: 'history',
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ],
})

export default router
```

## Features

- ✅ Vue 2.6+ and 2.7+ support
- ✅ Vue Router 3.x integration
- ✅ TypeScript support
- ✅ Navigation guards
- ✅ Route meta fields
- ✅ Programmatic navigation

## API

### createVue2Router(options)

Creates a Vue Router instance for Vue 2.

```typescript
import { createVue2Router } from '@ldesign/router-vue2'

const router = createVue2Router({
  mode: 'history',
  base: '/',
  routes: [...],
})
```

### Navigation Methods

```typescript
import { push, replace, go, back, forward } from '@ldesign/router-vue2'

// Navigate to a route
push(router, '/about')

// Replace current route
replace(router, '/home')

// Go back/forward
back(router)
forward(router)
go(router, -1)
```

### Route Guards

```typescript
import { beforeEach, afterEach } from '@ldesign/router-vue2'

beforeEach(router, (to, from, next) => {
  // Guard logic
  next()
})

afterEach(router, (to, from) => {
  // After navigation logic
})
```

## License

MIT

