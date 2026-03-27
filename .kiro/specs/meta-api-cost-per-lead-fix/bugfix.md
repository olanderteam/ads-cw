# Bugfix Requirements Document

## Introduction

The Meta Ads API's `cost_per_action_type` field returns incorrect cost per lead values. The system currently trusts this API value directly, resulting in incorrect cost per lead calculations displayed in the dashboard. For example, AD-390125 shows a cost per lead of 2403.95 (which is actually the total spend value) when the correct calculated value should be 5.76 (spend / leads = 2403.95 / 417).

This bug affects the accuracy of campaign performance metrics and can lead to incorrect business decisions based on faulty cost per lead data.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the system receives ad data from Meta API with `cost_per_action_type` field THEN the system uses this value directly as `costPerLead` without validation

1.2 WHEN Meta API returns `cost_per_action_type` equal to the spend value (e.g., 2403.95) for an ad with leads (e.g., 417) THEN the system displays the incorrect cost per lead value (2403.95) instead of the calculated value (5.76)

1.3 WHEN the system transforms ad data in `api/meta-ads.ts` THEN the system assigns `cost_per_action_type` directly to `costPerLead` field

1.4 WHEN the system fetches ad data in `src/lib/meta-api-client.ts` THEN the system uses the incorrect `cost_per_action_type` value for cost per lead calculations

### Expected Behavior (Correct)

2.1 WHEN the system receives ad data from Meta API THEN the system SHALL calculate cost per lead as `spend / leads` regardless of the `cost_per_action_type` value

2.2 WHEN an ad has spend of 2403.95 and 417 leads THEN the system SHALL display cost per lead as 5.76 (or 5.764868 with full precision)

2.3 WHEN the system transforms ad data in `api/meta-ads.ts` THEN the system SHALL compute `costPerLead` by dividing `spend` by `leads` count

2.4 WHEN the system fetches ad data in `src/lib/meta-api-client.ts` THEN the system SHALL compute cost per lead by dividing spend by leads count

2.5 WHEN an ad has zero leads THEN the system SHALL handle the division by zero gracefully (return 0, null, or undefined as appropriate)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the system processes ads with valid spend and leads data THEN the system SHALL CONTINUE TO display all other metrics (spend, leads, impressions, clicks, etc.) correctly

3.2 WHEN the system displays ad data in the dashboard overview cards THEN the system SHALL CONTINUE TO show aggregated metrics correctly

3.3 WHEN the system displays ad data in the table rows THEN the system SHALL CONTINUE TO render all columns and formatting correctly

3.4 WHEN the system receives ad data without leads THEN the system SHALL CONTINUE TO handle missing data appropriately without crashing

3.5 WHEN the system processes multiple ads in a batch THEN the system SHALL CONTINUE TO transform all ads correctly and maintain performance
