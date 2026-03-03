# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Second Month Date Selection
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - clicks on dates in the second displayed month (March) when month prop is set to first month (February)
  - Test that clicking March 1st, March 3rd, and March 15th in the calendar UI correctly interprets them as March dates (not February dates)
  - Test implementation details from Fault Condition: `isBugCondition(input)` where `input.numberOfMonths == 2` AND `input.clickedDate.getMonth() != input.monthProp.getMonth()` AND clicked date is in second visible month
  - The test assertions should verify: `result.selectedDate.getMonth() == input.clickedDate.getMonth()` AND `result.selectedDate.getDate() == input.clickedDate.getDate()`
  - Run test on UNFIXED code (with `month={dateRange?.from || new Date()}` prop still present)
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: March dates being interpreted as February dates (month offset by -1)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - First Month and Other Interactions
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (first month clicks, preset buttons, single date selection, date formatting)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - First month clicks (February dates) are correctly interpreted
    - Preset buttons ("Últimos 7 dias", "Últimos 30 dias", "Últimos 90 dias") set correct date ranges
    - Single date selection sets both `from` and `to` to same date with time boundaries (00:00:00.000 to 23:59:59.999)
    - Date range changes debounce API calls by 500ms
    - Dates display in Brazilian Portuguese locale (dd/MM/yyyy)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix calendar date selection in second month

  - [x] 3.1 Implement the fix in TopBar.tsx
    - Remove the `month` prop from the Calendar component (line 151: `month={dateRange?.from || new Date()}`)
    - Allow react-day-picker to automatically manage month display based on the selected date range
    - Keep the `onMonthChange` handler for debugging purposes or remove if not needed
    - Verify `onSelect` logic remains unchanged (correctly handles date range selection with time boundaries)
    - _Bug_Condition: isBugCondition(input) where input.numberOfMonths == 2 AND input.clickedDate.getMonth() != input.monthProp.getMonth() AND clicked date is in second visible month_
    - _Expected_Behavior: For any click on a date in the second displayed month, the calendar SHALL correctly interpret the clicked date as the actual calendar date displayed (result.selectedDate.getMonth() == input.clickedDate.getMonth())_
    - _Preservation: All interactions NOT involving second month clicks (first month clicks, preset buttons, single date selection, debouncing, locale formatting) SHALL produce exactly the same behavior as original_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Second Month Date Selection
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - March dates now correctly interpreted as March, not February)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - First Month and Other Interactions
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions - first month clicks, preset buttons, single date selection, debouncing, and locale formatting all still work correctly)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
