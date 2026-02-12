# Accessibility Audit Checklist

Quick reference checklist for performing comprehensive accessibility audits.

## Pre-Audit Setup

- [ ] Identify pages/components to audit
- [ ] Set up testing environment
- [ ] Install browser extensions (axe DevTools, WAVE)
- [ ] Have JAWS/screen reader ready
- [ ] Note framework/technology used

## Phase 1: Automated Scanning

### axe DevTools

- [ ] Run full page scan
- [ ] Review Critical issues
- [ ] Review Serious issues
- [ ] Review Moderate issues
- [ ] Export results

### WAVE

- [ ] Run WAVE scan
- [ ] Review errors (red)
- [ ] Review alerts (yellow)
- [ ] Review structure (blue)
- [ ] Check contrast

### Lighthouse

- [ ] Run Accessibility audit
- [ ] Review score and issues
- [ ] Note any failures

## Phase 2: Structural Review

### Semantic HTML

- [ ] Page has single h1
- [ ] Heading hierarchy is logical (no skips)
- [ ] Headings describe content (not just styling)
- [ ] Semantic elements used (`<nav>`, `<main>`, `<article>`, etc.)
- [ ] Lists used for grouped items
- [ ] Tables used only for tabular data

### Landmarks & Regions

- [ ] Single `<main>` or `role="main"`
- [ ] `<header>` or `role="banner"` present
- [ ] `<footer>` or `role="contentinfo"` present
- [ ] `<nav>` or `role="navigation"` for navigation
- [ ] Multiple landmarks have `aria-label`
- [ ] No nested banners/contentinfo in sectioning elements
- [ ] Test landmark navigation with screen reader (JAWS: R key)

### Document Structure

- [ ] Page has `<title>` that describes content
- [ ] Language declared (`<html lang="en">`)
- [ ] Valid HTML (no parsing errors that affect AT)

## Phase 3: Keyboard Navigation

### Basic Keyboard Access

- [ ] All interactive elements reachable via Tab
- [ ] Tab order follows visual order
- [ ] Shift+Tab works in reverse
- [ ] No keyboard traps
- [ ] Enter activates buttons/links
- [ ] Space activates buttons, checks checkboxes
- [ ] Arrow keys work in custom widgets (if applicable)

### Focus Management

- [ ] Focus indicator visible on all elements
- [ ] Focus indicator meets 3:1 contrast ratio
- [ ] Focus not on hidden elements
- [ ] Focus moves logically after deletions
- [ ] Modals trap focus while open
- [ ] Focus returns to trigger when modal closes
- [ ] Esc closes modals/popups

### Skip Navigation

- [ ] Skip link present at page top
- [ ] Skip link visible on focus
- [ ] Skip link works (moves focus to main)
- [ ] Additional skip links for complex layouts

### Custom Widget Keyboard Patterns

- [ ] Tabs: Arrow keys navigate, Tab exits
- [ ] Dropdown: Arrow keys navigate, Enter selects
- [ ] Menu: Arrow keys navigate, Esc closes
- [ ] Slider: Arrow/Page Up/Down change value
- [ ] Accordion: Space/Enter toggles, arrows navigate

## Phase 4: ARIA Implementation

### ARIA Basics

- [ ] Prefer native HTML over ARIA
- [ ] ARIA roles match element purpose
- [ ] Required ARIA properties present
- [ ] ARIA attributes valid for role
- [ ] No abstract roles used
- [ ] `aria-hidden="true"` not on focusable elements

### ARIA States & Properties

- [ ] `aria-expanded` reflects actual state
- [ ] `aria-selected` reflects actual state
- [ ] `aria-checked` reflects actual state
- [ ] `aria-pressed` reflects actual state (toggle buttons)
- [ ] `aria-current` used for current page/step
- [ ] `aria-disabled` vs `disabled` used appropriately

### ARIA Labels & Descriptions

- [ ] All images have alt text (or role="presentation")
- [ ] Icon buttons have `aria-label`
- [ ] Form fields have labels (not just placeholder)
- [ ] Complex widgets have `aria-labelledby` or `aria-label`
- [ ] `aria-describedby` used for additional context
- [ ] Decorative images have `alt=""` or `aria-hidden="true"`

### ARIA Live Regions

- [ ] Live regions present for dynamic updates
- [ ] `role="status"` for status messages
- [ ] `role="alert"` for urgent messages
- [ ] `aria-live="polite"` for non-urgent updates
- [ ] `aria-live="assertive"` for urgent updates
- [ ] `aria-atomic` set appropriately
- [ ] Live regions not overused (announcement fatigue)

### Complex ARIA Patterns

- [ ] Tabs: Proper tab/tabpanel structure
- [ ] Accordion: Proper button/panel structure
- [ ] Modal: `aria-modal`, `aria-labelledby`, focus trap
- [ ] Combobox: Proper ARIA 1.2 pattern
- [ ] Listbox: Proper selection management
- [ ] Tree: Proper expand/collapse states

## Phase 5: Screen Reader Testing (JAWS)

### General Navigation

- [ ] JAWS announces page title on load
- [ ] Down arrow reads content logically
- [ ] Heading navigation (H) works
- [ ] Landmark navigation (R) works
- [ ] Link navigation (K) works
- [ ] Button navigation (B) works
- [ ] Form field navigation (F) works

### Element Announcements

- [ ] Buttons announce role and label
- [ ] Links announce role and destination
- [ ] Form fields announce label, role, state, instructions
- [ ] Images announce alt text (or ignored if decorative)
- [ ] Headings announce level and text
- [ ] Lists announce "list with X items"
- [ ] Tables announce caption, headers, row/column position

### Interactive Elements

- [ ] Checkboxes announce checked/unchecked state
- [ ] Radio buttons announce selected state and group
- [ ] Select menus announce current value and position
- [ ] Sliders announce current value and range
- [ ] Toggle buttons announce pressed state
- [ ] Expandable sections announce expanded state

### Dynamic Content

- [ ] Status messages announced automatically
- [ ] Error messages announced automatically
- [ ] Loading states announced
- [ ] Search results count announced
- [ ] Content updates announced appropriately
- [ ] Announcements not overwhelming/redundant

### Context & Clarity

- [ ] Link text meaningful out of context
- [ ] Button text describes action
- [ ] Error messages specific and actionable
- [ ] Form instructions clear
- [ ] Abbreviations expanded on first use
- [ ] Reading order matches visual order

### Element Lists (Insert+F7, F5, F6)

- [ ] Links list is meaningful (not all "click here")
- [ ] Headings list shows logical structure
- [ ] Form fields list shows all fields with labels

## Phase 6: Forms

### Form Structure

- [ ] Every input has associated label
- [ ] Labels use `<label for="id">` or wrap input
- [ ] Fieldsets group related inputs
- [ ] Legend describes group purpose
- [ ] Required fields marked (not just color/asterisk)
- [ ] Error messages associated with fields

### Form Validation

- [ ] Inline validation doesn't move focus
- [ ] Error summary at top of form
- [ ] `aria-invalid` set on error fields
- [ ] `aria-describedby` links to error messages
- [ ] Errors announced by screen reader
- [ ] Can submit form with keyboard

### Form Instructions

- [ ] Format requirements stated upfront
- [ ] Help text associated with field
- [ ] Placeholder not used as label
- [ ] Password visibility toggle available

## Phase 7: Visual Design

### Color & Contrast

- [ ] Text contrast ≥ 4.5:1 (normal text)
- [ ] Text contrast ≥ 3:1 (large text 18pt+/14pt+ bold)
- [ ] UI component contrast ≥ 3:1
- [ ] Focus indicator contrast ≥ 3:1
- [ ] Information not conveyed by color alone
- [ ] Links distinguishable without color

### Zoom & Reflow

- [ ] Zoom to 200% with no horizontal scroll
- [ ] Content reflows (no text truncated)
- [ ] Functionality remains available
- [ ] No content overlaps
- [ ] Mobile responsive (320px width)

### Visual Focus

- [ ] Focus indicator visible on all elements
- [ ] Focus indicator not hidden by content
- [ ] Focus indicator sufficient size/thickness
- [ ] Custom focus styles meet contrast requirements

## Phase 8: Content

### Images

- [ ] Informative images have descriptive alt
- [ ] Decorative images have `alt=""` or `aria-hidden`
- [ ] Complex images have long descriptions
- [ ] Image maps have alt text on areas
- [ ] SVGs have `<title>` or `aria-label`

### Multimedia

- [ ] Videos have captions
- [ ] Audio content has transcripts
- [ ] Auto-play can be paused
- [ ] Media controls keyboard accessible
- [ ] No flashing content >3/second

### Links

- [ ] Link purpose clear from link text
- [ ] Link text not "click here" or "read more"
- [ ] Links visually distinguishable
- [ ] External links indicated (optional WCAG AA)

### Language

- [ ] Page language declared
- [ ] Language changes marked (`lang` attribute)
- [ ] Content written at appropriate reading level
- [ ] Abbreviations/acronyms expanded

## Phase 9: Math & Special Characters

### Mathematical Content

- [ ] Equations have text alternatives
- [ ] MathML used where supported
- [ ] Images of equations have descriptive alt
- [ ] Mathematical notation explained
- [ ] Symbols like ±, ≠, ≥ have context

### Special Characters

- [ ] Currency symbols have context ($29.99 announced correctly)
- [ ] Emoji have text alternatives if meaningful
- [ ] Decorative Unicode marked `aria-hidden`
- [ ] Fractions explained (½ → "one half")
- [ ] Arrows/icons have text alternatives

## Phase 10: Mobile/Touch

### Touch Targets

- [ ] Touch targets ≥ 44×44px
- [ ] Sufficient spacing between targets
- [ ] No overlapping interactive areas

### Mobile Navigation

- [ ] Navigation usable without pinch/zoom
- [ ] Gestures have alternative methods
- [ ] Orientation not locked (unless essential)

## Phase 11: Complex Interactions

### Modals & Popups

- [ ] Modal traps focus
- [ ] Modal returns focus on close
- [ ] Esc closes modal
- [ ] Modal has proper role (`dialog`, `alertdialog`)
- [ ] Modal labeled with title
- [ ] Background inert (`aria-modal="true"` or `inert`)

### Infinite Scroll

- [ ] Keyboard users can access all content
- [ ] "Load more" button provided
- [ ] Loading state announced

### Drag & Drop

- [ ] Keyboard alternative provided
- [ ] Drop zones announced
- [ ] Current state announced

### Time Limits

- [ ] Time limits can be extended/disabled
- [ ] Timeouts announced with warning
- [ ] Sessions don't expire during input

## Phase 12: Documentation

### Issue Tracking

- [ ] All issues documented with location
- [ ] Issues categorized by severity
- [ ] WCAG criteria noted for each issue
- [ ] Screenshots/code samples included
- [ ] Impact on users described

### Remediation Guidance

- [ ] Specific code fixes provided
- [ ] Alternative solutions offered
- [ ] Testing steps documented
- [ ] Priority/effort estimated

### Report Generation

- [ ] Executive summary with counts
- [ ] Detailed findings with examples
- [ ] Positive findings noted
- [ ] Recommendations provided
- [ ] Next steps outlined

## Post-Audit

- [ ] Prioritize fixes by severity
- [ ] Create tickets/issues for tracking
- [ ] Share report with team
- [ ] Schedule remediation timeline
- [ ] Plan regression testing
- [ ] Document learnings for future

## Notes

- Not all items apply to every project
- Manual testing catches issues automation misses
- Testing with real assistive technology is essential
- Engage users with disabilities when possible
- Accessibility is ongoing, not one-time
