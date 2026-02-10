# Common Architecture Patterns

Framework-agnostic patterns found across modern web applications.

## File Structure Conventions

### Standard Directories

**Source Code:**

- `src/` - Primary source directory (most common)
- `app/` - Alternative source directory (Next.js, some frameworks)
- `lib/` - Library/shared code

**Components:**

- `components/` - Reusable UI components
- `views/` or `pages/` - Page-level components
- `layouts/` - Layout templates
- `templates/` - Component or page templates

**State Management:**

- `store/` or `stores/` - State management modules
- `redux/` - Redux-specific (React)
- `context/` - React Context providers
- `state/` - Generic state directory

**Routing:**

- `router/` or `routes/` - Route configuration
- `pages/` - File-based routing (Next.js, Nuxt, SvelteKit)

**API/Services:**

- `api/` or `apis/` - API integration layer
- `services/` - Business logic services
- `lib/api/` - API utilities

**Utilities:**

- `utils/` or `helpers/` - Utility functions
- `lib/` - Shared libraries
- `hooks/` - Custom hooks (React) or composables (Vue)

**Configuration:**

- `data/` or `config/` - Configuration files
- `constants/` - Constant values

**Assets:**

- `assets/` - Images, fonts, static files
- `public/` - Publicly accessible static files
- `static/` - Static assets

**Styling:**

- `styles/` or `css/` - Stylesheets
- `theme/` - Theming configuration

**Testing:**

- `tests/` or `__tests__/` - Test files
- `*.test.js` or `*.spec.js` - Co-located tests

## Naming Conventions

### Component Naming

**PascalCase (Most Common):**

- `UserProfile.jsx`, `CustomButton.vue`, `DataTable.tsx`
- Standard for React, Vue, Angular

**kebab-case:**

- `user-profile.js`, `custom-button.vue`
- Alternative Vue style, Web Components

**Prefix Patterns:**

- `The*` - Singleton components (TheHeader, TheNavbar)
- `Base*` - Base/primitive components (BaseButton, BaseInput)
- `App*` - App-specific components (AppSidebar)
- `V*` or `*Widget` - Vendor/third-party components

**Suffix Patterns:**

- `*View` - Page/view components (HomeView, DashboardView)
- `*Page` - Page components (HomePage, AboutPage)
- `*Container` - Container/smart components
- `*Component` - Explicit component marker
- `*Item` - List item components (TodoItem, CardItem)

### File Naming

**Module Exports:**

- `index.js` - Barrel exports, main entry point
- `main.js` - Application entry point
- `App.jsx` - Root component

**Configuration:**

- `config.js` - Configuration
- `constants.js` - Constants
- `schema.json` - Data schemas

## Component Patterns

### Container/Presenter (Smart/Dumb)

**Container (Smart):**

- Manages state and logic
- Connects to store/context
- Fetches data
- Location: Often in `containers/` or alongside views

**Presenter (Dumb):**

- Receives data via props
- Purely presentational
- No business logic
- Location: In `components/`

**Detection:**

- Containers: Import state management, have complex logic
- Presenters: Only props, minimal logic

### Higher-Order Components (HOC)

**Pattern:**

```javascript
// withAuth.js
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    // Add authentication logic
    return <Component {...props} />
  }
}
```

**Detection:**

- Functions that take components and return components
- Typically prefixed with `with*`
- Found in `hoc/` or `enhancers/`

### Render Props

**Pattern:**

```javascript
<DataProvider render={(data) => (
  <Component data={data} />
)} />
```

**Detection:**

- Components accepting `render` or `children` as function props

### Compound Components

**Pattern:**

```javascript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

**Detection:**

- Components with sub-components as static properties

## State Management Patterns

### Flux/Redux Pattern

**Flow:** Action → Dispatcher → Store → View

**Structure:**

- `actions/` - Action creators
- `reducers/` - State reducers
- `store/` - Store configuration
- `selectors/` - State selectors

**Detection:**

- `dispatch()` calls
- `combineReducers()`
- `createStore()` or `configureStore()`

### Context/Provider Pattern

**Pattern:**

```javascript
// Provider
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// Consumer
const theme = useContext(ThemeContext)
```

**Detection:**

- `createContext()` calls
- `*.Provider` components
- `useContext()` hook usage

### Module Pattern

**Structure:**

```javascript
// store/user.js
export default {
  state: { },
  mutations: { },
  actions: { },
  getters: { }
}
```

**Detection:**

- Modular store organization
- Namespaced modules
- Index file aggregating modules

## Routing Patterns

### Declarative Routes

**Pattern:**

```javascript
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/user/:id', component: User }
]
```

**Detection:**

- Routes array with path/component mapping
- `:param` for dynamic segments
- Route nesting with `children`

### File-Based Routing

**Pattern:**

```
pages/
├── index.jsx       # → /
├── about.jsx       # → /about
└── users/
    └── [id].jsx    # → /users/:id
```

**Detection:**

- `pages/` directory
- File names map to routes
- `[param]` for dynamic routes
- `index` files for base paths

### Route Guards

**Patterns:**

- `beforeEnter` - Route-level guard
- `beforeEach` - Global guard
- `canActivate` - Angular guard
- Middleware functions

**Detection:**

- Functions with `(to, from, next)` signature
- Authentication checks
- Role-based access control

### Lazy Loading

**Pattern:**

```javascript
const About = () => import('./views/About.vue')
// or
const About = lazy(() => import('./About'))
```

**Detection:**

- Dynamic `import()` statements
- `lazy()` wrapper (React)
- Code splitting indicators

## API Integration Patterns

### Centralized API Client

**Pattern:**

```javascript
// api/client.js
import axios from 'axios'

const client = axios.create({
  baseURL: process.env.API_URL
})

client.interceptors.request.use(config => {
  // Add auth token
  return config
})

export default client
```

**Detection:**

- Base API configuration file
- Interceptors for auth/logging
- Shared instance creation

### Service Layer

**Pattern:**

```javascript
// services/userService.js
import api from './api'

export async function getUser(id) {
  return api.get(`/users/${id}`)
}

export async function updateUser(id, data) {
  return api.put(`/users/${id}`, data)
}
```

**Detection:**

- Service files grouped by domain
- Functions named after HTTP methods or actions
- Abstraction over raw API calls

### Repository Pattern

**Pattern:**

```javascript
class UserRepository {
  async findById(id) { }
  async create(data) { }
  async update(id, data) { }
  async delete(id) { }
}
```

**Detection:**

- Classes with CRUD methods
- Repository suffix or naming
- Data access abstraction

## Authentication Patterns

### JWT Token

**Storage:**

- `localStorage.setItem('token', jwt)`
- `sessionStorage.setItem('token', jwt)`
- Cookie-based

**Usage:**

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

**Detection:**

- `jwt-decode` or similar libraries
- Token in localStorage/sessionStorage
- Bearer token in headers
- Auth interceptors

### OAuth/SSO

**Detection:**

- OAuth libraries (`@auth0/auth0-spa-js`, `next-auth`)
- Redirect URIs in config
- Token refresh logic

### Protected Routes

**Pattern:**

```javascript
{
  path: '/admin',
  component: Admin,
  beforeEnter: requireAuth
}
```

**Detection:**

- Route guards checking auth state
- Redirect logic for unauthenticated users
- Role-based access checks

## Data Fetching Patterns

### Component-Level Fetching

**Pattern:**

```javascript
useEffect(() => {
  fetchData()
}, [])
```

**Detection:**

- Fetch calls in lifecycle hooks
- `useEffect`, `onMounted`, `componentDidMount`

### Global State Fetching

**Pattern:**

```javascript
// Actions fetch data, commit to store
store.dispatch('fetchUsers')
```

**Detection:**

- Async actions in store
- Data fetched outside components
- Store mutations with API data

### React Query / SWR Pattern

**Pattern:**

```javascript
const { data, error, isLoading } = useQuery('users', fetchUsers)
```

**Detection:**

- `react-query`, `swr`, or `@tanstack/react-query`
- Custom hooks for data fetching
- Cache management

## Configuration Patterns

### Environment Variables

**Common Prefixes:**

- `REACT_APP_*` - Create React App
- `VITE_*` - Vite
- `NEXT_PUBLIC_*` - Next.js (public)
- `VUE_APP_*` - Vue CLI
- `NUXT_*` - Nuxt

**Access:**

```javascript
process.env.REACT_APP_API_URL
import.meta.env.VITE_API_URL
```

**Detection:**

- `.env` files in root
- `process.env` or `import.meta.env` usage
- Framework-specific prefixes

### Config Files

**Pattern:**

```javascript
// config/app.js
export default {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 5000
  },
  features: {
    enableChat: true
  }
}
```

**Detection:**

- `config.js` or `config.json` files
- Centralized configuration
- Feature flags

## Module Boundaries

### Subsystems/Features

**Pattern:**

```
src/
├── admin/              # Admin subsystem
│   ├── components/
│   ├── views/
│   └── store/
├── auth/               # Auth subsystem
│   ├── components/
│   ├── services/
│   └── store/
```

**Detection:**

- Top-level feature directories
- Self-contained modules
- Separate route configurations
- Per-feature stores

### Shared/Common

**Pattern:**

```
src/
├── shared/
│   ├── components/
│   ├── utils/
│   └── hooks/
```

**Detection:**

- `shared/`, `common/`, or `core/` directories
- Reusable cross-feature code

## Dependency Injection

### Constructor Injection

**Pattern:**

```javascript
class UserService {
  constructor(apiClient) {
    this.api = apiClient
  }
}
```

**Detection:**

- Classes with constructor parameters
- Manual dependency passing

### Framework DI

**Angular:**

```typescript
@Injectable()
class UserService {
  constructor(private http: HttpClient) {}
}
```

**Detection:**

- `@Injectable()` decorator
- Constructor injection

## Error Handling Patterns

### Error Boundaries (React)

**Pattern:**

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Handle error
  }
}
```

**Detection:**

- Components with `componentDidCatch`
- Wrapping other components

### Global Error Handlers

**Pattern:**

```javascript
axios.interceptors.response.use(
  response => response,
  error => {
    // Global error handling
  }
)
```

**Detection:**

- Response interceptors
- Global error listeners
- Error logging services

## Build & Deployment Patterns

### Monorepo

**Detection:**

- `lerna.json` or `pnpm-workspace.yaml`
- `packages/` or `apps/` directory
- Multiple `package.json` files

### Micro-Frontends

**Detection:**

- Module federation config
- Multiple entry points
- Shell/host architecture

## Summary: Key Detection Points

1. **Directory structure** → Organization pattern
2. **package.json dependencies** → Framework and libraries
3. **Entry point** → Application bootstrap
4. **Naming conventions** → Component types
5. **Import patterns** → Dependencies and relationships
6. **File locations** → Architectural boundaries
7. **Authentication flow** → Security architecture
8. **State management** → Data flow pattern
9. **API integration** → External dependencies
10. **Environment variables** → Configuration approach
