# Bugfix Requirements Document

## Introduction

The Cost per Lead metric in the Meta Ads dashboard is displaying confusing information that makes it difficult for users to understand the actual cost per lead value. The Cost per Lead overview card shows "Total spend: X" as the trend text, which is misleading because users expect to see information about the cost per lead metric itself, not the total spend. This creates confusion about what the card is actually showing and reduces the dashboard's usability.

The bug affects the Cost per Lead overview card in `src/components/dashboard/OverviewCards.tsx`. The card correctly calculates and displays the average cost per lead value (totalSpend / totalLeads), but the trend line shows "Total spend: R$ X.XX" which is confusing and doesn't provide meaningful context about the cost per lead metric.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the Cost per Lead overview card is displayed THEN the trend text shows "Total spend: {totalSpend}" instead of cost per lead information

1.2 WHEN users view the Cost per Lead card THEN they see the total spend value in the trend line, which creates confusion about whether the card is showing cost per lead or total spend

### Expected Behavior (Correct)

2.1 WHEN the Cost per Lead overview card is displayed THEN the trend text SHALL show meaningful information about the cost per lead metric, such as "From {totalLeads} leads" to provide context

2.2 WHEN users view the Cost per Lead card THEN they SHALL see only cost per lead information without the confusing total spend value in the trend line

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Cost per Lead card calculates the average cost per lead THEN the system SHALL CONTINUE TO use the formula (totalSpend / totalLeads) with proper handling of zero leads

3.2 WHEN the Cost per Lead card displays the main value THEN the system SHALL CONTINUE TO format it as currency using formatCurrency(avgCostPerLead, currency)

3.3 WHEN other overview cards (Total Leads, Total Clicks, Total Impressions, Total Reach) are displayed THEN the system SHALL CONTINUE TO show their current trend information unchanged

3.4 WHEN the Cost/Lead column in the AdsTable is displayed THEN the system SHALL CONTINUE TO show the per-ad cost per lead value from ad.costPerLead

3.5 WHEN the Meta API calculates cost per lead THEN the system SHALL CONTINUE TO use Meta's cost_per_action_type value when available, or calculate it as (spend / leads) when not available
