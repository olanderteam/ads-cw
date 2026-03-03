# Bugfix Requirements Document

## Introduction

The calendar date range picker in the dashboard incorrectly interprets user clicks on dates in the second displayed month. When users attempt to select dates in March (e.g., March 1-3), the system interprets these clicks as February dates, resulting in incorrect date ranges being sent to the API. This occurs because the calendar's `month` prop is set to `dateRange?.from`, which typically points to a date in the previous month (e.g., February when the default is "last 30 days" and today is in March). This causes the calendar to misalign its internal month tracking with the visual display when `numberOfMonths={2}` is used.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user clicks on March 1st in the calendar UI (with `numberOfMonths={2}` showing February and March) THEN the system interprets the click as February 1st and sends `dateFrom=2026-02-01` to the API

1.2 WHEN the user clicks on March 3rd in the calendar UI THEN the system interprets the click as February 3rd or creates an invalid range spanning `dateFrom=2026-02-01&dateTo=2026-03-03`

1.3 WHEN the `dateRange.from` is set to a date in February (e.g., 30 days ago) and the calendar displays two months THEN the calendar's `month` prop points to February, causing month misalignment for clicks in the second visible month (March)

### Expected Behavior (Correct)

2.1 WHEN the user clicks on March 1st in the calendar UI THEN the system SHALL correctly interpret it as March 1st and send `dateFrom=2026-03-01` to the API

2.2 WHEN the user clicks on March 3rd in the calendar UI THEN the system SHALL correctly interpret it as March 3rd and create a valid range with `dateTo=2026-03-03`

2.3 WHEN the calendar displays two months with `numberOfMonths={2}` THEN the system SHALL correctly map user clicks to the appropriate month regardless of which month is set in the `month` prop

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user clicks on dates in the first displayed month (e.g., February) THEN the system SHALL CONTINUE TO correctly interpret those dates as February dates

3.2 WHEN the user selects preset date ranges ("Últimos 7 dias", "Últimos 30 dias", "Últimos 90 dias") THEN the system SHALL CONTINUE TO set the correct date ranges

3.3 WHEN the user selects a single date THEN the system SHALL CONTINUE TO set both `from` and `to` to the same date (with appropriate time boundaries)

3.4 WHEN the date range changes THEN the system SHALL CONTINUE TO debounce API calls by 500ms to avoid excessive requests

3.5 WHEN dates are displayed in the UI THEN the system SHALL CONTINUE TO format them using Brazilian Portuguese locale (dd/MM/yyyy)
