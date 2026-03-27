# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Cost per Lead Card Shows Total Spend in Trend
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to the Cost per Lead card with any valid totalSpend and totalLeads values
  - Test that Cost per Lead card trend text contains "Total spend:" when rendered with any positive totalSpend and totalLeads values
  - The test assertions should verify the trend text shows "From {totalLeads} leads" instead of "Total spend: {totalSpend}"
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Cost-Per-Lead Card Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy cards (Total Leads, Total Clicks, Total Impressions, Total Reach)
  - Write property-based tests capturing observed behavior patterns:
    - Cost per Lead calculation continues to use (totalSpend / totalLeads) formula
    - Cost per Lead main value continues to be formatted as currency
    - Other overview cards continue to show their current trend information unchanged
    - AdsTable Cost/Lead column continues to show ad.costPerLead value
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Fix Cost per Lead card trend text

  - [ ] 3.1 Update Cost per Lead card trend text in OverviewCards.tsx
    - Locate the Cost per Lead card definition (around line 35-40)
    - Change trend text from "Total spend: {formatCurrency(totalSpend, currency)}" to "From {totalLeads} leads"
    - Ensure the change only affects the Cost per Lead card, not other cards
    - _Bug_Condition: Cost per Lead card is rendered with trend text showing "Total spend: {totalSpend}"_
    - _Expected_Behavior: Cost per Lead card trend text shows "From {totalLeads} leads" (from requirement 2.1)_
    - _Preservation: Cost per Lead calculation formula, currency formatting, other cards' trend text, AdsTable Cost/Lead column, Meta API cost per lead calculation (from requirements 3.1-3.5)_
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Cost per Lead Card Shows Lead Count Context
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Cost-Per-Lead Card Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
