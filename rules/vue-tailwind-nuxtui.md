---
stack: vue-tailwind-nuxtui
---

# Vue.js + Tailwind v4 + Nuxt UI v4 Patterns and Conventions

## Component Structure

All Vue components follow this structure:

```vue
<template>
  <!-- HTML template with Tailwind CSS v4 utility classes and Nuxt UI v4 components -->
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
/* Component-specific styles (only when Tailwind utilities are insufficient) */
</style>
```

## State Management Patterns

- Use **Vuex** for all application state (no local component state for shared data)
- Access store via `mapState`, `mapGetters`, and `mapActions` options API approach
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
// Parent - use camelCase for prop names and event names
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
this.$emit('layerChange', layerId)

// Parent listens
<MapLayer @layerChange="updateCurrentLayer" />
```

### Rules

- ✅ **DO**: Use camelCase for prop names and event names, even if used in a template
- ❌ **DON'T**: Use kebab-case for prop names and event names

## Nuxt UI v4 Components

This project uses [Nuxt UI v4](https://ui.nuxt.com) which provides pre-built components on top of Tailwind CSS v4.

### Core Nuxt UI Components

- **UApp**: Root application wrapper (required)
- **UButton**, **UCard**, **UModal**, **USlideover**, **UAlert**, **UAccordion**, **UProgress**
- **UInput**, **UTextarea**, **USelect**: Form components
- See [Nuxt UI documentation](https://ui.nuxt.com) for full list

### Custom Wrapper Components (`src/components/shared/`)

These wrapper components are primarily used in boilerplate parts of the application (header, footer, core UI). You are not required to use them in custom views - use Nuxt UI components directly if preferred.

- **AppCard**: Wraps `UCard` with color variants
- **AppAlert**: Wraps `UAlert` with type prop mapping
- **AppModal**: Wraps `UModal` with simplified API
- **AppSlideover**, **AppAccordion**, **AppProgress**: Similar wrappers

### Reusable UI Components (`src/components/ui/`)

- **SaveButton**, **LoadingBar**, **UserControls**, **UserInstructions**, **CertificateOfCompletion**

### Core Components (`src/components/core/`)

- **TheHeader**, **TheNavbar**, **TheFooter**, **TheAccessibility**, **VersionCheck**, **DataCollectionModal**

### Debug Components (`src/components/debug/`)

- **TheDebugger**, **TheBreakpoints**, **DebugEnv**, **DebugAuth**, **DebugDatastore**
- Use during development; remove or disable in production

## Vue Router Integration

- All routes are lowercase (`/activity`, `/landing`)
- Use hash history (`/#/` URLs) for S3 compatibility
- Route guards use store getters for authentication

## Custom Directives

- **v-focus**: Automatically focus elements (`src/directives/focus.js`)

## Styling Conventions

- **Avoid custom CSS at all costs** - use Tailwind CSS v4 utility classes for all styling
- Never use inline `style` attributes - Tailwind has utilities for virtually everything
- For reusable style collections, use the `@apply` directive in `src/css/main.css`
- Icons via Iconify (`@iconify/vue`) with Bootstrap Icons (`i-bi-*`) or Lucide (`i-lucide-*`) icon sets

## Theming

This project uses a single `primary` theme that can be customized per project in `src/css/main.css`.

- **Boilerplate components** (header, footer, navbar, admin, modals) use hardcoded Tailwind colors (e.g., `bg-gray-900`, `text-blue-600`) - do not modify these
- **Activity views** use the `primary` semantic color which maps to Nuxt UI's color system - customize this per project
- To create a custom theme, modify the `--color-primary-*` values in `src/css/main.css`

### Example: OSU-Branded Activity Theme

In `src/css/main.css`, replace the primary color values:

```css
@theme static {
  /* Override primary with OSU orange */
  --color-primary-500: #d73f09; /* beaver-orange */
  --color-primary-600: #b83508;
  --color-primary-700: #9a2c07;
}
```

Then in activity views:

```vue
<UButton color="primary">Submit</UButton>
<!-- Uses OSU orange -->
<div class="bg-primary-500 text-white">Themed content</div>
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
    loadData() {
      const cb = () => {
        this.mapFromDatastore(this.entry);
      };
      this.readEntry(cb);
    }
  },
  watch: {
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
- ✅ **DO**: Only modify DatastoreAPI.js to add missing functionality like promise returns or a deleteEntry() method.
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

4. **Mixin Usage**: The `DatastoreAPI` mixin provides the necessary methods (`readEntry`, `updateEntry`) and should be included in any component/view that needs to interact with the datastore. If you need promise-based behavior, you can extend the mixin so that the relevant methods return a promise.

## Reference Files

- **App Structure**: `src/App.vue` - Shows UApp wrapper
- **Fetching Pattern**: `src/App.vue` - DatastoreAPI mixin usage
- **API Helper**: `src/helpers/DatastoreAPI.js`
- **Vuex Store**: `src/store/datastore.js`
- **Component Examples**: `src/components/shared/AppCard.vue`, `src/views/ActivityView.vue`

## Naming Conventions

- **Components**: PascalCase (`ActivityView.vue`)
- **Props/Events**: camelCase (`itemData`, `itemSelect`)
- **Store modules**: lowercase (`datastore.js`, `app.js`)
- **CSS classes**: kebab-case (`item-details`)

## Best Practices

1. **Options API**: Prefer over Composition API
2. **Reactivity**: Use `data()` and `computed()` for reactive data
3. **Props**: Always validate with type and required constraints
4. **Events**: Document all emitted events
5. **Store**: Keep business logic in store actions, not components
6. **Async**: Use async/await for API calls
7. **Responsive**: Design for all screen sizes
8. **Accessibility**: Prefer semantic HTML; use ARIA only when needed

## High-Level Lifecycle and Flow

- Keep lifecycle hooks high-level and uncluttered
- Extract low-level logic into helpers

## Function Extraction and Helpers

- Functions without Vue dependencies go in `src/helpers/`
- Prefer small, single-responsibility helpers

## JSDoc and Type Checking

- Use JSDoc consistently
- In `.vue` files: JSDoc for documentation (no type-checking required)
- In `.js` helper files: enable `// @ts-check` and use JSDoc types
