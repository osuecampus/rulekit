# Accessibility Audit Skill

Comprehensive WCAG 2.1 AA accessibility audit skill for AI assistants. This skill helps identify and fix accessibility issues with special focus on ARIA, keyboard navigation, screen readers (JAWS), focus management, math content, and semantic structure.

## Quick Start

### For AI Assistants

When a user requests an accessibility audit, read [SKILL.md](SKILL.md) for complete instructions.

**Quick invocation patterns:**

- "Run an accessibility audit on [component/page]"
- "Check accessibility compliance"
- "Audit ARIA implementation"
- "Test keyboard navigation"
- "Review screen reader announcements"

### For Humans

This skill enables AI assistants to:

1. Systematically audit your application for WCAG 2.1 AA compliance
2. Identify issues with severity ratings
3. Provide specific code fixes with examples
4. Test with simulated JAWS screen reader usage
5. Generate comprehensive audit reports

## Skill Files

### Core Documentation

- **[SKILL.md](SKILL.md)** - Complete skill instructions for AI agents
  - 9-phase audit process
  - WCAG 2.1 AA criteria
  - ARIA validation rules
  - Keyboard testing procedures
  - Screen reader simulation
  - Report generation

### Reference Guides

- **[audit-checklist.md](audit-checklist.md)** - Comprehensive checklist
  - 400+ checkpoint items
  - Organized by audit phase
  - Quick pass/fail validation
  - Manual and automated testing

- **[wcag-criteria.md](wcag-criteria.md)** - WCAG 2.1 AA reference
  - All Level A and AA criteria
  - Success criteria definitions
  - Common failures
  - Testing approaches

- **[jaws-testing.md](jaws-testing.md)** - JAWS testing guide
  - Essential JAWS commands
  - Element navigation shortcuts
  - Testing procedures
  - Announcement verification

- **[common-patterns.md](common-patterns.md)** - Code examples
  - Vue.js accessibility patterns
  - ARIA implementations
  - Focus management
  - Live regions
  - Modal dialogs
  - Keyboard navigation

## Priority Focus Areas

This skill pays special attention to:

✓ **ARIA Tags** - Correct usage, roles, states, properties
✓ **Math & Special Characters** - MathML, Unicode, formulas
✓ **Keyboard Functionality** - Tab order, shortcuts, dynamic content
✓ **Split Focus** - Modals, iframes, complex flows
✓ **Screen Reader Announcements** - JAWS-specific testing
✓ **Navigation Gates** - Skip links, landmarks, focus efficiency
✓ **Headers & Regions** - Semantic structure, hierarchy

## Usage Examples

### Example 1: Full Page Audit

```
User: "Run an accessibility audit on the entire application"

AI will:
1. Scan all pages/routes
2. Check semantic HTML structure
3. Validate ARIA implementation
4. Test keyboard navigation
5. Simulate JAWS announcements
6. Review focus management
7. Check math/special characters
8. Generate comprehensive report with:
   - Executive summary
   - Detailed findings by severity
   - Specific code fixes
   - Testing recommendations
```

### Example 2: Component-Specific Audit

```
User: "Check accessibility of the CalendarComponent"

AI will:
1. Read CalendarComponent.vue
2. Identify interactive elements
3. Check ARIA attributes
4. Verify keyboard navigation
5. Test focus management
6. Validate screen reader announcements
7. Provide specific fixes for any issues found
```

### Example 3: Screen Reader Testing

```
User: "How will JAWS announce this modal dialog?"

AI will:
1. Analyze modal structure
2. Check role="dialog", aria-modal, aria-labelledby
3. Simulate JAWS announcement:
   "Dialog, Settings, [first element]"
4. Verify focus trap
5. Test Esc key functionality
6. Confirm focus restoration
7. Suggest improvements if needed
```

### Example 4: Keyboard Navigation Review

```
User: "Test keyboard accessibility of the WorkoutBuilder"

AI will:
1. Identify all interactive elements
2. Map tab order
3. Check for keyboard traps
4. Verify focus visibility
5. Test arrow key navigation
6. Check Enter/Space activation
7. Document any issues with fixes
```

## Severity Levels

Issues are classified as:

- **Critical** - Blocks task completion (keyboard traps, no keyboard access)
- **High** - Major barriers (missing labels, poor contrast, broken ARIA)
- **Medium** - Usability impacts (confusing structure, verbose announcements)
- **Low** - Polish items (could be clearer, minor improvements)

## WCAG 2.1 AA Compliance

This skill covers all WCAG 2.1 Level A and AA success criteria:

### Level AA Specific Criteria

- 1.2.4 Captions (Live)
- 1.2.5 Audio Description
- 1.3.4 Orientation
- 1.3.5 Identify Input Purpose
- 1.4.3 Contrast (Minimum) ⭐
- 1.4.4 Resize Text
- 1.4.5 Images of Text
- 1.4.10 Reflow
- 1.4.11 Non-text Contrast ⭐
- 1.4.12 Text Spacing
- 1.4.13 Content on Hover/Focus
- 2.4.5 Multiple Ways
- 2.4.6 Headings and Labels
- 2.4.7 Focus Visible ⭐
- 3.1.2 Language of Parts
- 3.2.3 Consistent Navigation
- 3.2.4 Consistent Identification
- 3.3.3 Error Suggestion
- 3.3.4 Error Prevention
- 4.1.3 Status Messages ⭐

⭐ = Most commonly failed

## Testing Approach

### Automated Testing (30-40% of issues)

- axe DevTools
- WAVE
- Lighthouse
- Pa11y/axe-core CLI

### Manual Testing (Critical - 60-70% of issues)

- Keyboard navigation
- Screen reader (JAWS simulation)
- Focus management
- ARIA state verification
- Dynamic content updates

### Best Practice

Combine automated and manual testing for comprehensive coverage.

## Report Output

Audit reports include:

1. **Executive Summary**
   - Total issues by severity
   - Compliance status
   - Priority fixes

2. **Detailed Findings**
   - Issue description
   - WCAG criterion violated
   - Impact on users
   - Current code
   - Recommended fix
   - Testing steps

3. **Positive Findings**
   - What's working well
   - Good practices to maintain

4. **Recommendations**
   - Architecture improvements
   - Process suggestions
   - Training needs

## Code Fix Examples

The skill provides specific, actionable code fixes:

```vue
<!-- ❌ Before: No label, poor ARIA -->
<div @click="close">
  <i class="icon-x"></i>
</div>

<!-- ✅ After: Proper button, label, ARIA -->
<button type="button" 
        @click="close"
        aria-label="Close dialog">
  <i class="icon-x" aria-hidden="true"></i>
</button>
```

All fixes include:

- Explanation of the issue
- Why it's problematic
- Complete corrected code
- How to test the fix

## Framework Support

Primary: **Vue.js** (Options API)

- Mapsto project's Vue.js patterns
- Vuex state management awareness
- Vue Router integration
- Bootstrap 5 styling consideration

Adaptable to: React, Angular, Vanilla JS

## Integration with Project

This skill integrates with your project's:

- **Bootstrap 5** - Uses utility classes appropriately
- **Vue.js patterns** - Follows camelCase events/props
- **Component structure** - Understands project organization
- **Vuex store** - Aware of state management patterns

## Resources

### WCAG Guidelines

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG 2.1](https://www.w3.org/WAI/WCAG21/Understanding/)

### ARIA

- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA Specification](https://www.w3.org/TR/wai-aria-1.2/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/)

### Learning Resources

- [WebAIM](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
- [A11y Project](https://www.a11yproject.com/)

## Maintaining the Skill

### When to Update

Update this skill when:

- WCAG guidelines change (e.g., WCAG 2.2, 3.0)
- New ARIA patterns emerge
- Screen reader behavior changes
- Framework patterns evolve
- Project-specific patterns added

### Version History

- **1.0.0** (2025-02-11)
  - Initial release
  - WCAG 2.1 AA compliance
  - JAWS testing focus
  - Vue.js patterns
  - Special focus on ARIA, keyboard, math, focus management

## Contributing

To enhance this skill:

1. Identify gaps in coverage
2. Add new patterns to `common-patterns.md`
3. Update checklist in `audit-checklist.md`
4. Document new ARIA patterns in `SKILL.md`
5. Add JAWS commands to `jaws-testing.md`

## Support

For issues with the skill itself:

1. Check if WCAG guidelines have changed
2. Verify ARIA specifications are current
3. Test with latest screen reader versions
4. Review framework best practices

## License

Part of the harper-dev project. Follows project's licensing.

---

**Note:** This skill is a tool to assist with accessibility auditing. It should complement, not replace, testing with real users who have disabilities and manual testing with actual assistive technologies.
