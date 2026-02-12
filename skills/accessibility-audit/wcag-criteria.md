# WCAG 2.1 Level AA Criteria Reference

Quick reference guide for WCAG 2.1 Level AA success criteria organized by principle.

## 1. Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

### 1.1 Text Alternatives

**1.1.1 Non-text Content (A)**

- All images, icons, and non-text content have text alternatives
- Decorative images use `alt=""` or `aria-hidden="true"`
- Complex images have long descriptions

### 1.2 Time-based Media

**1.2.1 Audio-only and Video-only (A)**

- Pre-recorded audio-only: Provide transcript
- Pre-recorded video-only: Provide transcript or audio track

**1.2.2 Captions (A)**

- Pre-recorded video with audio: Provide captions

**1.2.3 Audio Description or Media Alternative (A)**

- Pre-recorded video: Provide audio description or transcript

**1.2.4 Captions (Live) (AA)** ⭐

- Live video with audio: Provide captions

**1.2.5 Audio Description (AA)** ⭐

- Pre-recorded video: Provide audio description

### 1.3 Adaptable

**1.3.1 Info and Relationships (A)**

- Structure conveyed through markup (headings, lists, tables)
- Form labels programmatically associated
- ARIA used correctly where needed

**1.3.2 Meaningful Sequence (A)**

- Reading order follows visual order
- DOM order matches visual presentation
- CSS doesn't reorder content illogically

**1.3.3 Sensory Characteristics (A)**

- Instructions don't rely solely on shape, size, location, or sound
- "Click the button on the right" → provide additional cues

**1.3.4 Orientation (AA)** ⭐

- Content works in both portrait and landscape
- Orientation not locked (unless essential)

**1.3.5 Identify Input Purpose (AA)** ⭐

- Form inputs have autocomplete attributes for personal data
- `autocomplete="name"`, `autocomplete="email"`, etc.

### 1.4 Distinguishable

**1.4.1 Use of Color (A)**

- Color not sole means of conveying information
- Links distinguishable by more than color
- Charts/graphs use patterns or labels

**1.4.2 Audio Control (A)**

- Audio that plays automatically >3 seconds has pause/stop/volume control

**1.4.3 Contrast (Minimum) (AA)** ⭐

- Text contrast ≥ 4.5:1 (normal text)
- Text contrast ≥ 3:1 (large text: 18pt+ or 14pt+ bold)
- Exceptions: logos, inactive UI, incidental text

**1.4.4 Resize Text (AA)** ⭐

- Text can be resized up to 200% without loss of content or functionality
- No horizontal scrolling at 200% zoom

**1.4.5 Images of Text (AA)** ⭐

- Use actual text instead of images of text
- Exceptions: logos, essential presentation (e.g., book covers)

**1.4.10 Reflow (AA)** ⭐

- Content reflows without horizontal scroll at:
  - 320px width (mobile)
  - 256px height (for horizontal scrolling content)
- Exceptions: data tables, maps, diagrams, toolbars

**1.4.11 Non-text Contrast (AA)** ⭐

- UI components and graphical objects: ≥ 3:1 contrast
- Focus indicators: ≥ 3:1 contrast
- Adjacent colors in graphics: ≥ 3:1 contrast

**1.4.12 Text Spacing (AA)** ⭐

- Content works when users adjust:
  - Line height ≥ 1.5× font size
  - Paragraph spacing ≥ 2× font size
  - Letter spacing ≥ 0.12× font size
  - Word spacing ≥ 0.16× font size

**1.4.13 Content on Hover or Focus (AA)** ⭐

- Tooltips/popovers are:
  - Dismissible (Esc closes without moving focus)
  - Hoverable (can move mouse to tooltip)
  - Persistent (don't disappear until dismissed or no longer valid)

## 2. Operable

User interface components and navigation must be operable.

### 2.1 Keyboard Accessible

**2.1.1 Keyboard (A)**

- All functionality available via keyboard
- No keyboard traps (can Tab in and out)
- Custom widgets work with keyboard

**2.1.2 No Keyboard Trap (A)**

- Focus can always move away from any component
- Standard Tab/Shift+Tab or documented method

**2.1.4 Character Key Shortcuts (A)**

- Single-key shortcuts can be:
  - Turned off
  - Remapped
  - Only active when component focused

### 2.2 Enough Time

**2.2.1 Timing Adjustable (A)**

- Time limits can be:
  - Turned off
  - Adjusted (extended)
  - Or ≥20 hours long

**2.2.2 Pause, Stop, Hide (A)**

- Auto-updating content can be paused/stopped
- Moving/blinking content can be paused/stopped (if starts automatically, lasts >5 sec, other content present)

### 2.3 Seizures and Physical Reactions

**2.3.1 Three Flashes or Below Threshold (A)**

- No content flashes more than 3 times per second
- Or flashes below general and red flash thresholds

### 2.4 Navigable

**2.4.1 Bypass Blocks (A)**

- Skip link(s) to bypass repeated content
- Proper landmark structure

**2.4.2 Page Titled (A)**

- Each page has descriptive `<title>`
- Title describes page purpose/topic

**2.4.3 Focus Order (A)**

- Focus order is logical and intuitive
- Tab order follows visual order
- Focus doesn't jump randomly

**2.4.4 Link Purpose (In Context) (A)**

- Link purpose clear from link text + context
- Avoid "click here", "read more" alone

**2.4.5 Multiple Ways (AA)** ⭐

- Multiple ways to find pages (except result of a process):
  - Search
  - Site map
  - Navigation menu
  - Table of contents

**2.4.6 Headings and Labels (AA)** ⭐

- Headings describe topic/purpose
- Labels describe purpose
- Headings and labels clear and descriptive

**2.4.7 Focus Visible (AA)** ⭐

- Keyboard focus indicator visible
- Default outline not removed without replacement
- Custom focus meets 3:1 contrast

### 2.5 Input Modalities

**2.5.1 Pointer Gestures (A)**

- Complex gestures have alternative (e.g., pinch zoom has +/- buttons)
- Multi-point gestures can be done with single pointer

**2.5.2 Pointer Cancellation (A)**

- Touch/click actions:
  - Complete on up-event (not down-event), or
  - Can be aborted/undone, or
  - Down and up on same target confirms action

**2.5.3 Label in Name (A)**

- Visual label text included in accessible name
- Screen reader users can activate by voice ("click Save")

**2.5.4 Motion Actuation (A)**

- Motion-triggered functions have UI alternative
- Motion actuation can be disabled

## 3. Understandable

Information and operation of user interface must be understandable.

### 3.1 Readable

**3.1.1 Language of Page (A)**

- Page language declared: `<html lang="en">`

**3.1.2 Language of Parts (AA)** ⭐

- Language changes marked: `<span lang="es">Hola</span>`
- Proper names, technical terms excepted

### 3.2 Predictable

**3.2.1 On Focus (A)**

- Receiving focus doesn't cause unexpected context change
- No auto-submit when field receives focus

**3.2.2 On Input (A)**

- Changing setting doesn't automatically cause context change
- Unless user warned beforehand

**3.2.3 Consistent Navigation (AA)** ⭐

- Navigation in same order across pages
- Helps users find navigation by location

**3.2.4 Consistent Identification (AA)** ⭐

- Same functionality labeled consistently
- Search icon always labeled "Search," not "Find" on one page and "Search" on another

### 3.3 Input Assistance

**3.3.1 Error Identification (A)**

- Errors identified in text
- Field with error described in text (not just color)

**3.3.2 Labels or Instructions (A)**

- Labels/instructions provided for user input
- Format requirements stated
- Required fields indicated

**3.3.3 Error Suggestion (AA)** ⭐

- Suggestions provided for fixing errors
- Unless would compromise security/purpose

**3.3.4 Error Prevention (Legal, Financial, Data) (AA)** ⭐

- For legal/financial/data submissions, one of:
  - Reversible (can undo)
  - Checked (data validated, errors shown)
  - Confirmed (review step before final submit)

## 4. Robust

Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

### 4.1 Compatible

**4.1.1 Parsing (A)** *(Obsolete in WCAG 2.2, but check for WCAG 2.1)*

- HTML parses correctly (no duplicate IDs, proper nesting)
- Ensures assistive tech can parse

**4.1.2 Name, Role, Value (A)**

- All UI components have name and role
- States/properties programmatically set
- Notification of changes available to user agents

**4.1.3 Status Messages (AA)** ⭐

- Status messages announced without moving focus
- Use `role="status"`, `role="alert"`, or `aria-live`

---

## ⭐ Level AA Criteria Summary

These are the additional criteria beyond Level A that you must meet for AA compliance:

### Level AA Specific

- **1.2.4**: Captions (Live)
- **1.2.5**: Audio Description
- **1.3.4**: Orientation
- **1.3.5**: Identify Input Purpose
- **1.4.3**: Contrast (Minimum)
- **1.4.4**: Resize Text
- **1.4.5**: Images of Text
- **1.4.10**: Reflow
- **1.4.11**: Non-text Contrast
- **1.4.12**: Text Spacing
- **1.4.13**: Content on Hover or Focus
- **2.4.5**: Multiple Ways
- **2.4.6**: Headings and Labels
- **2.4.7**: Focus Visible
- **3.1.2**: Language of Parts
- **3.2.3**: Consistent Navigation
- **3.2.4**: Consistent Identification
- **3.3.3**: Error Suggestion
- **3.3.4**: Error Prevention
- **4.1.3**: Status Messages

## Quick Priority Guide

### Critical (Fail = Major Barrier)

- 2.1.1 Keyboard (no keyboard access)
- 2.1.2 No Keyboard Trap
- 2.4.7 Focus Visible (AA)
- 4.1.2 Name, Role, Value

### High Priority

- 1.3.1 Info and Relationships
- 1.4.3 Contrast (AA)
- 2.4.1 Bypass Blocks
- 2.4.3 Focus Order
- 3.3.1 Error Identification
- 3.3.2 Labels or Instructions

### Medium Priority

- 1.1.1 Non-text Content
- 2.4.2 Page Titled
- 2.4.4 Link Purpose
- 2.4.6 Headings and Labels (AA)
- 3.2.3 Consistent Navigation (AA)
- 4.1.3 Status Messages (AA)

### Lower Priority (Still Required)

- 1.3.4 Orientation (AA)
- 1.4.4 Resize Text (AA)
- 1.4.10 Reflow (AA)
- 3.1.1 Language of Page
- 3.2.1 On Focus

## Testing Tools by Criteria

### Automated (axe, WAVE, Lighthouse)

- 1.1.1 Non-text Content (partial)
- 1.3.1 Info and Relationships
- 1.4.3 Contrast
- 2.4.2 Page Titled
- 4.1.2 Name, Role, Value (partial)

### Manual Required

- 2.1.1 Keyboard
- 2.1.2 No Keyboard Trap
- 2.4.3 Focus Order
- 2.4.7 Focus Visible
- All screen reader testing

### Screen Reader Testing

- 1.3.1 Info and Relationships
- 2.4.4 Link Purpose
- 2.4.6 Headings and Labels
- 4.1.2 Name, Role, Value
- 4.1.3 Status Messages

## Common Failures by Criteria

### 1.4.3 Contrast

- Light gray text on white background
- Insufficient button contrast
- Placeholder text too light

### 2.1.1 Keyboard

- Custom widgets without keyboard support
- Click-only interactions
- Hover-only content reveal

### 2.4.7 Focus Visible

- `outline: none` without replacement
- Focus indicator same color as background
- Low contrast focus ring

### 4.1.2 Name, Role, Value

- Unlabeled icon buttons
- Missing ARIA on custom widgets
- ARIA states not updated

### 4.1.3 Status Messages

- Dynamic updates with no announcement
- Missing `aria-live`
- Error messages not in live region
