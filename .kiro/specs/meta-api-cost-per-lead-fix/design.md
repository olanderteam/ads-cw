# Meta API Cost Per Lead Fix Design

## Overview

The Meta Ads API's `cost_per_action_type` field returns unreliable cost per lead values. In some cases, it returns the total spend value instead of the actual cost per lead (e.g., returning 2403.95 when the correct value should be 5.76 for an ad with 2403.95 spend and 417 leads). This bug causes incorrect cost per lead metrics to be displayed in the dashboard, potentially leading to poor business decisions.

The fix is straightforward: always calculate cost per lead as `spend / leads` instead of trusting the Meta API's `cost_per_action_type` value. This ensures accurate, consistent cost per lead calculations across all ads.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when Meta API returns `cost_per_action_type` that doesn't match `spend / leads`
- **Property (P)**: The desired behavior - cost per lead should always equal `spend / leads` (or 0 when leads = 0)
- **Preservation**: All other ad metrics (spend, leads, impressions, clicks, etc.) and dashboard functionality must remain unchanged
- **cost_per_action_type**: Meta API field that sometimes returns incorrect cost per lead values
- **costPerLead**: The calculated cost per lead field in our Ad interface
- **transformMetaAdToAd**: Function in `src/lib/meta-api-client.ts` that transforms Meta API responses to our Ad interface
- **handler**: Function in `api/meta-ads.ts` that fetches and transforms ad data from Meta API

## Bug Details

### Fault Condition

The bug manifests when the Meta API returns a `cost_per_action_type` value that doesn't match the actual cost per lead calculation (`spend / leads`). The system currently trusts this API value directly, resulting in incorrect cost per lead being displayed.

**Formal Specification:**
```
FUNCTION isBugCondition(metaAd)
  INPUT: metaAd of type MetaApiAdResponse
  OUTPUT: boolean
  
  insights := metaAd.insights.data[0]
  spend := parseFloat(insights.spend OR 0)
  leads := extractLeadsCount(insights.actions)
  costPerActionType := extractCostPerLead(insights.cost_per_action_type)
  
  expectedCostPerLead := IF leads > 0 THEN spend / leads ELSE 0
  
  RETURN costPerActionType EXISTS
         AND costPerActionType != expectedCostPerLead
         AND leads > 0
END FUNCTION
```

### Examples

- **Example 1**: AD-390125 has spend=2403.95, leads=417
  - Meta API returns: `cost_per_action_type` = 2403.95 (incorrect - this is the spend value)
  - Expected: costPerLead = 2403.95 / 417 = 5.76
  - Current behavior: Displays 2403.95 as cost per lead
  - Correct behavior: Should display 5.76

- **Example 2**: AD-123456 has spend=1000.00, leads=50
  - Meta API returns: `cost_per_action_type` = 1000.00 (incorrect)
  - Expected: costPerLead = 1000.00 / 50 = 20.00
  - Current behavior: Displays 1000.00 as cost per lead
  - Correct behavior: Should display 20.00

- **Example 3**: AD-789012 has spend=500.00, leads=25
  - Meta API returns: `cost_per_action_type` = 20.00 (correct)
  - Expected: costPerLead = 500.00 / 25 = 20.00
  - Current behavior: Displays 20.00 (happens to be correct)
  - Correct behavior: Should display 20.00 (calculated, not from API)

- **Edge Case**: AD-999999 has spend=100.00, leads=0
  - Meta API may return: `cost_per_action_type` = undefined or some value
  - Expected: costPerLead = 0 (division by zero handled gracefully)
  - Correct behavior: Should display 0 or handle gracefully without crashing

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All other ad metrics (spend, leads, impressions, clicks, reach, CTR) must continue to display correctly
- Dashboard overview cards showing aggregated metrics must remain unchanged
- Ad table rows with all columns and formatting must render correctly
- Ads without leads must continue to be handled appropriately without crashing
- Batch processing of multiple ads must maintain performance and correctness
- Redis caching behavior must remain unchanged
- Error handling for Meta API failures must remain unchanged
- Platform detection and display must remain unchanged
- Creative extraction (headline, body, thumbnail, CTA) must remain unchanged

**Scope:**
All inputs that do NOT involve cost per lead calculation should be completely unaffected by this fix. This includes:
- Mouse clicks and UI interactions
- Date range filtering
- Status filtering (active/inactive)
- Pagination and data fetching
- Cache hit/miss behavior
- All other metric calculations

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

1. **Meta API Data Quality Issue**: The Meta API's `cost_per_action_type` field is unreliable and sometimes returns the total spend value instead of the actual cost per lead. This appears to be a data quality issue on Meta's side.

2. **Trusting External API Values**: The original code trusted the `cost_per_action_type` value from Meta API without validation or recalculation, assuming Meta would always return correct values.

3. **No Validation Logic**: There was no validation to check if `cost_per_action_type` matched the expected `spend / leads` calculation.

4. **Duplicate Calculation Logic**: Both `api/meta-ads.ts` and `src/lib/meta-api-client.ts` have transformation logic that needs to be updated consistently.

## Correctness Properties

Property 1: Fault Condition - Cost Per Lead Calculation Accuracy

_For any_ ad data received from Meta API where leads > 0, the system SHALL calculate costPerLead as spend / leads, ignoring the cost_per_action_type value from Meta API, ensuring accurate cost per lead metrics are displayed in the dashboard.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Fault Condition - Zero Leads Handling

_For any_ ad data received from Meta API where leads = 0, the system SHALL set costPerLead to 0 (or handle gracefully), preventing division by zero errors and ensuring the application remains stable.

**Validates: Requirements 2.5**

Property 3: Preservation - Other Metrics Unchanged

_For any_ ad data received from Meta API, the system SHALL continue to calculate and display all other metrics (spend, leads, impressions, clicks, reach, CTR, currency) exactly as before, preserving existing functionality for all non-cost-per-lead calculations.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

The fix has already been implemented in the codebase. Here's what was changed:

**File 1**: `api/meta-ads.ts`

**Function**: `handler` (transformation logic around line 240-260)

**Specific Changes**:
1. **Remove dependency on cost_per_action_type**: Stop extracting and using the `cost_per_action_type` value from Meta API
2. **Calculate cost per lead directly**: Use `const costPerLead = leads > 0 ? spend / leads : 0;`
3. **Add debug logging**: Log both Meta's value and calculated value for comparison and debugging
4. **Handle division by zero**: Return 0 when leads = 0 to prevent crashes
5. **Round to 2 decimal places**: Use `parseFloat(costPerLead.toFixed(2))` for consistent display

**File 2**: `src/lib/meta-api-client.ts`

**Function**: `transformMetaAdToAd`

**Specific Changes**:
1. **Remove dependency on cost_per_action_type**: Stop extracting and using the `cost_per_action_type` value from Meta API
2. **Calculate cost per lead directly**: Use `const costPerLead = leads > 0 ? spend / leads : 0;`
3. **Handle division by zero**: Return 0 when leads = 0 to prevent crashes
4. **Round to 2 decimal places**: Use `parseFloat(costPerLead.toFixed(2))` for consistent display
5. **Add explanatory comment**: Document why we calculate instead of using Meta's value

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (or verify the fix works on fixed code), then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix (or verify the fix works if already implemented). Confirm that Meta API returns incorrect `cost_per_action_type` values.

**Test Plan**: Write tests that mock Meta API responses with known incorrect `cost_per_action_type` values and verify that the system calculates cost per lead correctly using `spend / leads`. Run these tests on the UNFIXED code to observe failures, or on FIXED code to verify correctness.

**Test Cases**:
1. **Incorrect API Value Test**: Mock Meta API returning `cost_per_action_type` = 2403.95 for ad with spend=2403.95, leads=417 (will fail on unfixed code, showing 2403.95 instead of 5.76)
2. **Another Incorrect Value Test**: Mock Meta API returning `cost_per_action_type` = 1000.00 for ad with spend=1000.00, leads=50 (will fail on unfixed code, showing 1000.00 instead of 20.00)
3. **Correct API Value Test**: Mock Meta API returning `cost_per_action_type` = 20.00 for ad with spend=500.00, leads=25 (should pass on both unfixed and fixed code, but fixed code ignores API value)
4. **Zero Leads Test**: Mock Meta API with spend=100.00, leads=0 (should handle gracefully without crashing)

**Expected Counterexamples**:
- Unfixed code displays cost per lead values that match Meta's incorrect `cost_per_action_type` instead of calculated `spend / leads`
- Possible causes: trusting external API values without validation, no recalculation logic

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (Meta returns incorrect cost_per_action_type), the fixed function produces the expected behavior (correct calculated cost per lead).

**Pseudocode:**
```
FOR ALL metaAd WHERE isBugCondition(metaAd) DO
  transformedAd := transformMetaAdToAd_fixed(metaAd)
  expectedCostPerLead := metaAd.spend / metaAd.leads
  ASSERT transformedAd.costPerLead = expectedCostPerLead
  ASSERT transformedAd.costPerLead != metaAd.cost_per_action_type
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs, the fixed function produces the same results for all other fields (spend, leads, impressions, clicks, etc.), preserving existing functionality.

**Pseudocode:**
```
FOR ALL metaAd DO
  originalAd := transformMetaAdToAd_original(metaAd)
  fixedAd := transformMetaAdToAd_fixed(metaAd)
  
  ASSERT fixedAd.spend = originalAd.spend
  ASSERT fixedAd.leads = originalAd.leads
  ASSERT fixedAd.impressions = originalAd.impressions
  ASSERT fixedAd.clicks = originalAd.clicks
  ASSERT fixedAd.reach = originalAd.reach
  ASSERT fixedAd.ctr = originalAd.ctr
  ASSERT fixedAd.headline = originalAd.headline
  ASSERT fixedAd.body = originalAd.body
  ASSERT fixedAd.thumbnail = originalAd.thumbnail
  ASSERT fixedAd.status = originalAd.status
  ASSERT fixedAd.platform = originalAd.platform
  // ... all other fields except costPerLead
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-cost-per-lead fields

**Test Plan**: Create property-based tests that generate random Meta API responses and verify that all fields except costPerLead remain unchanged between original and fixed implementations.

**Test Cases**:
1. **All Metrics Preservation**: Verify spend, leads, impressions, clicks, reach, CTR are calculated identically
2. **Creative Data Preservation**: Verify headline, body, thumbnail, CTA extraction works identically
3. **Status and Platform Preservation**: Verify status mapping and platform detection work identically
4. **Edge Cases Preservation**: Verify handling of missing data, zero values, and null fields works identically

### Unit Tests

- Test cost per lead calculation with various spend/leads combinations
- Test division by zero handling (leads = 0)
- Test rounding to 2 decimal places
- Test that cost_per_action_type from Meta API is ignored
- Test edge cases (very small leads, very large spend, etc.)
- Test that all other metrics are extracted correctly

### Property-Based Tests

- Generate random Meta API responses with varying spend/leads values and verify costPerLead = spend / leads
- Generate random incorrect cost_per_action_type values and verify they are ignored
- Generate random ad data and verify all other fields are preserved correctly
- Test across many scenarios to ensure no regressions in other metric calculations

### Integration Tests

- Test full API flow from Meta API call through transformation to dashboard display
- Test that dashboard displays correct cost per lead values for real ad data
- Test that Redis caching doesn't interfere with cost per lead calculation
- Test that date range filtering works correctly with cost per lead calculation
- Test that status filtering works correctly with cost per lead calculation
