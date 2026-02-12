# JAWS Testing Guide

Comprehensive guide for testing with JAWS (Job Access With Speech) screen reader.

## Setup

### Installing JAWS

- Download from [Freedom Scientific](https://www.freedomscientific.com/products/software/jaws/)
- 40-minute demo mode available (restarts after each reboot)
- License required for continuous use

### Browser Compatibility

- **Primary:** Firefox (best JAWS support historically)
- **Secondary:** Chrome (increasingly good support)
- **Avoid:** Safari on Windows (poor support)

### Initial Configuration

1. Start JAWS (Desktop → JAWS icon)
2. Wait for "JAWS ready" announcement
3. Open browser
4. Navigate to test page

## Essential JAWS Commands

### Basic Navigation

| Command | Action |
|---------|--------|
| **Down Arrow** | Read next line/item |
| **Up Arrow** | Read previous line/item |
| **Ctrl** | Stop reading |
| **Insert+Down Arrow** | Say all (continuous reading) |
| **Insert+Up Arrow** | Read current line |
| **Insert+5 (numpad)** | Read current word |
| **Tab** | Next focusable element |
| **Shift+Tab** | Previous focusable element |

### Navigation by Element Type

| Command | Action |
|---------|--------|
| **H** | Next heading |
| **Shift+H** | Previous heading |
| **1-6** | Next heading level 1-6 |
| **Shift+1-6** | Previous heading level 1-6 |
| **K** | Next link |
| **Shift+K** | Previous link |
| **B** | Next button |
| **Shift+B** | Previous button |
| **F** | Next form field |
| **Shift+F** | Previous form field |
| **E** | Next edit field (input) |
| **Shift+E** | Previous edit field |
| **X** | Next checkbox |
| **Shift+X** | Previous checkbox |
| **C** | Next combo box (select) |
| **Shift+C** | Previous combo box |
| **R** | Next region/landmark |
| **Shift+R** | Previous region/landmark |
| **T** | Next table |
| **Shift+T** | Previous table |
| **L** | Next list |
| **Shift+L** | Previous list |
| **I** | Next list item |
| **Shift+I** | Previous list item |
| **G** | Next graphic/image |
| **Shift+G** | Previous graphic/image |
| **M** | Next frame/iframe |
| **Shift+M** | Previous frame/iframe |
| **D** | Next landmark |
| **Shift+D** | Previous landmark |
| **;** (semicolon) | Next button, checkbox, radio button |
| **Shift+;** | Previous button, checkbox, radio button |

### Element Lists

| Command | Action |
|---------|--------|
| **Insert+F3** | Element list (choose type) |
| **Insert+F5** | Form fields list |
| **Insert+F6** | Headings list |
| **Insert+F7** | Links list |
| **Insert+Ctrl+;** | Buttons list |

### Table Navigation

| Command | Action |
|---------|--------|
| **Ctrl+Alt+Arrow Keys** | Navigate table cells |
| **Ctrl+Alt+Home** | First cell in table |
| **Ctrl+Alt+End** | Last cell in table |
| **Ctrl+Alt+5 (numpad)** | Read current cell |
| **Insert+Alt+5 (numpad)** | Read column header |
| **Insert+Shift+5 (numpad)** | Read row header |

### Forms Mode

JAWS automatically enters Forms Mode when focus enters a form field.

| Command | Action |
|---------|--------|
| **Enter or Space** | Toggle Forms Mode (when on form field) |
| **+ (numpad)** | Forms Mode On |
| **- (numpad)** | Forms Mode Off |

**Forms Mode Behavior:**

- Arrow keys change values (select, radio)
- Arrow keys move cursor in text fields
- Single key navigation (H, K, etc.) disabled
- Tab/Shift+Tab still work

### Reading Content

| Command | Action |
|---------|--------|
| **Insert+Down Arrow** | Say All from current position |
| **Insert+Home** | Read from top of page |
| **Insert+Page Up** | Read to top of page |
| **Insert+Page Down** | Read to bottom of page |
| **Alt+Shift+Page Down** | Read status line |

### JAWS Settings

| Command | Action |
|---------|--------|
| **Insert+V** | Quick Settings |
| **Insert+J** | JAWS window (settings) |
| **Insert+F2** | Pass next key to application |
| **Insert+Space, S** | Toggle speech on/off |
| **Insert+Esc** | Refresh screen |

## Testing Checklist

### Page Load

- [ ] Page title announced
- [ ] Number of headings/links/landmarks announced (if enabled)
- [ ] Main landmark announced (if present)

### Document Structure

**Test heading navigation (H):**

```
Expected: "Heading level 1, Page Title"
Expected: "Heading level 2, Section Title"
Expected: "Heading level 2, Another Section"
```

- [ ] All headings announced with correct level
- [ ] Can navigate to all headings
- [ ] No heading hierarchy skips

**Test landmark navigation (R):**

```
Expected: "Main region"
Expected: "Navigation region, Primary"
Expected: "Contentinfo region"
```

- [ ] All major regions navigable
- [ ] Landmarks have descriptive names
- [ ] Can skip navigation with R key

### Links

**Navigate by K key:**

```
Expected: "Link, About Us"
Expected: "Link, visited, Contact"
```

- [ ] All links announced as links
- [ ] Link text describes destination
- [ ] Visited links announced as visited

**Insert+F7 (Links List):**

- [ ] All links present in list
- [ ] Links meaningful out of context
- [ ] No "click here" or ambiguous text

### Buttons

**Navigate by B key:**

```
Expected: "Submit, button"
Expected: "Close dialog, button"
Expected: "Toggle menu, button, collapsed"
```

- [ ] All buttons announced with label
- [ ] Button purpose clear
- [ ] State announced (expanded/collapsed/pressed)

### Form Fields

**Navigate by F key:**

```
Expected: "Email Address, edit, required, We'll never share your email"
Expected: "Password, edit password, required"
Expected: "Remember me, checkbox, not checked"
```

- [ ] Every field has label
- [ ] Required fields announced
- [ ] Instructions/hints announced
- [ ] Field type announced (edit, combo box, checkbox)

**Test form field with error:**

```
Expected: "Email Address, edit, invalid entry, Please enter a valid email address"
```

- [ ] Error associated with field
- [ ] Error announced when field focused
- [ ] Error message specific and actionable

### Interactive Widgets

**Test accordion/expandable:**

```
Initial: "Section 1, button, collapsed"
After click: "Section 1, button, expanded"
Move down: "Panel content text..."
```

- [ ] State announced correctly
- [ ] Content reachable after expanding
- [ ] Can navigate to next section

**Test tabs:**

```
Expected: "Tab 1, tab, selected, 1 of 3"
Move right: "Tab 2, tab, not selected, 2 of 3"
Enter: "Tab control, Tab 2 is selected"
Move down: "Panel 2 content..."
```

- [ ] Tab role announced
- [ ] Selected state announced
- [ ] Position in set announced (1 of 3)
- [ ] Panel content reachable

**Test modal dialog:**

```
On open: "Dialog, Settings, [first element]"
```

- [ ] Dialog role announced
- [ ] Dialog title announced
- [ ] Focus moved into dialog
- [ ] Cannot Tab outside dialog
- [ ] Esc closes dialog (announced)
- [ ] Focus returns to trigger

### Dynamic Content

**Test status message:**

```
Action: Filter list
Expected: "15 results found" (announced automatically)
```

- [ ] Status updates announced without focus change
- [ ] Announcement not disruptive
- [ ] Announcement clear and concise

**Test error alert:**

```
Action: Submit invalid form
Expected: "Alert, Error, Please fix 3 errors in the form"
```

- [ ] Alert role announced
- [ ] Error announced immediately
- [ ] Error description clear

**Test loading state:**

```
Action: Submit form
Expected: "Status, Loading..."
After load: "Status, Data loaded successfully"
```

- [ ] Loading state announced
- [ ] Completion announced
- [ ] Focus remains stable or moves appropriately

### Images

**Navigate by G key:**

```
Expected: "Graphic, Company logo"
Expected: "Graphic, Chart showing sales increase"
```

- [ ] Informative images have alt text
- [ ] Alt text descriptive
- [ ] Decorative images skipped (not announced)

### Tables

**Navigate to table (T):**

```
Expected: "Table with 3 columns and 5 rows, Monthly Sales Data"
```

**Navigate cells (Ctrl+Alt+Arrow):**

```
Expected: "Month, January, row 2 column 1"
Expected: "Revenue, $10,000, row 2 column 2"
```

- [ ] Table caption announced
- [ ] Row and column count announced
- [ ] Column headers announced in cells
- [ ] Row headers announced in cells
- [ ] Can navigate all cells

### Math Content

```
Expected: "x squared plus y squared equals z squared"
(Not: "x superscript 2 plus y superscript 2 equals z superscript 2")
```

- [ ] Equations have clear spoken form
- [ ] Math notation explained
- [ ] Formulas in images have alt text

## Common Issues to Listen For

### Poor Announcements

❌ **Bad:**

```
"Button" (unlabeled)
"Click here, link" (meaningless)
"Edit" (no label)
"Graphic" (no alt text)
"Button, button, button" (same labels)
```

✅ **Good:**

```
"Close dialog, button"
"Learn more about accessibility, link"
"Email address, edit"
"Company logo, graphic"
"Save, button" "Cancel, button" "Delete, button"
```

### Missing Context

❌ **Bad:**

```
"29.99" (no context)
"Learn more, link" (which topic?)
"Click here, link" (go where?)
```

✅ **Good:**

```
"Price: 29 dollars and 99 cents"
"Learn more about WCAG guidelines, link"
"Read our accessibility statement, link"
```

### Incorrect States

❌ **Bad:**

```
(Accordion expanded, but JAWS says "collapsed")
(Checkbox checked, but JAWS says "not checked")
(Tab selected, but not announced)
```

✅ **Good:**

```
"Section 1, button, expanded"
"Accept terms, checkbox, checked"
"Profile, tab, selected, 2 of 4"
```

### Chaotic Navigation

❌ **Bad:**

- Focus jumps unexpectedly
- Tab order illogical
- Cannot exit modal
- Arrow keys don't work in widget
- Must navigate entire header to reach content

✅ **Good:**

- Focus order matches visual order
- Skip link present
- Modal traps focus
- Arrow keys work in tabs/menus
- Can bypass repeated content

## Testing Scenarios

### Scenario 1: Form Submission

1. Navigate to form (F key)
2. Fill out each field
3. Verify labels, required states, hints
4. Submit with error
5. Verify error announcement
6. Verify error on specific field
7. Fix and resubmit
8. Verify success message

### Scenario 2: Search Functionality

1. Navigate to search field (E key)
2. Type query
3. Submit search
4. Verify results count announced
5. Navigate results (arrow keys)
6. Filter results
7. Verify new count announced
8. Clear search
9. Verify cleared state

### Scenario 3: Modal Dialog

1. Navigate to trigger button (B key)
2. Activate (Enter)
3. Verify dialog announced
4. Verify focus in dialog
5. Navigate dialog content (Tab)
6. Try to Tab out (should not leave)
7. Close with Esc
8. Verify focus returned to trigger

### Scenario 4: Data Table

1. Navigate to table (T key)
2. Verify table announced with size
3. Navigate cells (Ctrl+Alt+Arrows)
4. Verify headers announced
5. Navigate to last row
6. Navigate to last column
7. Return to first cell
8. Verify all data accessible

## Recording Findings

For each test, document:

**Element Location:**

- Page/component
- Approximate location
- How to reach it

**Issue:**

- What JAWS announced
- What it should announce
- WCAG criterion violated

**Reproduction:**

```
1. Press H until...
2. Listen for...
3. Actual: "[actual announcement]"
4. Expected: "[expected announcement]"
```

**Severity:**

- Critical: Cannot complete task
- High: Major confusion/difficulty
- Medium: Minor confusion
- Low: Could be clearer

## Tips

### When JAWS Seems Wrong

1. **Verify element has focus:** Insert+Tab (announces current element)
2. **Refresh:** Insert+Esc (refresh screen reading)
3. **Check forms mode:** + (numpad) to enter, - to exit
4. **Review HTML:** Use developer tools to check markup
5. **Test in different browser:** Firefox vs Chrome behavior varies

### Efficient Testing

1. Use element lists (Insert+F7) for overview
2. Test keyboard access first (Tab through)
3. Then test JAWS announcement
4. Focus on new/custom components
5. Test common user paths, not every element

### Common JAWS Behaviors

- **Blank** = no text/label
- **Clickable** = link or button (generic)
- **Link same page** = hash link
- **Visited link** = previously visited
- **Group** = fieldset
- **Graphic** = image
- **Unlabeled graphic** = image with empty alt
- **Edit** = text input
- **Combo box** = select dropdown
- **Auto complete** = input with autocomplete

## Resources

- [JAWS Keystrokes](https://www.freedomscientific.com/training/jaws/hotkeys/)
- [WebAIM: Using JAWS to Evaluate Web Accessibility](https://webaim.org/articles/jaws/)
- [Deque: JAWS Screen Reader Testing](https://www.deque.com/blog/jaws-screen-reader-testing/)

## Quick Reference Card

**Print this for testing sessions:**

```
=== JAWS Quick Reference ===

Navigation:
  H/Shift+H = Headings
  K/Shift+K = Links
  B/Shift+B = Buttons
  R/Shift+R = Regions
  F/Shift+F = Forms
  T/Shift+T = Tables

Elements Lists:
  Insert+F5 = Forms
  Insert+F6 = Headings
  Insert+F7 = Links

Reading:
  Down Arrow = Next
  Up Arrow = Previous
  Insert+Down = Say All
  Ctrl = Stop

Forms Mode:
  + (numpad) = On
  - (numpad) = Off

Current Info:
  Insert+Tab = Current element
  Insert+Up = Current line
  Insert+F12 = Time/Date
```
