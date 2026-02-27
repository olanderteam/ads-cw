# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Date Filter Causes Metric Mismatch
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases: dateFrom=2024-02-20, dateTo=2024-02-27
  - Test that when dateFrom and dateTo are provided, the handler applies time_range ONLY in the insights field (not as query parameter)
  - Test that metrics returned (impressions, clicks, leads) match Meta Ads Manager values for the same period (tolerance <1%)
  - Concrete test case: dateFrom=2024-02-20, dateTo=2024-02-27 should return ~1,320,919 impressions and ~7,421 clicks (Meta Manager values)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: expected vs actual metrics, URL construction issues (time_range duplication)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Date Filter Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (requests without dateFrom/dateTo)
  - Write property-based tests capturing observed behavior patterns:
    - Requests without date filters use date_preset(last_30d) in insights field
    - Status filters (active/inactive) work correctly using filtering with effective_status
    - Pagination fetches all pages up to 500 ads limit
    - Lead aggregation from multiple action_types (lead, onsite_conversion.lead_grouped, leadgen_grouped, offsite_conversion.fb_pixel_lead)
    - Derived metrics calculation (CTR, cost per lead) remains correct
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for Meta Ads data mismatch when filtering by date range

  - [x] 3.1 Implement the fix in api/meta-ads.ts
    - Remove duplicate time_range query parameter (lines ~67-72)
    - Keep only the correct application in insights field: `.time_range({'since':'${dateFrom}','until':'${dateTo}'})`
    - Add explanatory comment: time_range as query parameter filters ads by creation date, NOT insights metrics
    - Add date format validation (YYYY-MM-DD) with 400 error response if invalid
    - Add logging of final constructed URL for debugging
    - Validate insights field syntax uses `.date_preset(last_30d)` when dateFrom/dateTo not provided
    - _Bug_Condition: isBugCondition(input) where input.query.dateFrom IS NOT NULL AND input.query.dateTo IS NOT NULL AND time_range_applied_in_insights_field(input) AND time_range_applied_as_query_parameter(input)_
    - _Expected_Behavior: For any request with date filters, apply time_range ONLY in insights field, metrics SHALL match Meta Ads Manager values (tolerance <1%)_
    - _Preservation: Requests without date filters SHALL produce identical results to original function, preserving status filters, pagination, lead aggregation, derived metrics calculation, and date_preset(last_30d) default_
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Date Filter Accuracy
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify metrics now match Meta Ads Manager values (tolerance <1%)
    - Verify URL construction shows time_range only in insights field
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Date Filter Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - Verify status filters, pagination, lead aggregation, and derived metrics still work correctly
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
