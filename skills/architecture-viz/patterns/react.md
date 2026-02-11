# React Pattern Detection

Framework-specific patterns for React applications.

## Framework Identification

**Dependencies in package.json:**

- `"react": "^18.x.x"` or `"react": "^17.x.x"` etc.
- `"react-dom"` - DOM rendering
- `"react-scripts"` - Create React App
- `"next"` - Next.js framework
- `"vite"` + `"@vitejs/plugin-react"` - Vite + React

## Entry Point Patterns

### Create React App

```javascript
// src/index.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
```

### Next.js

```javascript
// pages/_app.js
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

**Detection:**

- `ReactDOM.createRoot()` (React 18+)
- `ReactDOM.render()` (React 17 and earlier)
- Next.js: `pages/_app.js` custom App component

## Component Patterns

### Function Components

```javascript
function MyComponent(props) {
  return <div>{props.children}</div>
}

// or arrow function
const MyComponent = (props) => {
  return <div>{props.children}</div>
}
```

### Class Components (Legacy)

```javascript
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}
```

**Detection:**

- Function components: Functions returning JSX
- Class components: Extend `React.Component`, have `render()` method

## Hooks Pattern (React 16.8+)

### Built-in Hooks

```javascript
import { useState, useEffect, useContext } from 'react'

function MyComponent() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    // Side effects
  }, [])
  
  return <div>{count}</div>
}
```

### Custom Hooks

```javascript
// hooks/useCounter.js
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial)
  const increment = () => setCount(c => c + 1)
  return { count, increment }
}
```

**Detection:**

- Functions named `use*`
- Call built-in hooks inside
- Located in `hooks/` directory

## State Management

### Redux

```javascript
// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
  name: 'user',
  initialState: { },
  reducers: { }
})
```

**Detection:**

- `redux` or `@reduxjs/toolkit` in dependencies
- `store/` directory with slices/reducers
- `useSelector`, `useDispatch` hooks

### Context API

```javascript
const ThemeContext = React.createContext()

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Detection:**

- `createContext()` calls
- Provider components
- `useContext()` hook usage

### Zustand / MobX / Jotai

**Detection:**

- Respective libraries in dependencies
- Store creation patterns
- Hook-based state access

## Routing

### React Router

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

**Detection:**

- `react-router-dom` in dependencies
- `<Routes>`, `<Route>` components
- `useNavigate`, `useParams` hooks

### Next.js File-Based Routing

```
pages/
├── index.js         # → /
├── about.js         # → /about
└── posts/
    └── [id].js      # → /posts/:id
```

**Detection:**

- `pages/` directory structure
- `next/router` usage
- `getStaticProps`, `getServerSideProps`

## Further Patterns

This is a **stub file** for future expansion. React-specific patterns to be added:

- Server Components (React 18+)
- Suspense and Error Boundaries
- Higher-Order Components (HOC)
- Render Props
- PropTypes / TypeScript types
- Styled Components / CSS-in-JS
- Testing patterns (Jest, React Testing Library)

**To extend this file:** Add detection rules for the above patterns as needed for your projects.
