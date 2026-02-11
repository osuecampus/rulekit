# Common Accessibility Patterns & Fixes

Code examples for fixing common accessibility issues in Vue.js applications.

## Table of Contents

1. [Focus Management](#focus-management)
2. [ARIA Patterns](#aria-patterns)
3. [Keyboard Navigation](#keyboard-navigation)
4. [Live Regions](#live-regions)
5. [Forms](#forms)
6. [Modal Dialogs](#modal-dialogs)
7. [Custom Widgets](#custom-widgets)
8. [Skip Links](#skip-links)
9. [Math & Special Characters](#math--special-characters)

---

## Focus Management

### Preserve Focus After Content Update

```vue
<template>
  <div>
    <input v-model="query" 
           @input="filterItems" 
           aria-label="Search items">
    
    <ul>
      <li v-for="item in filteredItems" 
          :key="item.id"
          :id="`item-${item.id}`"
          tabindex="-1">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: '',
      items: [],
      filteredItems: []
    }
  },
  methods: {
    async filterItems() {
      // Store current focused element
      const activeElement = document.activeElement
      const focusedId = activeElement?.id
      
      // Update content
      this.filteredItems = this.items.filter(item => 
        item.name.toLowerCase().includes(this.query.toLowerCase())
      )
      
      // Restore focus after DOM update
      await this.$nextTick()
      if (focusedId) {
        const element = document.getElementById(focusedId)
        element?.focus()
      }
    }
  }
}
</script>
```

### Focus First Error in Form

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="field in fields" :key="field.name">
      <label :for="field.name">{{ field.label }}</label>
      <input :id="field.name"
             :ref="`input-${field.name}`"
             v-model="formData[field.name]"
             :aria-invalid="errors[field.name] ? 'true' : 'false'"
             :aria-describedby="errors[field.name] ? `error-${field.name}` : null">
      <span v-if="errors[field.name]" 
            :id="`error-${field.name}`"
            role="alert">
        {{ errors[field.name] }}
      </span>
    </div>
    <button type="submit">Submit</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      formData: {},
      errors: {},
      fields: [
        { name: 'name', label: 'Name' },
        { name: 'email', label: 'Email' }
      ]
    }
  },
  methods: {
    handleSubmit() {
      this.errors = this.validate()
      
      if (Object.keys(this.errors).length > 0) {
        // Focus first field with error
        const firstErrorField = this.fields.find(
          field => this.errors[field.name]
        )
        if (firstErrorField) {
          this.$nextTick(() => {
            this.$refs[`input-${firstErrorField.name}`]?.[0]?.focus()
          })
        }
      }
    },
    validate() {
      const errors = {}
      // Validation logic...
      return errors
    }
  }
}
</script>
```

### Focus After Deletion

```vue
<template>
  <ul ref="list">
    <li v-for="(item, index) in items" 
        :key="item.id"
        :ref="`litem-${index}`">
      {{ item.name }}
      <button @click="deleteItem(item.id, index)"
              :aria-label="`Delete ${item.name}`">
        Delete
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  methods: {
    async deleteItem(itemId, index) {
      await this.$store.dispatch('deleteItem', itemId)
      this.items.splice(index, 1)
      
      await this.$nextTick()
      
      // Focus next item, or previous if last, or list if none
      const nextItem = this.$refs[`item-${index}`]?.[0]
      const prevItem = this.$refs[`item-${index - 1}`]?.[0]
      const listElement = this.$refs.list
      
      if (nextItem) {
        nextItem.querySelector('button')?.focus()
      } else if (prevItem) {
        prevItem.querySelector('button')?.focus()
      } else {
        listElement?.focus()
      }
    }
  }
}
</script>
```

---

## ARIA Patterns

### Accordion/Expandable Section

```vue
<template>
  <div class="accordion">
    <h3>
      <button :id="`accordion-${id}`"
              type="button"
              :aria-expanded="isExpanded"
              :aria-controls="`panel-${id}`"
              @click="toggle">
        {{ title }}
      </button>
    </h3>
    <div :id="`panel-${id}`"
         role="region"
         :aria-labelledby="`accordion-${id}`"
         :hidden="!isExpanded">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccordionSection',
  props: {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    initiallyExpanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpanded: this.initiallyExpanded
    }
  },
  methods: {
    toggle() {
      this.isExpanded = !this.isExpanded
    }
  }
}
</script>

<style scoped>
[hidden] {
  display: none;
}
</style>
```

### Tabs Component

```vue
<template>
  <div class="tabs">
    <div role="tablist" :aria-label="tabsLabel">
      <button v-for="(tab, index) in tabs"
              :key="tab.id"
              :id="`tab-${tab.id}`"
              role="tab"
              :aria-selected="selectedIndex === index"
              :aria-controls="`panel-${tab.id}`"
              :tabindex="selectedIndex === index ? 0 : -1"
              @click="selectTab(index)"
              @keydown="handleKeyDown($event, index)">
        {{ tab.label }}
      </button>
    </div>
    
    <div v-for="(tab, index) in tabs"
         :key="`panel-${tab.id}`"
         :id="`panel-${tab.id}`"
         role="tabpanel"
         :aria-labelledby="`tab-${tab.id}`"
         :hidden="selectedIndex !== index"
         tabindex="0">
      <slot :name="tab.id"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabsComponent',
  props: {
    tabs: {
      type: Array,
      required: true,
      // Example: [{ id: 'profile', label: 'Profile' }, ...]
    },
    tabsLabel: {
      type: String,
      default: 'Tabs'
    }
  },
  data() {
    return {
      selectedIndex: 0
    }
  },
  methods: {
    selectTab(index) {
      this.selectedIndex = index
    },
    handleKeyDown(event, currentIndex) {
      let newIndex = currentIndex
      
      switch (event.key) {
        case 'ArrowRight':
          newIndex = (currentIndex + 1) % this.tabs.length
          break
        case 'ArrowLeft':
          newIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length
          break
        case 'Home':
          newIndex = 0
          break
        case 'End':
          newIndex = this.tabs.length - 1
          break
        default:
          return
      }
      
      event.preventDefault()
      this.selectTab(newIndex)
      this.$nextTick(() => {
        document.getElementById(`tab-${this.tabs[newIndex].id}`)?.focus()
      })
    }
  }
}
</script>

<style scoped>
[hidden] {
  display: none;
}

[role="tab"] {
  cursor: pointer;
}

[role="tab"][aria-selected="true"] {
  font-weight: bold;
}
</style>
```

### Disclosure (Show/Hide)

```vue
<template>
  <div>
    <button type="button"
            :aria-expanded="isVisible"
            :aria-controls="contentId"
            @click="toggle">
      {{ buttonText }}
    </button>
    <div :id="contentId" :hidden="!isVisible">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DisclosureWidget',
  props: {
    buttonText: {
      type: String,
      required: true
    },
    contentId: {
      type: String,
      required: true
    },
    initiallyVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isVisible: this.initiallyVisible
    }
  },
  methods: {
    toggle() {
      this.isVisible = !this.isVisible
    }
  }
}
</script>
```

---

## Keyboard Navigation

### Roving Tabindex for List

```vue
<template>
  <ul role="list" 
      @keydown="handleKeyDown">
    <li v-for="(item, index) in items"
        :key="item.id"
        role="listitem"
        :tabindex="currentIndex === index ? 0 : -1"
        :ref="`item-${index}`"
        @click="selectItem(index)"
        @focus="currentIndex = index">
      {{ item.name }}
    </li>
  </ul>
</template>

<script>
export default {
  name: 'RovingList',
  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  methods: {
    handleKeyDown(event) {
      const key = event.key
      let newIndex = this.currentIndex
      
      switch (key) {
        case 'ArrowDown':
          newIndex = Math.min(this.currentIndex + 1, this.items.length - 1)
          break
        case 'ArrowUp':
          newIndex = Math.max(this.currentIndex - 1, 0)
          break
        case 'Home':
          newIndex = 0
          break
        case 'End':
          newIndex = this.items.length - 1
          break
        case 'Enter':
        case ' ':
          this.selectItem(this.currentIndex)
          return
        default:
          return
      }
      
      event.preventDefault()
      this.currentIndex = newIndex
      this.$refs[`item-${newIndex}`]?.[0]?.focus()
    },
    selectItem(index) {
      this.$emit('itemSelected', this.items[index])
    }
  }
}
</script>
```

### Keyboard Shortcut Handler

```vue
<template>
  <div @keydown="handleGlobalShortcuts">
    <slot></slot>
    
    <!-- Visible shortcuts reference -->
    <button type="button" 
            @click="showShortcuts = true"
            aria-label="Keyboard shortcuts">
      ?
    </button>
    
    <div v-if="showShortcuts" 
         role="dialog"
         aria-modal="true"
         aria-labelledby="shortcuts-title">
      <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
      <dl>
        <dt>Ctrl+S</dt>
        <dd>Save</dd>
        <dt>Ctrl+F</dt>
        <dd>Search</dd>
        <dt>Esc</dt>
        <dd>Close dialog</dd>
      </dl>
      <button @click="showShortcuts = false">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShortcutHandler',
  data() {
    return {
      showShortcuts: false
    }
  },
  methods: {
    handleGlobalShortcuts(event) {
      // Don't intercept shortcuts in form fields
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
        return
      }
      
      // Use modifier keys to avoid conflicts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault()
            this.save()
            break
          case 'f':
            event.preventDefault()
            this.focusSearch()
            break
        }
      }
      
      // Single keys for non-typing actions
      if (!event.ctrlKey && !event.altKey && !event.metaKey) {
        switch (event.key) {
          case 'Escape':
            this.closeModals()
            break
          case '?':
            event.preventDefault()
            this.showShortcuts = true
            break
        }
      }
    },
    save() {
      this.$emit('save')
    },
    focusSearch() {
      // Focus search input
      document.querySelector('[role="search"] input')?.focus()
    },
    closeModals() {
      this.showShortcuts = false
      this.$emit('closeModals')
    }
  }
}
</script>
```

---

## Live Regions

### Status Messages

```vue
<template>
  <div>
    <!-- Main content -->
    <div>
      <button @click="performAction">Do Something</button>
    </div>
    
    <!-- Status announcer (always in DOM) -->
    <div role="status" 
         aria-live="polite" 
         aria-atomic="true"
         class="sr-only">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusAnnouncer',
  data() {
    return {
      statusMessage: ''
    }
  },
  methods: {
    async performAction() {
      this.announce('Loading...')
      
      try {
        await this.$store.dispatch('someAction')
        this.announce('Action completed successfully')
      } catch (error) {
        this.announce('Action failed. Please try again.')
      }
    },
    announce(message) {
      // Clear first to ensure re-announcement of same message
      this.statusMessage = ''
      this.$nextTick(() => {
        this.statusMessage = message
        
        // Auto-clear after 5 seconds
        setTimeout(() => {
          this.statusMessage = ''
        }, 5000)
      })
    }
  }
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

### Alert Messages

```vue
<template>
  <div>
    <!-- Alert announcer (assertive for errors) -->
    <div v-if="errorMessage"
         role="alert"
         aria-live="assertive"
         aria-atomic="true"
         class="alert alert-danger">
      <strong>Error:</strong> {{ errorMessage }}
      <button @click="errorMessage = ''"
              aria-label="Dismiss error">
        ×
      </button>
    </div>
    
    <!-- Your form or content -->
    <form @submit.prevent="handleSubmit">
      <!-- Form fields -->
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AlertComponent',
  data() {
    return {
      errorMessage: ''
    }
  },
  methods: {
    async handleSubmit() {
      try {
        await this.$store.dispatch('submitForm')
      } catch (error) {
        this.errorMessage = error.message || 'Submission failed'
      }
    }
  }
}
</script>
```

### Search Results Counter

```vue
<template>
  <div>
    <label for="search">Search</label>
    <input id="search"
           v-model="query"
           @input="search"
           type="search"
           aria-describedby="results-count">
    
    <!-- Results count (announced automatically) -->
    <div id="results-count"
         role="status"
         aria-live="polite"
         aria-atomic="true"
         class="sr-only">
      {{ resultsAnnouncement }}
    </div>
    
    <!-- Visible results count -->
    <p aria-hidden="true">
      {{ resultsCount }} results
    </p>
    
    <!-- Results -->
    <ul>
      <li v-for="result in results" :key="result.id">
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'SearchComponent',
  data() {
    return {
      query: '',
      results: [],
      resultsCount: 0
    }
  },
  computed: {
    resultsAnnouncement() {
      if (this.query === '') return ''
      if (this.resultsCount === 0) return 'No results found'
      if (this.resultsCount === 1) return '1 result found'
      return `${this.resultsCount} results found`
    }
  },
  methods: {
    async search() {
      if (this.query === '') {
        this.results = []
        this.resultsCount = 0
        return
      }
      
      this.results = await this.$store.dispatch('search', this.query)
      this.resultsCount = this.results.length
    }
  }
}
</script>
```

---

## Forms

### Accessible Form Field

```vue
<template>
  <div class="form-group">
    <label :for="inputId">
      {{ label }}
      <span v-if="required" aria-label="required">*</span>
    </label>
    
    <input :id="inputId"
           :type="type"
           :value="modelValue"
           @input="$emit('update:modelValue', $event.target.value)"
           :required="required"
           :aria-invalid="hasError ? 'true' : 'false'"
           :aria-describedby="describedbyIds"
           :placeholder="placeholder">
    
    <small v-if="hint" :id="`${inputId}-hint`" class="form-text">
      {{ hint }}
    </small>
    
    <div v-if="hasError" 
         :id="`${inputId}-error`"
         class="error-message"
         role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormField',
  props: {
    inputId: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    hint: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  computed: {
    hasError() {
      return this.error !== ''
    },
    describedbyIds() {
      const ids = []
      if (this.hint) ids.push(`${this.inputId}-hint`)
      if (this.hasError) ids.push(`${this.inputId}-error`)
      return ids.length > 0 ? ids.join(' ') : null
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.error-message {
  color: #dc3545;
  margin-top: 0.25rem;
}
</style>
```

### Accessible Checkbox Group

```vue
<template>
  <fieldset>
    <legend>{{ legend }}</legend>
    
    <div v-for="option in options" 
         :key="option.value"
         class="checkbox-wrapper">
      <input :id="`${name}-${option.value}`"
             type="checkbox"
             :name="name"
             :value="option.value"
             :checked="modelValue.includes(option.value)"
             @change="handleChange">
      <label :for="`${name}-${option.value}`">
        {{ option.label }}
      </label>
    </div>
    
    <div v-if="error" role="alert" class="error-message">
      {{ error }}
    </div>
  </fieldset>
</template>

<script>
export default {
  name: 'CheckboxGroup',
  props: {
    legend: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
      // Example: [{ value: 'option1', label: 'Option 1' }, ...]
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    handleChange(event) {
      const value = event.target.value
      const checked = event.target.checked
      const newValue = [...this.modelValue]
      
      if (checked) {
        if (!newValue.includes(value)) {
          newValue.push(value)
        }
      } else {
        const index = newValue.indexOf(value)
        if (index > -1) {
          newValue.splice(index, 1)
        }
      }
      
      this.$emit('update:modelValue', newValue)
    }
  }
}
</script>
```

---

## Modal Dialogs

### Accessible Modal

```vue
<template>
  <teleport to="body">
    <div v-if="isOpen"
         class="modal-backdrop"
         @click.self="handleBackdropClick">
      <div ref="modal"
           role="dialog"
           aria-modal="true"
           :aria-labelledby="titleId"
           :aria-describedby="descId"
           class="modal-content"
           @keydown="handleKeyDown">
        
        <h2 :id="titleId">{{ title }}</h2>
        <p v-if="description" :id="descId">{{ description }}</p>
        
        <div class="modal-body">
          <slot></slot>
        </div>
        
        <div class="modal-footer">
          <button ref="closeButton" 
                  @click="close"
                  type="button">
            Close
          </button>
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: 'ModalDialog',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    titleId: {
      type: String,
      default: 'modal-title'
    },
    descId: {
      type: String,
      default: 'modal-desc'
    },
    closeOnBackdrop: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  data() {
    return {
      previousFocus: null,
      focusableElements: []
    }
  },
  watch: {
    isOpen(newValue) {
      if (newValue) {
        this.open()
      } else {
        this.restoreFocus()
      }
    }
  },
  methods: {
    open() {
      // Store previous focus
      this.previousFocus = document.activeElement
      
      // Move focus to modal
      this.$nextTick(() => {
        // Get all focusable elements
        this.focusableElements = Array.from(
          this.$refs.modal.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        )
        
        // Focus first element (close button)
        this.$refs.closeButton?.focus()
        
        // Add event listener for focus trap
        document.addEventListener('focusin', this.trapFocus)
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden'
      })
    },
    close() {
      this.$emit('close')
    },
    restoreFocus() {
      // Remove event listener
      document.removeEventListener('focusin', this.trapFocus)
      
      // Restore body scroll
      document.body.style.overflow = ''
      
      // Restore focus
      if (this.previousFocus && document.body.contains(this.previousFocus)) {
        this.previousFocus.focus()
      }
    },
    trapFocus(event) {
      if (!this.$refs.modal) return
      
      // If focus moves outside modal, bring it back
      if (!this.$refs.modal.contains(event.target)) {
        event.stopPropagation()
        this.focusableElements[0]?.focus()
      }
    },
    handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        this.close()
      }
      
      // Tab key handling for circular tabbing
      if (event.key === 'Tab') {
        if (this.focusableElements.length === 0) return
        
        const firstElement = this.focusableElements[0]
        const lastElement = this.focusableElements[this.focusableElements.length - 1]
        
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    },
    handleBackdropClick() {
      if (this.closeOnBackdrop) {
        this.close()
      }
    }
  },
  beforeUnmount() {
    // Clean up
    document.removeEventListener('focusin', this.trapFocus)
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-footer {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
```

---

## Custom Widgets

### Accessible Tooltip

```vue
<template>
  <span class="tooltip-wrapper">
    <button :id="buttonId"
            type="button"
            :aria-describedby="isVisible ? tooltipId : null"
            @mouseenter="show"
            @mouseleave="hide"
            @focus="show"
            @blur="hide"
            @click="toggle">
      <slot name="trigger"></slot>
    </button>
    
    <div v-if="isVisible"
         :id="tooltipId"
         role="tooltip"
         class="tooltip-content"
         @mouseenter="show"
         @mouseleave="hide">
      <slot></slot>
    </div>
  </span>
</template>

<script>
export default {
  name: 'TooltipComponent',
  props: {
    buttonId: {
      type: String,
      required: true
    },
    tooltipId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isVisible: false,
      hideTimeout: null
    }
  },
  methods: {
    show() {
      clearTimeout(this.hideTimeout)
      this.isVisible = true
    },
    hide() {
      // Delay hiding to allow mouse to move to tooltip
      this.hideTimeout = setTimeout(() => {
        this.isVisible = false
      }, 100)
    },
    toggle() {
      this.isVisible = !this.isVisible
    }
  }
}
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  margin-bottom: 8px;
  z-index: 1000;
}

.tooltip-content::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #333;
}
</style>
```

---

## Skip Links

### Skip to Main Content

```vue
<!-- In App.vue or main layout -->
<template>
  <div id="app">
    <!-- Skip links (first focusable element) -->
    <a href="#main-content" class="skip-link">
      Skip to main content
    </a>
    <a href="#main-nav" class="skip-link">
      Skip to navigation
    </a>
    
    <TheHeader />
    
    <nav id="main-nav">
      <!-- Navigation -->
    </nav>
    
    <main id="main-content" tabindex="-1">
      <router-view />
    </main>
    
    <TheFooter />
  </div>
</template>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 9999;
}

.skip-link:focus {
  top: 0;
}
</style>
```

---

## Math & Special Characters

### Mathematical Notation

```vue
<template>
  <div>
    <!-- Simple equation with aria-label -->
    <p>
      The formula is 
      <span class="equation" aria-label="x squared plus y squared equals z squared">
        x² + y² = z²
      </span>
    </p>
    
    <!-- More complex with MathML -->
    <div>
      <p>Quadratic formula:</p>
      <math xmlns="http://www.w3.org/1998/Math/MathML"
            display="block"
            aria-label="x equals negative b plus or minus the square root of b squared minus 4ac, all divided by 2a">
        <mrow>
          <mi>x</mi>
          <mo>=</mo>
          <mfrac>
            <mrow>
              <mo>−</mo>
              <mi>b</mi>
              <mo>±</mo>
              <msqrt>
                <msup>
                  <mi>b</mi>
                  <mn>2</mn>
                </msup>
                <mo>−</mo>
                <mn>4</mn>
                <mi>a</mi>
                <mi>c</mi>
              </msqrt>
            </mrow>
            <mrow>
              <mn>2</mn>
              <mi>a</mi>
            </mrow>
          </mfrac>
        </mrow>
      </math>
    </div>
    
    <!-- Image of equation with alt text -->
    <figure>
      <img src="einstein-equation.png"
           alt="E equals m c squared, where E is energy, m is mass, and c is the speed of light">
      <figcaption>Einstein's mass-energy equivalence</figcaption>
    </figure>
  </div>
</template>
```

### Special Characters

```vue
<template>
  <div>
    <!-- Currency with context -->
    <p>
      Price: 
      <span aria-label="29 dollars and 99 cents">$29.99</span>
    </p>
    
    <!-- Decorative emoji hidden from screen readers -->
    <h2>
      <span aria-hidden="true">✨</span>
      Features
      <span aria-hidden="true">✨</span>
    </h2>
    
    <!-- Meaningful emoji with label -->
    <p>
      Status: 
      <span role="img" aria-label="success">✓</span>
      Complete
    </p>
    
    <!-- Icon button with label -->
    <button aria-label="Settings">
      <span aria-hidden="true">⚙</span>
    </button>
    
    <!-- Mathematical symbols explained -->
    <p>
      Temperature range: 
      <span aria-label="greater than or equal to">≥</span>
      20°C
    </p>
  </div>
</template>
```

---

## Utility Components

### Screen Reader Only Text

```vue
<template>
  <span class="sr-only">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: 'SrOnly'
}
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

### Focus Visible Indicator (Global)

```css
/* In your main CSS file */

/* Remove default outline */
*:focus {
  outline: none;
}

/* Add custom high-contrast focus indicator (keyboard only) */
*:focus-visible {
  outline: 3px solid #0066CC;
  outline-offset: 2px;
}

/* Exception for some elements */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #0066CC;
  outline-offset: 0;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  *:focus-visible {
    outline-color: #66B3FF;
  }
}
```

---

## Testing Snippets

### Log Focus Changes (Development)

```vue
<script>
export default {
  mounted() {
    if (process.env.NODE_ENV === 'development') {
      document.addEventListener('focusin', (e) => {
        console.log('Focus moved to:', e.target)
      })
    }
  }
}
</script>
```

### Detect Keyboard Trap (Development)

```javascript
// Add to main.js in development
if (process.env.NODE_ENV === 'development') {
  let tabCount = 0
  let lastFocused = null
  
  document.addEventListener('focusin', (e) => {
    if (e.target === lastFocused) {
      tabCount++
      if (tabCount > 50) {
        console.error('Possible keyboard trap detected!', e.target)
        tabCount = 0
      }
    } else {
      tabCount = 0
      lastFocused = e.target
    }
  })
}
```

---

These patterns should cover most accessibility scenarios in Vue.js applications. Adapt as needed for your specific use case.
