import { describe, it, expect } from 'vitest';
import { transformMetaAdToAd } from '@/lib/meta-api-client';

/**
 * Bug Condition Exploration Test - Cost Per Lead Calculation Accuracy
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test verifies that the system calculates cost per lead as spend/leads
 * instead of trusting Meta API's incorrect cost_per_action_type values.
 * 
 * EXPECTED OUTCOME on UNFIXED code: Test FAILS (proves bug exists)
 * EXPECTED OUTCOME on FIXED code: Test PASSES (confirms fix works)
 * 
 * The test uses concrete failing cases from the bug report:
 * - AD-390125: spend=2403.95, leads=417, Meta returns cost_per_action_type=2403.95 (incorrect)
 * - Expected: costPerLead should be 5.76 (calculated as 2403.95 / 417)
 */

describe('Bug Condition Exploration: Cost Per Lead Calculation', () => {
  /**
   * Property 1: Fault Condition - Cost Per Lead Calculation Accuracy
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
   * 
   * Test Case 1: AD-390125 - Meta returns spend value as cost_per_action_type
   * This is the exact failing case from the bug report.
   */
  it('Property 1.1: Should calculate costPerLead as spend/leads for AD-390125 (Meta returns 2403.95, expected 5.76)', () => {
    // Mock Meta API response with incorrect cost_per_action_type
    const metaAd = {
      id: '120212137390125',
      name: 'Test Ad - AD-390125',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137390125',
        name: 'Test Creative',
        title: 'Test Headline',
        body: 'Test body text',
        image_url: 'https://example.com/image.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '100000',
          clicks: '5000',
          inline_link_clicks: '4500',
          reach: '80000',
          spend: '2403.95',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '417' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '2403.95' } // INCORRECT - Meta returns spend value
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    // Transform the ad
    const transformedAd = transformMetaAdToAd(metaAd);

    // Expected cost per lead: 2403.95 / 417 = 5.764868... ≈ 5.76
    const expectedCostPerLead = 5.76;

    // ASSERTION 1: Cost per lead should be calculated (5.76), NOT Meta's incorrect value (2403.95)
    expect(transformedAd.costPerLead).toBe(expectedCostPerLead);

    // ASSERTION 2: Cost per lead should NOT equal the spend value
    expect(transformedAd.costPerLead).not.toBe(2403.95);

    // ASSERTION 3: Cost per lead should NOT equal Meta's incorrect cost_per_action_type
    expect(transformedAd.costPerLead).not.toBe(parseFloat(metaAd.insights.data[0].cost_per_action_type[0].value));

    // ASSERTION 4: Verify the calculation is correct
    const spend = parseFloat(metaAd.insights.data[0].spend);
    const leads = parseInt(metaAd.insights.data[0].actions[0].value);
    const calculatedCostPerLead = parseFloat((spend / leads).toFixed(2));
    expect(transformedAd.costPerLead).toBe(calculatedCostPerLead);

    console.log('✓ AD-390125 Cost Per Lead Calculation:', {
      spend,
      leads,
      metaCostPerActionType: metaAd.insights.data[0].cost_per_action_type[0].value,
      calculatedCostPerLead: transformedAd.costPerLead,
      expectedCostPerLead,
      isCorrect: transformedAd.costPerLead === expectedCostPerLead
    });
  });

  /**
   * Test Case 2: Another incorrect value scenario
   * Meta returns spend value (1000.00) instead of correct cost per lead (20.00)
   */
  it('Property 1.2: Should calculate costPerLead as spend/leads when Meta returns 1000.00 (expected 20.00)', () => {
    const metaAd = {
      id: '120212137123456',
      name: 'Test Ad - Case 2',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137123456',
        name: 'Test Creative 2',
        title: 'Test Headline 2',
        body: 'Test body text 2',
        image_url: 'https://example.com/image2.jpg',
        call_to_action_type: 'SIGN_UP'
      },
      insights: {
        data: [{
          impressions: '50000',
          clicks: '2500',
          inline_link_clicks: '2000',
          reach: '40000',
          spend: '1000.00',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '50' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '1000.00' } // INCORRECT - Meta returns spend value
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['instagram']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // Expected cost per lead: 1000.00 / 50 = 20.00
    const expectedCostPerLead = 20.00;

    // ASSERTION 1: Cost per lead should be calculated (20.00), NOT Meta's incorrect value (1000.00)
    expect(transformedAd.costPerLead).toBe(expectedCostPerLead);

    // ASSERTION 2: Cost per lead should NOT equal the spend value
    expect(transformedAd.costPerLead).not.toBe(1000.00);

    // ASSERTION 3: Verify the calculation is correct
    const spend = parseFloat(metaAd.insights.data[0].spend);
    const leads = parseInt(metaAd.insights.data[0].actions[0].value);
    const calculatedCostPerLead = parseFloat((spend / leads).toFixed(2));
    expect(transformedAd.costPerLead).toBe(calculatedCostPerLead);

    console.log('✓ Case 2 Cost Per Lead Calculation:', {
      spend,
      leads,
      metaCostPerActionType: metaAd.insights.data[0].cost_per_action_type[0].value,
      calculatedCostPerLead: transformedAd.costPerLead,
      expectedCostPerLead,
      isCorrect: transformedAd.costPerLead === expectedCostPerLead
    });
  });

  /**
   * Test Case 3: Meta returns correct value, but we should still calculate
   * This verifies that we ALWAYS calculate, even when Meta's value happens to be correct
   */
  it('Property 1.3: Should calculate costPerLead as spend/leads even when Meta returns correct value (20.00)', () => {
    const metaAd = {
      id: '120212137789012',
      name: 'Test Ad - Case 3',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137789012',
        name: 'Test Creative 3',
        title: 'Test Headline 3',
        body: 'Test body text 3',
        image_url: 'https://example.com/image3.jpg',
        call_to_action_type: 'SHOP_NOW'
      },
      insights: {
        data: [{
          impressions: '25000',
          clicks: '1250',
          inline_link_clicks: '1000',
          reach: '20000',
          spend: '500.00',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '25' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '20.00' } // CORRECT - but we should still calculate
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook', 'instagram']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // Expected cost per lead: 500.00 / 25 = 20.00
    const expectedCostPerLead = 20.00;

    // ASSERTION 1: Cost per lead should be calculated (20.00)
    expect(transformedAd.costPerLead).toBe(expectedCostPerLead);

    // ASSERTION 2: Verify the calculation is correct
    const spend = parseFloat(metaAd.insights.data[0].spend);
    const leads = parseInt(metaAd.insights.data[0].actions[0].value);
    const calculatedCostPerLead = parseFloat((spend / leads).toFixed(2));
    expect(transformedAd.costPerLead).toBe(calculatedCostPerLead);

    // ASSERTION 3: In this case, calculated value happens to match Meta's value
    // But the important thing is we're calculating, not using Meta's value directly
    expect(transformedAd.costPerLead).toBe(20.00);

    console.log('✓ Case 3 Cost Per Lead Calculation:', {
      spend,
      leads,
      metaCostPerActionType: metaAd.insights.data[0].cost_per_action_type[0].value,
      calculatedCostPerLead: transformedAd.costPerLead,
      expectedCostPerLead,
      note: 'Meta value happens to be correct, but we still calculate'
    });
  });

  /**
   * Test Case 4: Edge case - Zero leads (division by zero handling)
   * 
   * **Validates: Requirement 2.5**
   */
  it('Property 1.4: Should handle zero leads gracefully (return 0 for costPerLead)', () => {
    const metaAd = {
      id: '120212137999999',
      name: 'Test Ad - Zero Leads',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137999999',
        name: 'Test Creative 4',
        title: 'Test Headline 4',
        body: 'Test body text 4',
        image_url: 'https://example.com/image4.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '10000',
          clicks: '500',
          inline_link_clicks: '400',
          reach: '8000',
          spend: '100.00',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [], // No leads
          cost_per_action_type: [] // No cost per action type
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // ASSERTION 1: Cost per lead should be 0 when there are no leads
    expect(transformedAd.costPerLead).toBe(0);

    // ASSERTION 2: Leads should be 0
    expect(transformedAd.leads).toBe(0);

    // ASSERTION 3: Spend should still be recorded correctly
    expect(transformedAd.spend).toBe(100.00);

    // ASSERTION 4: Should not crash or throw error
    expect(transformedAd).toBeDefined();
    expect(transformedAd.costPerLead).toBeDefined();

    console.log('✓ Zero Leads Edge Case:', {
      spend: transformedAd.spend,
      leads: transformedAd.leads,
      costPerLead: transformedAd.costPerLead,
      note: 'Division by zero handled gracefully'
    });
  });
});

/**
 * Preservation Property Tests - Other Metrics Unchanged
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * These tests verify that when cost per lead calculation is fixed, all other
 * ad metrics and transformations remain unchanged. This follows the observation-first
 * methodology by testing on UNFIXED code to establish baseline behavior.
 * 
 * EXPECTED OUTCOME: These tests PASS on unfixed code (confirms baseline to preserve)
 * 
 * The tests verify:
 * - Spend field is extracted correctly from insights.spend
 * - Leads count is extracted correctly from insights.actions
 * - Impressions, clicks, reach, CTR are calculated identically
 * - Creative data (headline, body, thumbnail) is extracted identically
 * - Status and platform detection work identically
 */

describe('Preservation Properties: Other Metrics Unchanged', () => {
  /**
   * Property 2.1: Spend Field Extraction Preservation
   * 
   * **Validates: Requirement 3.1**
   * 
   * Verifies that spend field is extracted correctly from insights.spend
   * regardless of cost per lead calculation changes.
   * 
   * EXPECTED OUTCOME: PASS on unfixed code
   */
  it('Property 2.1: Spend field is extracted correctly from insights.spend', () => {
    const metaAd = {
      id: '120212137390125',
      name: 'Test Ad - Spend Preservation',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137390125',
        name: 'Test Creative',
        title: 'Test Headline',
        body: 'Test body text',
        image_url: 'https://example.com/image.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '100000',
          clicks: '5000',
          inline_link_clicks: '4500',
          reach: '80000',
          spend: '2403.95',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '417' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '2403.95' }
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // ASSERTION 1: Spend should be extracted correctly
    expect(transformedAd.spend).toBe(2403.95);

    // ASSERTION 2: Spend should match the insights.spend value
    const expectedSpend = parseFloat(metaAd.insights.data[0].spend);
    expect(transformedAd.spend).toBe(expectedSpend);

    // ASSERTION 3: Spend should be rounded to 2 decimal places
    expect(transformedAd.spend).toBe(parseFloat(expectedSpend.toFixed(2)));

    console.log('✓ Spend Preservation:', {
      originalSpend: metaAd.insights.data[0].spend,
      transformedSpend: transformedAd.spend,
      isPreserved: transformedAd.spend === expectedSpend
    });
  });

  /**
   * Property 2.2: Leads Count Extraction Preservation
   * 
   * **Validates: Requirement 3.1**
   * 
   * Verifies that leads count is extracted correctly from insights.actions
   * regardless of cost per lead calculation changes.
   * 
   * EXPECTED OUTCOME: PASS on unfixed code
   */
  it('Property 2.2: Leads count is extracted correctly from insights.actions', () => {
    const metaAd = {
      id: '120212137390125',
      name: 'Test Ad - Leads Preservation',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137390125',
        name: 'Test Creative',
        title: 'Test Headline',
        body: 'Test body text',
        image_url: 'https://example.com/image.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '100000',
          clicks: '5000',
          inline_link_clicks: '4500',
          reach: '80000',
          spend: '2403.95',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '417' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '2403.95' }
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // ASSERTION 1: Leads should be extracted correctly
    expect(transformedAd.leads).toBe(417);

    // ASSERTION 2: Leads should match the insights.actions value
    const leadAction = metaAd.insights.data[0].actions.find((a: any) => a.action_type === 'lead');
    const expectedLeads = leadAction ? parseInt(leadAction.value) : 0;
    expect(transformedAd.leads).toBe(expectedLeads);

    console.log('✓ Leads Preservation:', {
      originalLeads: leadAction?.value,
      transformedLeads: transformedAd.leads,
      isPreserved: transformedAd.leads === expectedLeads
    });
  });

  /**
   * Property 2.3: Impressions, Clicks, Reach, CTR Calculation Preservation
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * Verifies that impressions, clicks, reach, and CTR are calculated identically
   * regardless of cost per lead calculation changes.
   * 
   * EXPECTED OUTCOME: PASS on unfixed code
   */
  it('Property 2.3: Impressions, clicks, reach, CTR are calculated identically', () => {
    const metaAd = {
      id: '120212137390125',
      name: 'Test Ad - Metrics Preservation',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137390125',
        name: 'Test Creative',
        title: 'Test Headline',
        body: 'Test body text',
        image_url: 'https://example.com/image.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '100000',
          clicks: '5000',
          inline_link_clicks: '4500',
          reach: '80000',
          spend: '2403.95',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '417' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '2403.95' }
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // Expected values
    const expectedImpressions = parseInt(metaAd.insights.data[0].impressions);
    const expectedInlineLinkClicks = parseInt(metaAd.insights.data[0].inline_link_clicks);
    const expectedReach = parseInt(metaAd.insights.data[0].reach);
    const expectedCtr = parseFloat(((expectedInlineLinkClicks / expectedImpressions) * 100).toFixed(2));

    // ASSERTION 1: Impressions should be extracted correctly
    expect(transformedAd.impressions).toBe(expectedImpressions);

    // ASSERTION 2: Clicks should be extracted correctly (inline_link_clicks preferred)
    expect(transformedAd.clicks).toBe(expectedInlineLinkClicks);

    // ASSERTION 3: Reach should be extracted correctly
    expect(transformedAd.reach).toBe(expectedReach);

    // ASSERTION 4: CTR should be calculated correctly
    expect(transformedAd.ctr).toBe(expectedCtr);

    console.log('✓ Metrics Preservation:', {
      impressions: { original: metaAd.insights.data[0].impressions, transformed: transformedAd.impressions },
      clicks: { original: metaAd.insights.data[0].inline_link_clicks, transformed: transformedAd.clicks },
      reach: { original: metaAd.insights.data[0].reach, transformed: transformedAd.reach },
      ctr: { calculated: expectedCtr, transformed: transformedAd.ctr }
    });
  });

  /**
   * Property 2.4: Creative Data Extraction Preservation
   * 
   * **Validates: Requirements 3.1, 3.3**
   * 
   * Verifies that creative data (headline, body, thumbnail) is extracted identically
   * regardless of cost per lead calculation changes.
   * 
   * EXPECTED OUTCOME: PASS on unfixed code
   */
  it('Property 2.4: Creative data (headline, body, thumbnail) is extracted identically', () => {
    const metaAd = {
      id: '120212137390125',
      name: 'Test Ad - Creative Preservation',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137390125',
        name: 'Test Creative',
        title: 'Test Headline',
        body: 'Test body text',
        image_url: 'https://example.com/image.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '100000',
          clicks: '5000',
          inline_link_clicks: '4500',
          reach: '80000',
          spend: '2403.95',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '417' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '2403.95' }
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // Expected values
    const expectedHeadline = metaAd.creative.title || metaAd.creative.name || 'Sem título';
    const expectedBody = metaAd.creative.body || '';
    const expectedThumbnail = metaAd.creative.image_url || '';

    // ASSERTION 1: Headline should be extracted correctly
    expect(transformedAd.headline).toBe(expectedHeadline);

    // ASSERTION 2: Body should be extracted correctly
    expect(transformedAd.body).toBe(expectedBody);

    // ASSERTION 3: Thumbnail should be extracted correctly
    expect(transformedAd.thumbnail).toBe(expectedThumbnail);

    // ASSERTION 4: CTA text should be extracted correctly
    expect(transformedAd.ctaText).toBe(metaAd.creative.call_to_action_type);

    console.log('✓ Creative Data Preservation:', {
      headline: { original: metaAd.creative.title, transformed: transformedAd.headline },
      body: { original: metaAd.creative.body, transformed: transformedAd.body },
      thumbnail: { original: metaAd.creative.image_url, transformed: transformedAd.thumbnail },
      ctaText: { original: metaAd.creative.call_to_action_type, transformed: transformedAd.ctaText }
    });
  });

  /**
   * Property 2.5: Status and Platform Detection Preservation
   * 
   * **Validates: Requirements 3.1, 3.3**
   * 
   * Verifies that status mapping and platform detection work identically
   * regardless of cost per lead calculation changes.
   * 
   * EXPECTED OUTCOME: PASS on unfixed code
   */
  it('Property 2.5: Status and platform detection work identically', () => {
    const metaAd = {
      id: '120212137390125',
      name: 'Test Ad - Status/Platform Preservation',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137390125',
        name: 'Test Creative',
        title: 'Test Headline',
        body: 'Test body text',
        image_url: 'https://example.com/image.jpg',
        call_to_action_type: 'LEARN_MORE'
      },
      insights: {
        data: [{
          impressions: '100000',
          clicks: '5000',
          inline_link_clicks: '4500',
          reach: '80000',
          spend: '2403.95',
          ctr: '5.0',
          account_currency: 'BRL',
          actions: [
            { action_type: 'lead', value: '417' }
          ],
          cost_per_action_type: [
            { action_type: 'lead', value: '2403.95' }
          ]
        }]
      },
      targeting: {
        publisher_platforms: ['facebook']
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // Expected values
    const expectedStatus = metaAd.effective_status.toLowerCase() === 'active' ? 'active' : 'inactive';
    const expectedPlatform = 'Facebook'; // Default platform in transformMetaAdToAd

    // ASSERTION 1: Status should be mapped correctly
    expect(transformedAd.status).toBe(expectedStatus);

    // ASSERTION 2: Platform should be set correctly
    expect(transformedAd.platform).toBe(expectedPlatform);

    // ASSERTION 3: Status should be one of the valid values
    expect(['active', 'inactive']).toContain(transformedAd.status);

    console.log('✓ Status/Platform Preservation:', {
      status: { original: metaAd.effective_status, transformed: transformedAd.status },
      platform: { transformed: transformedAd.platform }
    });
  });

  /**
   * Property 2.6: Edge Case - Missing Data Handling Preservation
   * 
   * **Validates: Requirements 3.4, 3.5**
   * 
   * Verifies that handling of missing data, zero values, and null fields works identically
   * regardless of cost per lead calculation changes.
   * 
   * EXPECTED OUTCOME: PASS on unfixed code
   */
  it('Property 2.6: Missing data handling works identically', () => {
    const metaAd = {
      id: '120212137999999',
      name: 'Test Ad - Missing Data',
      status: 'ACTIVE',
      effective_status: 'ACTIVE',
      created_time: '2024-01-01T00:00:00Z',
      updated_time: '2024-01-15T00:00:00Z',
      creative: {
        id: '120212137999999',
        name: 'Test Creative'
        // Missing: title, body, image_url, call_to_action_type
      },
      insights: {
        data: [{
          impressions: '0',
          clicks: '0',
          inline_link_clicks: '0',
          reach: '0',
          spend: '0',
          ctr: '0',
          account_currency: 'BRL',
          actions: [], // No actions
          cost_per_action_type: [] // No cost per action type
        }]
      },
      targeting: {
        publisher_platforms: []
      }
    };

    const transformedAd = transformMetaAdToAd(metaAd);

    // ASSERTION 1: Should not crash with missing data
    expect(transformedAd).toBeDefined();

    // ASSERTION 2: Headline should fallback to name
    expect(transformedAd.headline).toBe('Test Creative');

    // ASSERTION 3: Body should be empty string
    expect(transformedAd.body).toBe('');

    // ASSERTION 4: Thumbnail should be empty string
    expect(transformedAd.thumbnail).toBe('');

    // ASSERTION 5: CTA should have default value
    expect(transformedAd.ctaText).toBe('LEARN_MORE');

    // ASSERTION 6: Metrics should be 0
    expect(transformedAd.impressions).toBe(0);
    expect(transformedAd.clicks).toBe(0);
    expect(transformedAd.reach).toBe(0);
    expect(transformedAd.spend).toBe(0);
    expect(transformedAd.leads).toBe(0);

    // ASSERTION 7: CTR should be 0 (no division by zero)
    expect(transformedAd.ctr).toBe(0);

    // ASSERTION 8: Platform should have default value
    expect(transformedAd.platform).toBe('Facebook');

    console.log('✓ Missing Data Handling Preservation:', {
      headline: transformedAd.headline,
      body: transformedAd.body,
      thumbnail: transformedAd.thumbnail,
      metrics: {
        impressions: transformedAd.impressions,
        clicks: transformedAd.clicks,
        leads: transformedAd.leads,
        ctr: transformedAd.ctr
      }
    });
  });
});
