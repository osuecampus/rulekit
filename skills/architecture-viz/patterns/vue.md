# Vue.js Pattern Detection

Framework-specific patterns for Vue 2 and Vue 3 applications.

## Framework Identification

**Dependencies in package.json:**

- `"vue": "^3.x.x"` → Vue 3
- `"vue": "^2.x.x"` → Vue 2
- `"@vue/cli-service"` → Vue CLI project
- `"vite"` + `"@vitejs/plugin-vue"` → Vite + Vue project

## Entry Point Patterns

### Vue 3 Standard

```javascript
// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
```

**Detection:**

- `createApp()` function
- `.use()` for plugins
- `.mount()` for DOM mounting

### Vue 2 Standard

```javascript
// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
```

**Detection:**

- `new Vue()` constructor
- Options object with `router`, `store`, `render`
- `.$mount()` method

## Component Detection

### Single File Components (SFC)

- **File extension:** `.vue`
- **Structure:** `<template>`, `<script>`, `<style>`

### Naming Conventions

**Singleton Components:**

- Pattern: `The*.vue` (e.g., `TheHeader.vue`, `TheNavbar.vue`, `TheFooter.vue`)
- Purpose: Layout components, single instance per app
- Location: Usually in `components/core/` or `components/layout/`

**View Components:**

- Pattern: `*View.vue` (e.g., `HomeView.vue`, `ActivityView.vue`)
- Purpose: Page-level components, route targets
- Location: Usually in `views/` or `pages/`

**Feature Components:**

- Pattern: `*Component.vue` or descriptive names
- Purpose: Reusable feature implementations
- Location: Organized by type or feature

### Component Hierarchy Discovery

**From Template:**

```vue
<template>
  <div>
    <TheHeader />
    <CustomAlert :message="alert" />
    <router-view />
  </div>
</template>
```

**Extract:**

- Child components: `TheHeader`, `CustomAlert`
- Dynamic components: `router-view` (router placeholder)
- Props passed: `:message="alert"`

**From Script:**

```vue
<script>
import TheHeader from '@/components/core/TheHeader'
import CustomAlert from '@/components/ui/CustomAlert'

export default {
  components: {
    TheHeader,
    CustomAlert
  }
}
</script>
```

**Extract:**

- Import paths reveal organization
- `components` object lists direct children
- `@` alias typically maps to `src/`

## State Management Detection

### Vuex (Vue 2 and Vue 3)

**Package:** `"vuex": "^4.x.x"` (Vue 3) or `"vuex": "^3.x.x"` (Vue 2)

**Store Structure:**

```javascript
// src/store/index.js
import { createStore } from 'vuex'
import app from './app'
import auth from './auth'

export default createStore({
  modules: {
    app,
    auth
  }
})
```

**Module Pattern:**

```javascript
// src/store/app.js
export default {
  state: { /* ... */ },
  mutations: { /* ... */ },
  actions: { /* ... */ },
  getters: { /* ... */ }
}
```

**Detection Rules:**

- Store in `src/store/`
- `index.js` imports modules
- Each module exports object with state/mutations/actions/getters
- Namespaced modules: `namespaced: true`

**Component Integration:**

```vue
<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['user', 'token']),
    ...mapGetters(['isAuthenticated'])
  },
  methods: {
    ...mapActions(['login', 'logout'])
  }
}
</script>
```

**Extract:**

- State dependencies: Components using `mapState`
- Getter dependencies: Components using `mapGetters`
- Action dispatchers: Components using `mapActions`

### Pinia (Vue 3)

**Package:** `"pinia": "^2.x.x"`

**Store Pattern:**

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: ''
  }),
  actions: {
    updateUser() { /* ... */ }
  }
})
```

**Detection:**

- Stores in `src/stores/` or `src/store/`
- `defineStore()` function
- Store names: `use*Store` convention
- Composition API: `ref()` and `computed()` in setup stores

## Router Detection

### Vue Router 4 (Vue 3)

**Package:** `"vue-router": "^4.x.x"`

**Router Configuration:**

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue') // Lazy loading
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
```

**Detection Rules:**

- `createRouter()` and `createWebHistory()`
- `routes` array with path/component mapping
- Lazy loading: `() => import()`
- Route guards: `beforeEnter`, `router.beforeEach()`

**Route Guards:**

```javascript
const routes = [
  {
    path: '/admin',
    component: AdminView,
    beforeEnter: (to, from, next) => {
      // Guard logic
    }
  }
]
```

**Extract:**

- Protected routes (with guards)
- Lazy-loaded routes
- Nested routes (children array)
- Route parameters (`:id`)

### Vue Router 3 (Vue 2)

Similar structure but uses:

- `import VueRouter from 'vue-router'`
- `new VueRouter({ routes })`

## Mixin Pattern

**Mixin File:**

```javascript
// src/helpers/DatastoreAPI.js
export default {
  computed: {
    entryId() {
      return this.$store.state.datastore.entryId
    }
  },
  methods: {
    async readEntry() {
      // Shared logic
    }
  }
}
```

**Usage:**

```vue
<script>
import DatastoreAPI from '@/helpers/DatastoreAPI'

export default {
  mixins: [DatastoreAPI],
  // Component now has readEntry() method
}
</script>
```

**Detection:**

- Files exporting object with `computed`/`methods` but no `template`
- Usually in `helpers/`, `mixins/`, or `utils/`
- Applied via `mixins: [...]` array in components

## Provide/Inject Pattern

**Provider (Parent):**

```vue
<script>
export default {
  provide() {
    return {
      theme: this.theme
    }
  }
}
</script>
```

**Consumer (Child):**

```vue
<script>
export default {
  inject: ['theme']
}
</script>
```

**Detection:**

- `provide` option or `provide()` method
- `inject` option or `inject: []` array

## Composition API (Vue 3)

**Setup Function:**

```vue
<script>
import { ref, computed, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    
    onMounted(() => {
      console.log('Mounted')
    })
    
    return { count, double }
  }
}
</script>
```

**Script Setup (Syntactic Sugar):**

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
</script>
```

**Detection:**

- `<script setup>` tag
- `setup()` function in Options API
- Imports from `'vue'`: `ref`, `reactive`, `computed`, `watch`

## Composables Pattern

**Composable File:**

```javascript
// src/composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  
  return { count, increment }
}
```

**Usage:**

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, increment } = useCounter()
</script>
```

**Detection:**

- Files in `composables/` or `hooks/`
- Functions named `use*`
- Export functions that return reactive values

## Directive Detection

**Custom Directives:**

```javascript
// src/directives/focus.js
export default {
  mounted(el) {
    el.focus()
  }
}
```

**Registration:**

```javascript
// main.js
import focus from './directives/focus'
app.directive('focus', focus)
```

**Usage:**

```vue
<template>
  <input v-focus />
</template>
```

**Detection:**

- Files in `directives/`
- `app.directive()` or `Vue.directive()` calls
- Lifecycle hooks: `mounted`, `updated`, `unmounted`

## Plugin Detection

**Plugin Structure:**

```javascript
// src/plugins/myPlugin.js
export default {
  install(app, options) {
    app.config.globalProperties.$myMethod = () => {}
  }
}
```

**Registration:**

```javascript
// main.js
import myPlugin from './plugins/myPlugin'
app.use(myPlugin)
```

**Detection:**

- Files in `plugins/`
- Objects with `install` method
- `app.use()` calls in main.js

## API Integration Patterns

**Axios Integration:**

```javascript
// src/apis/base.js
import axios from 'axios'

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL
})

instance.interceptors.request.use(config => {
  // Add auth token
  return config
})

export default instance
```

**Service Files:**

```javascript
// src/apis/content.js
import api from './base'

export async function readContentEntries() {
  return api.get('/content/entries')
}
```

**Detection:**

- `axios` or `fetch` in dependencies
- `apis/`, `api/`, or `services/` directory
- Base configuration file
- Service files exporting async functions
- URL construction from `process.env.VUE_APP_*`

## Environment Variables

**Pattern:**

- Prefix: `VUE_APP_*`
- Access: `process.env.VUE_APP_API_URL`
- Files: `.env`, `.env.local`, `.env.production`, `.env.development`

**Common Variables:**

- `VUE_APP_API_URL` - Backend API URL
- `VUE_APP_PUBLIC_KEY` - Public identifier
- `VUE_APP_DEBUG` - Debug mode toggle
- `VUE_APP_USE_*` - Feature flags

## Component Organization Patterns

### By Type (Most Common)

```
src/components/
├── core/          # Layout/infrastructure
├── ui/            # Reusable UI components
├── forms/         # Form components
└── [feature]/     # Feature-specific
```

### By Feature

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── store.js
│   │   └── routes.js
│   └── dashboard/
```

### Atomic Design

```
src/components/
├── atoms/         # Basic building blocks
├── molecules/     # Simple combinations
├── organisms/     # Complex components
└── templates/     # Page layouts
```

## Build Tool Detection

**Vue CLI:**

- `vue.config.js` present
- `@vue/cli-service` in devDependencies
- Scripts: `vue-cli-service serve/build`

**Vite:**

- `vite.config.js` or `vite.config.ts`
- `vite` in devDependencies
- `@vitejs/plugin-vue` present
- Scripts: `vite`, `vite build`

## Testing Integration

**Unit Tests:**

- `@vue/test-utils` - Official testing library
- `vitest` or `jest` - Test runners
- Test files: `*.test.js`, `*.spec.js`

## Summary: Key Detection Points

1. **Version:** Check `vue` version in package.json
2. **State:** Look for `vuex` or `pinia`
3. **Router:** Check for `vue-router`
4. **API Style:** Options API vs Composition API (setup, script setup)
5. **Components:** Scan `.vue` files, check naming patterns
6. **Organization:** Identify folder structure pattern
7. **Mixins/Composables:** Check for reusable logic patterns
8. **Build Tool:** `vue.config.js` (CLI) vs `vite.config.js` (Vite)
