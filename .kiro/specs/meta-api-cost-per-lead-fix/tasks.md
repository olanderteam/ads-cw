# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Cost Per Lead Calculation Accuracy
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate Meta API returns incorrect cost_per_action_type values
  - **Scoped PBT Approach**: Scope the property to concrete failing cases from the bug report (AD-390125: spend=2403.95, leads=417, incorrect cost_per_action_type=2403.95)
  - Test that for ads where Meta API returns cost_per_action_type != spend/leads, the system calculates costPerLead as spend/leads (not using Meta's incorrect value)
  - Mock Meta API responses with known incorrect cost_per_action_type values:
    - Case 1: spend=2403.95, leads=417, cost_per_action_type=2403.95 (incorrect) → expected costPerLead=5.76
    - Case 2: spend=1000.00, leads=50, cost_per_action_type=1000.00 (incorrect) → expected costPerLead=20.00
    - Case 3: spend=500.00, leads=25, cost_per_action_type=20.00 (correct but should be ignored) → expected costPerLead=20.00
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists, showing system uses Meta's incorrect values)
  - Document counterexamples found (e.g., "transformMetaAdToAd returns costPerLead=2403.95 instead of 5.76 for AD-390125")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Other Metrics Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-cost-per-lead fields
  - Write property-based tests capturing observed behavior patterns:
    - Property: For all Meta API responses, spend field is extracted correctly from insights.spend
    - Property: For all Meta API responses, leads count is extracted correctly from insights.actions
    - Property: For all Meta API responses, impressions, clicks, reach, CTR are calculated identically
    - Property: For all Meta API responses, creative data (headline, body, thumbnail) is extracted identically
    - Property: For all Meta API responses, status and platform detection work identically
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for Meta API cost per lead calculation

  - [x] 3.1 Update transformMetaAdToAd in src/lib/meta-api-client.ts
    - Remove dependency on cost_per_action_type from Meta API
    - Calculate cost per lead directly: `const costPerLead = leads > 0 ? spend / leads : 0;`
    - Handle division by zero: return 0 when leads = 0
    - Round to 2 decimal places: `parseFloat(costPerLead.toFixed(2))`
    - Add explanatory comment documenting why we calculate instead of using Meta's value
    - _Bug_Condition: isBugCondition(metaAd) where cost_per_action_type != spend/leads AND leads > 0_
    - _Expected_Behavior: costPerLead = spend / leads (or 0 when leads = 0), ignoring Meta's cost_per_action_type_
    - _Preservation: All other metrics (spend, leads, impressions, clicks, reach, CTR, creative data, status, platform) remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Update handler transformation logic in api/meta-ads.ts
    - Remove dependency on cost_per_action_type from Meta API
    - Calculate cost per lead directly: `const costPerLead = leads > 0 ? spend / leads : 0;`
    - Handle division by zero: return 0 when leads = 0
    - Round to 2 decimal places: `parseFloat(costPerLead.toFixed(2))`
    - Add debug logging to compare Meta's value vs calculated value
    - _Bug_Condition: isBugCondition(metaAd) where cost_per_action_type != spend/leads AND leads > 0_
    - _Expected_Behavior: costPerLead = spend / leads (or 0 when leads = 0), ignoring Meta's cost_per_action_type_
    - _Preservation: All other metrics and API handler behavior remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Cost Per Lead Calculation Accuracy
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - system now calculates costPerLead correctly)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Other Metrics Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in other metrics)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
