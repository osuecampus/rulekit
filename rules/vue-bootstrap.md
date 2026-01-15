# Vue.js Patterns and Conventions

## Component Structure

All Vue components follow this structure:

```vue
<template>
  <!-- HTML template with Bootstrap 5 classes -->
</template>

<script>
// imports
import { mapGetters, mapActions } from "vuex";

// Component logic here
export default {
  name: "ComponentName",
  components: {
    // Local component registrations
  },
  props: {
    // Props with validation
  },
  // use camelCase for event names, even if it is used in a template
  emits: ["eventName"],
  computed: {
    ...mapGetters(["getterProperty"])
  },
  methods: {
    ...mapActions(["actionProperty"])
  }
};
</script>

<style scoped>
/* Component-specific styles */
</style>
```

## State Management Patterns

- Use **Vuex** for all application state (no local component state for shared data)
- Access store via `mapState`, `mapGetters`, and `mapActions` options API approach:
- Prefer to use the options API over the composition API
- Prefer to use mapGetters and mapActions to access the store, mapState tends to not work as expected, especially with non-primitive data types

```javascript
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "ComponentName",
  components: {
    // Local component registrations
  },
  props: {
    // Props with validation
  },
  emits: ["eventName"],
  computed: {
    // Use the array of strings approach to mapState, mapGetters, and mapActions
    ...mapState(["stateProperty"]),
    ...mapGetters(["getterProperty"])
  },
  methods: {
    ...mapActions(["actionProperty"])
  }
};
```

## Component Communication

### Parent to Child (Props)

```javascript
// Parent
// use camelCase for prop names and event names, even if it is used in a template
<ItemSelector :selectedItem="currentItem" @itemSelect="handleItemSelect" />

// Child Props
props: {
  selectedItem: {
    type: Object,
    required: false,
    validator: (value) => !value || (value.type === 'item')
  }
}
```

### Child to Parent (Events)

```javascript
// Child emits
const handleLayerClick = (layerId) => {
  emit('layerChange', layerId)
}

// Parent listens
<MapLayer @layerChange="updateCurrentLayer" />
```

### Rules

- ✅ **DO**: Use camelCase for prop names and event names, even if it is used in a template.
- ❌ **DON'T**: Use kebab-case for prop names and event names, even if it is used in a template. NOTE: this goes against the Vue.js style guide, but it is important to be consistent on our team.

## Custom Components

### Reusable UI Components (`src/components/ui/`)

- **CustomAlert**: Flexible alert/notification component
- **SaveButton**: Button with confirmation dialog
- **LoadingBar**: Progress indicator
- **UserControls**: Common user interaction controls

### Core Components (`src/components/core/`)

- **TheHeader**: Application header (DO NOT MODIFY main.js structure)
- **TheNavbar**: Navigation component
- **TheFooter**: Application footer
- **TheAccessibility**: Accessibility features

### Debug Components (`src/components/debug/`)

- Use during development for debugging state and data
- Remove or disable in production builds

## Vue Router Integration

- All routes are lowercase (`/activity`, `/landing`)
- Use hash history (`/#/` URLs) for S3 compatibility
- Route guards use store getters for authentication:

```javascript
beforeEnter: store.getters.useAuth ? authUser : null;
```

## Custom Directives

- **v-focus**: Automatically focus elements (`src/directives/focus.js`)

```vue
<input v-focus />
```

## Styling Conventions

- **ALWAYS prefer Bootstrap 5 utility classes** over custom CSS wherever possible
- Use Bootstrap spacing utilities (`m-*`, `p-*`, `mt-*`, `mb-*`, etc.) instead of custom margins/padding
- Use Bootstrap layout utilities (`d-flex`, `justify-content-*`, `align-items-*`) instead of custom flexbox
- Use Bootstrap sizing utilities (`w-*`, `h-*`) instead of custom width/height
- Use Bootstrap color utilities (`text-*`, `bg-*`) instead of custom colors
- Use Bootstrap typography utilities (`fs-*`, `fw-*`, `text-*`) instead of custom or inline font styles
- Use Bootstrap position utilities (`position-*`, `top-*`, `start-*`, etc.) instead of custom positioning
- Only create custom CSS classes when Bootstrap utilities are insufficient
- Component-specific custom styles use `<style scoped>`
- Global custom styles in `src/css/style.css`
- Bootstrap Icons via `bootstrap-icons.css`
- Avoid inline styles unless absolutely necessary for dynamic values

**NEVER use inline `style="font-size"` attributes. Always use Bootstrap `fs-*` utility classes:**

```vue
<!-- ✅ GOOD - Use Bootstrap font size classes -->
<h6 class="fw-bold mb-2 fs-5">Section Title</h6>
<p class="fs-6">Small text</p>

<!-- ❌ BAD - Inline font-size styles -->
<h6 class="fw-bold mb-2" style="font-size: 0.875rem">Section Title</h6>
<p style="font-size: 0.75rem">Small text</p>
```

## Data Fetching from Datastore

### Pattern

When fetching data from the datastore, components/views should:

1. **Use the `DatastoreAPI` mixin** to access the `readEntry()` method
2. **Call `readEntry()` with a callback function** that maps the fetched data to Vuex state
3. **Use the `mapFromDatastore` action** within the callback to transform and store the data
4. NOTE: This may already be in place for a lot of projects, so check before you modify the existing code.

### Example Implementation

```vue
<script>
import DatastoreAPI from "@/helpers/DatastoreAPI";
import { mapState, mapActions } from "vuex";

export default {
  name: "App",
  mixins: [DatastoreAPI],
  computed: {
    ...mapState("datastore", ["entry"])
  },
  methods: {
    ...mapActions(["mapFromDatastore"]),
    // if you need to load data from the datastore from a method
    loadData() {
      const cb = () => {
        this.mapFromDatastore(this.entry);
      };
      this.readEntry(cb);
    }
  },
  watch: {
    // if you need to load data from the datastore after a route change
    $route() {
      if (this.$route.meta?.readEntry) {
        const cb = () => {
          this.mapFromDatastore(this.entry);
        };
        this.readEntry(cb);
      }
    }
  }
};
</script>
```

### Rules

- ✅ **DO**: Call `readEntry(cb)` directly from component/view methods
- ✅ **DO**: Pass a callback function that calls `mapFromDatastore(this.entry)`
- ✅ **DO**: Use the `DatastoreAPI` mixin to access `readEntry()`
- ✅ **DO**: Access the `entry` from Vuex state using `mapState("datastore", ["entry"])`
- ❌ **DON'T**: Call `readEntry()` from within Vuex actions or mutations
- ❌ **DON'T**: Perform API calls directly in Vuex modules

## Data Updating to Datastore

### Pattern

When updating data to the datastore, components/views should:

1. **Use the `DatastoreAPI` mixin** to access the `updateEntry()` method
2. **Use the `mapToDatastore` getter** to collect data from Vuex state
3. **Call `updateEntry()` with the getter value** to save the data

### Example Implementation

```vue
<script>
import DatastoreAPI from "@/helpers/DatastoreAPI";
import { mapGetters } from "vuex";

export default {
  name: "SaveButton",
  mixins: [DatastoreAPI],
  computed: {
    ...mapGetters(["mapToDatastore"])
  },
  methods: {
    save() {
      this.updateEntry(this.mapToDatastore).then(() => {
        // Handle success
      });
    }
  }
};
</script>
```

### Rules

- ✅ **DO**: Call `updateEntry(this.mapToDatastore)` directly from component/view methods
- ✅ **DO**: Use the `mapToDatastore` getter to collect data from Vuex state
- ✅ **DO**: Use the `DatastoreAPI` mixin to access `updateEntry()`
- ✅ **DO**: Handle promises returned by `updateEntry()` for success/error handling
- ✅ **DO**: Only modify DatastoreAPI.js if you need to return a promise that is not already returned by a function, or if there is a deleteEntry() method that is missing. Otherwise do not modify it.
- ✅ **DO**: Remove the `example` fields from src/store/app.js when implementing the datastore functionality for the first time.
- ❌ **DON'T**: Call `updateEntry()` from within Vuex actions or mutations
- ❌ **DON'T**: Perform API calls directly in Vuex modules
- ❌ **DON'T**: Manually construct the payload - always use the `mapToDatastore` getter

## Key Principles

1. **Separation of Concerns**: Vuex modules handle state management and data transformation. Components/views handle API interactions.

2. **Consistency**: Always use the established patterns (`readEntry` with callback, `updateEntry` with `mapToDatastore`) to ensure consistent behavior across the application.

3. **Data Flow**:

   - **Fetching**: API call → Vuex state (`entry`) → Transform via `mapFromDatastore` → Application state
   - **Updating**: Application state → Collect via `mapToDatastore` → API call → Datastore
   - **Never Mutate Props**: Never mutate props in a component. For simple cases, use the `modelValue` and `@update:modelValue` props for two-way binding to the component's state.

4. **Mixin Usage**: The `DatastoreAPI` mixin provides the necessary methods (`readEntry`, `updateEntry`) and should be included in any component/view that needs to interact with the datastore. The mixin seems to be incomplete at the time of writing this, so you may need to modify it to return a promise.

## Reference Files

- **Fetching Pattern**: `src/App.vue`
- **API Helper**: `src/helpers/DatastoreAPI.js`
- **Vuex Store**: `src/store/datastore.js` (state management only)

## Naming Conventions

- **Components**: PascalCase (`ActivityView.vue`, `CustomAlert.vue`)
- **Props/Events**: camelCase (`itemData`, `itemSelect`)
- **Store modules**: lowercase (`datastore.js`, `app.js`)
- **CSS classes**: kebab-case (`item-details`, `layer-selector`)

## Best Practices

1. **Options API**: Prefer the Options API over the Composition API
2. **Reactivity**: Use `data()` and `computed()` for reactive data
3. **Props**: Always validate props with type and required constraints
4. **Events**: Document all emitted events in component comments
5. **Store**: Keep business logic in store actions, not components
6. **Async**: Use async/await pattern for API calls
7. **Responsive**: Design components to work on all screen sizes
8. **Accessibility**: Prefer accessible semantic HTML, but use ARIA labels when necessary. Provide full keyboard navigation.

## High-Level Lifecycle and Flow

- Keep lifecycle hooks and top-level component logic high-level and uncluttered.
- Lifecycle hooks should read like a table of contents: orchestrate calls to small, well-named functions.
- Avoid large inline functions in components that impede understanding of control flow.
- Extract low-level logic into helpers so readers can drill down only when needed.

## Function Extraction and Helpers

- Functions that do not depend on Vue (no `this`, no reactive state) must live in helper modules under `src/helpers/`.
- Prefer small, single-responsibility helpers with clear names and inputs/outputs.
- Components should wire data and call helpers; helpers should implement the mechanics.

## JSDoc and Type Checking

- Use JSDoc consistently.
- In `.vue` files: add JSDoc for documentation/readability; no type-checking required.
- In plain `.js` helper files: enable type-checking via `// @ts-check` at the top and JSDoc types.
- Define shared types with `@typedef` in helpers or import from TS `src/types` when practical.

Example (helper file):

```js
// @ts-check

/**
 * Process item data for display.
 * @param {Array<Object>} items - Raw item records
 * @returns {Object} Processed data structure
 */
export function processItems(items) {
  return items.map(item => ({
    id: item.id,
    label: item.name,
    value: item.value
  }));
}
```
