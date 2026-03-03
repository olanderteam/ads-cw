# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Platform Detection** - Platform should be extracted from Meta API, not hardcoded
  - **Property 2: Creative Data Completeness** - All available creative fields should be extracted
  - **Property 3: Aggregated Metrics Accuracy** - Totals should match Meta Ads Manager
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - Test that platform is extracted from `publisher_platforms` or appropriate field
  - Test that creative data includes all available fields (images, videos, texts, links, CTA)
  - Test that aggregated metrics (total leads, spend, clicks, impressions, reach) are calculated correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found: hardcoded platform, missing creative fields, incorrect totals
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: R1.1, R1.2, R1.3, R1.4, R2.1, R2.2, R2.3, R3.1, R3.2, R3.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 4: Preservation** - Existing functionality unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy functionality
  - Write property-based tests capturing observed behavior patterns:
    - Status filters work correctly
    - Date filters work correctly
    - Pagination works correctly
    - Derived metrics (CTR, cost per lead) are calculated correctly
    - Text search works correctly
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix platform detection and creative data extraction

  - [x] 3.1 Add platform fields to Meta API request
    - Update fields array in api/meta-ads.ts to include:
      - `configured_status`
      - `targeting{publisher_platforms}`
    - These fields contain platform information
    - _Requirements: R1.1_

  - [x] 3.2 Extract and map platform information
    - Extract `publisher_platforms` from targeting object
    - Map Meta API values to display values:
      - `facebook` → "Facebook"
      - `instagram` → "Instagram"
      - `messenger` → "Messenger"
      - `audience_network` → "Audience Network"
    - Handle multiple platforms (join with ", ")
    - Use "Meta Ads" as fallback when platform cannot be determined
    - Replace hardcoded `platform: 'Facebook'` with extracted value
    - _Requirements: R1.1, R1.2, R1.3, R1.4_

  - [x] 3.3 Improve creative data extraction
    - Add fallbacks for headline:
      - `creative.title` → `creative.name` → `metaAd.name` → `creative.object_story_spec?.link_data?.name` → 'Sem título'
    - Add fallbacks for body:
      - `creative.body` → `creative.message` → `creative.object_story_spec?.link_data?.message` → ''
    - Add fallbacks for thumbnail:
      - `creative.thumbnail_url` → `creative.image_url` → `creative.video_thumbnail_url` → `creative.object_story_spec?.link_data?.picture` → ''
    - Add fallbacks for CTA:
      - `creative.call_to_action_type` → `creative.object_story_spec?.link_data?.call_to_action?.type` → 'LEARN_MORE'
    - Add fallbacks for destination URL:
      - `creative.link_url` → `creative.object_url` → `creative.object_story_spec?.link_data?.link` → ''
    - _Requirements: R2.1, R2.2, R2.3_

  - [x] 3.4 Update Ad interface to support multiple platforms
    - Change `platform: "Facebook" | "Instagram"` to `platform: string`
    - This allows combinations like "Facebook, Instagram"
    - Update type definition in src/data/mockAds.ts
    - _Requirements: R1.3_

  - [x] 3.5 Add debug logging for aggregated metrics
    - Add console.log in OverviewCards.tsx to log calculated totals
    - This helps validate that metrics are correct
    - Log: totalLeads, totalSpend, totalClicks, totalImpressions, totalReach, adsCount
    - _Requirements: R3.1, R3.2, R3.3_

- [x] 4. Verify bug condition exploration tests now pass
  - **Properties 1, 2, 3: Expected Behavior**
  - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
  - Run bug condition exploration tests from step 1
  - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
  - Verify platform is extracted correctly from API
  - Verify creative data is complete
  - Verify aggregated metrics match Meta Ads Manager (tolerance <1%)
  - _Requirements: R1.1, R1.2, R1.3, R1.4, R2.1, R2.2, R2.3, R3.1, R3.2, R3.3_

- [x] 5. Verify preservation tests still pass
  - **Property 4: Preservation**
  - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
  - Run preservation property tests from step 2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Confirm all tests still pass after fix (no regressions)
  - Verify status filters, date filters, pagination, derived metrics, text search still work correctly
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Manual validation against Meta Ads Manager
  - Open Meta Ads Manager and dashboard side-by-side
  - Compare platform for each ad (should match exactly)
  - Compare creative data for each ad (images, texts, links should match)
  - Compare aggregated metrics (totals should match within <1%)
  - Document any remaining discrepancies
  - If discrepancies found, investigate and fix
  - _Requirements: R4.1, R4.2, R4.3_

- [x] 7. Checkpoint - Ensure all tests pass and data matches
  - Ensure all automated tests pass
  - Ensure manual validation shows data matches Meta Ads Manager
  - Ask the user if questions arise or if additional issues are found
