# Calendar Date Selection Fix - Bugfix Design

## Overview

The calendar date range picker incorrectly interprets user clicks on dates in the second displayed month due to a misalignment between the `month` prop and the visual display when `numberOfMonths={2}` is used. The fix involves either removing the `month` prop to allow react-day-picker to manage month state internally, or adjusting the month calculation to account for the multi-month display. The minimal approach is to remove the `month` prop, allowing the calendar to automatically display the correct months based on the selected date range.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when users click on dates in the second displayed month (e.g., March) while the `month` prop points to the first month (e.g., February)
- **Property (P)**: The desired behavior - clicked dates should be correctly interpreted as the actual calendar date displayed, not offset by the month prop
- **Preservation**: Existing date selection behavior for the first month, preset buttons, single date selection, debouncing, and locale formatting must remain unchanged
- **CalendarComponent**: The react-day-picker component in `src/components/ui/calendar.tsx` that wraps DayPicker
- **TopBar**: The component in `src/components/dashboard/TopBar.tsx` that contains the calendar popover and date range logic
- **month prop**: The react-day-picker prop that controls which month is initially displayed; when set with `numberOfMonths > 1`, it becomes the base month for internal date calculations
- **dateRange.from**: The start date of the selected range, typically set to N days ago (e.g., 30 days ago for "Últimos 30 dias")

## Bug Details

### Fault Condition

The bug manifests when a user clicks on a date in the second displayed month (e.g., March) while the calendar's `month` prop is set to a date in the first displayed month (e.g., February). The react-day-picker library uses the `month` prop as the base for its internal month tracking, causing it to misinterpret clicks in the second month as dates in the first month.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { clickedDate: Date, monthProp: Date, numberOfMonths: number }
  OUTPUT: boolean
  
  RETURN input.numberOfMonths == 2
         AND input.clickedDate.getMonth() != input.monthProp.getMonth()
         AND input.clickedDate is displayed in the second visible month
         AND dateInterpretedIncorrectly(input.clickedDate, input.monthProp)
END FUNCTION
```

### Examples

- **Example 1**: User clicks on March 1st in the calendar UI. The `month` prop is set to February 1st (from `dateRange.from` being 30 days ago). Expected: `2026-03-01`. Actual: `2026-02-01`.

- **Example 2**: User clicks on March 3rd in the calendar UI. The `month` prop is set to February 1st. Expected: `2026-03-03`. Actual: `2026-02-03` or invalid range `2026-02-01` to `2026-03-03`.

- **Example 3**: User clicks on March 15th in the calendar UI. The `month` prop is set to February 10th. Expected: `2026-03-15`. Actual: `2026-02-15`.

- **Edge Case**: User clicks on February dates (first month) - Expected: Correctly interpreted as February dates (this currently works and must be preserved).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Clicks on dates in the first displayed month must continue to work correctly
- Preset date range buttons ("Últimos 7 dias", "Últimos 30 dias", "Últimos 90 dias") must continue to set correct ranges
- Single date selection must continue to set both `from` and `to` to the same date with appropriate time boundaries (00:00:00.000 to 23:59:59.999)
- Date range changes must continue to debounce API calls by 500ms
- Date formatting must continue to use Brazilian Portuguese locale (dd/MM/yyyy)
- Calendar navigation (month forward/backward) must continue to work correctly

**Scope:**
All inputs that do NOT involve clicking dates in the second displayed month should be completely unaffected by this fix. This includes:
- Mouse clicks on dates in the first month
- Preset button clicks
- Calendar navigation controls
- Date display formatting

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Incorrect Month Prop Usage**: The `month` prop is set to `dateRange?.from || new Date()` in TopBar.tsx line 151. When `dateRange.from` is a date in February (e.g., 30 days ago) and `numberOfMonths={2}` displays February and March, the react-day-picker library uses February as the base month for its internal calculations.

2. **react-day-picker Internal Behavior**: The react-day-picker library (v8.10.1) uses the `month` prop as the starting point for month indexing when `numberOfMonths > 1`. When a user clicks on a date in the second month, the library calculates the date relative to the `month` prop, causing month misalignment.

3. **Unnecessary Month Control**: The `month` prop is being used to control the initial display, but react-day-picker can automatically determine the correct months to display based on the `selected` prop (the current date range). Setting `month` explicitly overrides this automatic behavior and causes the misalignment.

4. **No Month Offset Calculation**: The code does not account for the fact that with `numberOfMonths={2}`, the calendar displays two consecutive months, and the `month` prop should potentially be adjusted to ensure proper alignment.

## Correctness Properties

Property 1: Fault Condition - Second Month Date Selection

_For any_ user click on a date in the second displayed month (e.g., March) when `numberOfMonths={2}` is set, the fixed calendar SHALL correctly interpret the clicked date as the actual calendar date displayed (e.g., March 1st should be interpreted as March 1st, not February 1st).

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - First Month and Other Interactions

_For any_ user interaction that does NOT involve clicking dates in the second displayed month (including first month clicks, preset buttons, single date selection, and date formatting), the fixed calendar SHALL produce exactly the same behavior as the original calendar, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/components/dashboard/TopBar.tsx`

**Function**: `TopBar` component (calendar configuration)

**Specific Changes**:

1. **Remove the `month` prop**: Remove line 151 (`month={dateRange?.from || new Date()}`) to allow react-day-picker to automatically manage month display based on the selected date range.
   - This is the minimal fix that addresses the root cause
   - react-day-picker will automatically display the correct months based on the `selected` prop
   - The calendar will still show the appropriate months for the current selection

2. **Alternative (if month control is needed)**: If explicit month control is required for UX reasons, calculate the month to ensure proper alignment:
   ```typescript
   month={dateRange?.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 1) : new Date()}
   ```
   However, this is likely unnecessary as react-day-picker handles this automatically.

3. **Keep the `onMonthChange` handler**: The existing `onMonthChange` handler (lines 152-154) can remain for debugging purposes or be removed if not needed.

4. **Verify `onSelect` logic**: The existing `onSelect` handler (lines 137-149) correctly handles date range selection and should not require changes. It properly:
   - Sets time boundaries (00:00:00.000 for `from`, 23:59:59.999 for `to`)
   - Handles single date selection (uses `from` as `to` when `to` is not set)
   - Logs selection for debugging

5. **Test with different date ranges**: Verify the fix works correctly when:
   - Default range is "last 30 days" spanning two months
   - User selects dates in both the first and second month
   - User navigates between months using calendar controls

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate clicking on dates in the second displayed month (March) when the `month` prop is set to a date in the first month (February). Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **March 1st Click Test**: Set date range to last 30 days (Feb 1 - Mar 3), click March 1st in UI, verify it's interpreted as Feb 1st (will fail on unfixed code)
2. **March 3rd Click Test**: Set date range to last 30 days, click March 3rd in UI, verify it's interpreted as Feb 3rd or creates invalid range (will fail on unfixed code)
3. **March 15th Click Test**: Set date range to last 30 days, click March 15th in UI, verify it's interpreted as Feb 15th (will fail on unfixed code)
4. **Month Boundary Test**: Click on the last day of the second month, verify correct interpretation (may fail on unfixed code)

**Expected Counterexamples**:
- Dates in the second month are interpreted as dates in the first month (month offset by -1)
- Possible causes: `month` prop causes react-day-picker to use wrong base month for calculations, no offset adjustment for `numberOfMonths={2}`

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleDateClick_fixed(input)
  ASSERT expectedBehavior(result)
  ASSERT result.selectedDate.getMonth() == input.clickedDate.getMonth()
  ASSERT result.selectedDate.getDate() == input.clickedDate.getDate()
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT handleDateClick_original(input) = handleDateClick_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for first-month clicks and preset buttons, then write property-based tests capturing that behavior.

**Test Cases**:
1. **First Month Click Preservation**: Observe that clicking February dates works correctly on unfixed code, then write test to verify this continues after fix
2. **Preset Button Preservation**: Observe that preset buttons ("Últimos 7 dias", etc.) work correctly on unfixed code, then write test to verify this continues after fix
3. **Single Date Selection Preservation**: Observe that selecting a single date sets both `from` and `to` correctly on unfixed code, then write test to verify this continues after fix
4. **Date Formatting Preservation**: Observe that dates display in dd/MM/yyyy format on unfixed code, then write test to verify this continues after fix

### Unit Tests

- Test clicking dates in the second month (March) returns correct month and date
- Test clicking dates in the first month (February) continues to work correctly
- Test preset buttons set correct date ranges
- Test single date selection sets both `from` and `to` with correct time boundaries
- Test edge cases (month boundaries, year boundaries, leap years)

### Property-Based Tests

- Generate random date ranges spanning two months and verify clicks in both months are interpreted correctly
- Generate random preset selections and verify they produce correct date ranges
- Test that all date formatting operations continue to use Brazilian Portuguese locale across many scenarios
- Generate random single date selections and verify `from` and `to` are set correctly

### Integration Tests

- Test full user flow: open calendar, click preset button, verify API receives correct dates
- Test full user flow: open calendar, click date in second month, verify API receives correct dates
- Test full user flow: open calendar, select date range spanning both months, verify API receives correct dates
- Test calendar navigation: navigate between months, select dates, verify correct interpretation
- Test visual feedback: verify selected dates are highlighted correctly in both months
