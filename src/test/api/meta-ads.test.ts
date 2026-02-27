import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import handler from '../../../api/meta-ads';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
 * 
 * This test explores the bug condition where date filters cause metric mismatches.
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * 
 * The bug occurs because time_range is applied in TWO places:
 * 1. Correctly in insights field: .time_range({'since':'...','until':'...'})
 * 2. Incorrectly as query parameter: ?time_range={"since":"...","until":"..."}
 * 
 * This duplication causes the Meta API to return inconsistent metrics.
 */

describe('Bug Condition Exploration: Date Filter Causes Metric Mismatch', () => {
  let mockFetch: any;
  let mockResponse: Partial<VercelResponse>;
  let responseData: any;
  let responseStatus: number;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    responseData = null;
    responseStatus = 200;

    // Mock response object
    mockResponse = {
      setHeader: vi.fn(),
      status: vi.fn((code: number) => {
        responseStatus = code;
        return mockResponse as VercelResponse;
      }),
      json: vi.fn((data: any) => {
        responseData = data;
        return mockResponse as VercelResponse;
      }),
      end: vi.fn()
    };

    // Setup environment variables
    process.env.META_ACCESS_TOKEN = 'test_token';
    process.env.META_AD_ACCOUNT_ID = 'act_123456';
    process.env.META_API_VERSION = 'v21.0';
  });

  /**
   * Property 1: Fault Condition - Date Filter Causes Metric Mismatch
   * 
   * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.3**
   * 
   * Scoped PBT Approach: Test the concrete failing case from the bug report.
   * 
   * Expected behavior (what the test encodes):
   * - time_range should appear ONLY in insights field
   * - time_range should NOT appear as query parameter
   * - Metrics should match Meta Ads Manager values (tolerance <1%)
   * 
   * EXPECTED OUTCOME: This test FAILS on unfixed code (proves bug exists)
   */
  it('Property 1: Date filter should apply time_range ONLY in insights field, not as query parameter', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Scoped to the concrete failing case from bug report
        fc.constant({
          dateFrom: '2024-02-20',
          dateTo: '2024-02-27',
          expectedImpressions: 1320919,
          expectedClicks: 7421
        }),
        async (testCase) => {
          // Mock Meta API response with expected values from Meta Ads Manager
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: 'ACTIVE',
                effective_status: 'ACTIVE',
                created_time: '2024-02-15T10:00:00Z',
                updated_time: '2024-02-27T10:00:00Z',
                creative: {
                  id: 'creative_123',
                  name: 'Test Creative',
                  title: 'Test Headline',
                  body: 'Test Body',
                  image_url: 'https://example.com/image.jpg'
                },
                insights: {
                  data: [
                    {
                      impressions: testCase.expectedImpressions.toString(),
                      clicks: testCase.expectedClicks.toString(),
                      reach: '500000',
                      spend: '1000.00',
                      account_currency: 'BRL',
                      actions: [
                        { action_type: 'lead', value: '100' }
                      ],
                      cost_per_action_type: [
                        { action_type: 'lead', value: '10.00' }
                      ]
                    }
                  ]
                }
              }
            ],
            paging: {}
          };

          // Track the URL that was called
          let calledUrl = '';

          // Mock fetch
          mockFetch = vi.fn(async (url: string) => {
            calledUrl = url;
            return {
              ok: true,
              json: async () => mockMetaResponse
            };
          });
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {
              dateFrom: testCase.dateFrom,
              dateTo: testCase.dateTo
            }
          } as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION 1: Verify time_range appears in insights field
          // The insights field should contain: .time_range({'since':'2024-02-20','until':'2024-02-27'})
          // Note: URL encoding converts special characters, so we need to decode or check for encoded version
          const decodedUrl = decodeURIComponent(calledUrl);
          expect(decodedUrl).toContain(`insights.time_range({'since':'${testCase.dateFrom}','until':'${testCase.dateTo}'})`);

          // ASSERTION 2: Verify time_range does NOT appear as query parameter
          // BUG: The unfixed code adds time_range as a query parameter, which conflicts with insights field
          // This assertion will FAIL on unfixed code, proving the bug exists
          const urlParams = new URL(calledUrl).searchParams;
          const timeRangeParam = urlParams.get('time_range');
          
          // CRITICAL: This assertion FAILS on unfixed code (expected behavior)
          expect(timeRangeParam).toBeNull();

          // ASSERTION 3: Verify metrics match Meta Ads Manager values (tolerance <1%)
          expect(responseStatus).toBe(200);
          expect(responseData).toBeDefined();
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads.length).toBeGreaterThan(0);

          const ad = responseData.ads[0];
          const impressionsDiff = Math.abs(ad.impressions - testCase.expectedImpressions) / testCase.expectedImpressions;
          const clicksDiff = Math.abs(ad.clicks - testCase.expectedClicks) / testCase.expectedClicks;

          // Metrics should match within 1% tolerance
          expect(impressionsDiff).toBeLessThan(0.01);
          expect(clicksDiff).toBeLessThan(0.01);
        }
      ),
      {
        numRuns: 1, // Single concrete test case
        verbose: true
      }
    );
  });

});

/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * These tests verify that non-date filter behaviors remain unchanged after the fix.
 * They observe behavior on UNFIXED code for non-buggy inputs (requests without dateFrom/dateTo)
 * and capture the expected behavior patterns that must be preserved.
 * 
 * EXPECTED OUTCOME: These tests PASS on unfixed code (confirms baseline behavior to preserve)
 */
describe('Property 2: Preservation - Non-Date Filter Behavior Unchanged', () => {
  let mockFetch: any;
  let mockResponse: Partial<VercelResponse>;
  let responseData: any;
  let responseStatus: number;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    responseData = null;
    responseStatus = 200;

    // Mock response object
    mockResponse = {
      setHeader: vi.fn(),
      status: vi.fn((code: number) => {
        responseStatus = code;
        return mockResponse as VercelResponse;
      }),
      json: vi.fn((data: any) => {
        responseData = data;
        return mockResponse as VercelResponse;
      }),
      end: vi.fn()
    };

    // Setup environment variables
    process.env.META_ACCESS_TOKEN = 'test_token';
    process.env.META_AD_ACCOUNT_ID = 'act_123456';
    process.env.META_API_VERSION = 'v21.0';
  });

  /**
   * Property 2.1: Requests without date filters use date_preset(last_30d)
   * 
   * **Validates: Requirement 3.1**
   * 
   * When no date filters are provided, the system should use date_preset(last_30d)
   * in the insights field as the default behavior.
   */
  it('Property 2.1: Requests without date filters use date_preset(last_30d)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various request scenarios without date filters
        fc.record({
          status: fc.constantFrom('all', 'active', 'inactive', undefined),
          hasStatus: fc.boolean()
        }),
        async (testCase) => {
          // Mock Meta API response
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: 'ACTIVE',
                effective_status: 'ACTIVE',
                created_time: '2024-01-01T10:00:00Z',
                updated_time: '2024-01-15T10:00:00Z',
                creative: {
                  id: 'creative_123',
                  name: 'Test Creative',
                  title: 'Test Headline',
                  body: 'Test Body'
                },
                insights: {
                  data: [
                    {
                      impressions: '10000',
                      clicks: '500',
                      reach: '8000',
                      spend: '100.00',
                      account_currency: 'BRL',
                      actions: [{ action_type: 'lead', value: '50' }],
                      cost_per_action_type: [{ action_type: 'lead', value: '2.00' }]
                    }
                  ]
                }
              }
            ],
            paging: {}
          };

          let calledUrl = '';
          mockFetch = vi.fn(async (url: string) => {
            calledUrl = url;
            return {
              ok: true,
              json: async () => mockMetaResponse
            };
          });
          global.fetch = mockFetch;

          // Create mock request WITHOUT date filters
          const query: any = {};
          if (testCase.hasStatus && testCase.status) {
            query.status = testCase.status;
          }

          const mockRequest = {
            method: 'GET',
            query
          } as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify date_preset(last_30d) is used in insights field
          const decodedUrl = decodeURIComponent(calledUrl);
          expect(decodedUrl).toContain('insights.date_preset(last_30d)');

          // ASSERTION: Verify no time_range in insights field
          expect(decodedUrl).not.toContain('insights.time_range');

          // ASSERTION: Verify response is successful
          expect(responseStatus).toBe(200);
          expect(responseData).toBeDefined();
          expect(responseData.ads).toBeDefined();
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    );
  });

  /**
   * Property 2.2: Status filters work correctly using filtering with effective_status
   * 
   * **Validates: Requirement 3.1**
   * 
   * When status filter is provided (active/inactive), the system should apply
   * the filter using the filtering parameter with effective_status field.
   */
  it('Property 2.2: Status filters work correctly using filtering with effective_status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('active', 'inactive'),
        async (status) => {
          // Mock Meta API response
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: status === 'active' ? 'ACTIVE' : 'PAUSED',
                effective_status: status === 'active' ? 'ACTIVE' : 'PAUSED',
                created_time: '2024-01-01T10:00:00Z',
                updated_time: '2024-01-15T10:00:00Z',
                creative: {
                  id: 'creative_123',
                  name: 'Test Creative',
                  title: 'Test Headline'
                },
                insights: {
                  data: [
                    {
                      impressions: '10000',
                      clicks: '500',
                      reach: '8000',
                      spend: '100.00',
                      account_currency: 'BRL'
                    }
                  ]
                }
              }
            ],
            paging: {}
          };

          let calledUrl = '';
          mockFetch = vi.fn(async (url: string) => {
            calledUrl = url;
            return {
              ok: true,
              json: async () => mockMetaResponse
            };
          });
          global.fetch = mockFetch;

          // Create mock request with status filter
          const mockRequest = {
            method: 'GET',
            query: { status }
          } as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify filtering parameter is present
          const urlParams = new URL(calledUrl).searchParams;
          const filteringParam = urlParams.get('filtering');
          expect(filteringParam).not.toBeNull();

          // ASSERTION: Verify filtering uses effective_status
          const filtering = JSON.parse(filteringParam!);
          expect(filtering).toBeInstanceOf(Array);
          expect(filtering[0]).toHaveProperty('field', 'effective_status');
          expect(filtering[0]).toHaveProperty('operator', 'IN');
          
          const expectedStatus = status === 'active' ? 'ACTIVE' : 'PAUSED';
          expect(filtering[0].value).toContain(expectedStatus);

          // ASSERTION: Verify response contains ads with correct status
          expect(responseStatus).toBe(200);
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads[0].status).toBe(status);
        }
      ),
      {
        numRuns: 5,
        verbose: true
      }
    );
  });

  /**
   * Property 2.3: Pagination fetches all pages up to 500 ads limit
   * 
   * **Validates: Requirement 3.3**
   * 
   * When the API returns multiple pages, the system should fetch all pages
   * until either all ads are retrieved or the 500 ads limit is reached.
   */
  it('Property 2.3: Pagination fetches all pages up to 500 ads limit', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // Number of pages
        fc.integer({ min: 10, max: 50 }), // Ads per page
        async (numPages, adsPerPage) => {
          let fetchCallCount = 0;
          const totalAds = Math.min(numPages * adsPerPage, 500);

          mockFetch = vi.fn(async (url: string) => {
            fetchCallCount++;
            
            // Generate mock ads for this page
            const pageAds = Array.from({ length: adsPerPage }, (_, i) => ({
              id: `ad_${fetchCallCount}_${i}`,
              name: `Test Ad ${fetchCallCount}_${i}`,
              status: 'ACTIVE',
              effective_status: 'ACTIVE',
              created_time: '2024-01-01T10:00:00Z',
              updated_time: '2024-01-15T10:00:00Z',
              creative: {
                id: `creative_${fetchCallCount}_${i}`,
                title: `Headline ${fetchCallCount}_${i}`
              },
              insights: {
                data: [
                  {
                    impressions: '1000',
                    clicks: '50',
                    reach: '800',
                    spend: '10.00',
                    account_currency: 'BRL'
                  }
                ]
              }
            }));

            // Determine if there's a next page
            const hasNextPage = fetchCallCount < numPages && (fetchCallCount * adsPerPage) < 500;
            
            return {
              ok: true,
              json: async () => ({
                data: pageAds,
                paging: hasNextPage ? {
                  next: `https://graph.facebook.com/v21.0/act_123456/ads?page=${fetchCallCount + 1}`
                } : {}
              })
            };
          });
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {}
          } as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify all pages were fetched (up to limit)
          const expectedPages = Math.min(numPages, Math.ceil(500 / adsPerPage));
          expect(fetchCallCount).toBe(expectedPages);

          // ASSERTION: Verify total ads returned (up to 500 limit)
          expect(responseStatus).toBe(200);
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads.length).toBeLessThanOrEqual(500);
          expect(responseData.ads.length).toBe(Math.min(totalAds, 500));
        }
      ),
      {
        numRuns: 5,
        verbose: true
      }
    );
  });

  /**
   * Property 2.4: Lead aggregation from multiple action_types
   * 
   * **Validates: Requirement 3.4**
   * 
   * The system should aggregate leads from multiple action_types:
   * - lead
   * - onsite_conversion.lead_grouped
   * - leadgen_grouped
   * - offsite_conversion.fb_pixel_lead
   */
  it('Property 2.4: Lead aggregation from multiple action_types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'lead',
          'onsite_conversion.lead_grouped',
          'leadgen_grouped',
          'offsite_conversion.fb_pixel_lead'
        ),
        fc.integer({ min: 1, max: 1000 }),
        async (actionType, leadCount) => {
          // Mock Meta API response with specific action_type
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: 'ACTIVE',
                effective_status: 'ACTIVE',
                created_time: '2024-01-01T10:00:00Z',
                updated_time: '2024-01-15T10:00:00Z',
                creative: {
                  id: 'creative_123',
                  title: 'Test Headline'
                },
                insights: {
                  data: [
                    {
                      impressions: '10000',
                      clicks: '500',
                      reach: '8000',
                      spend: '100.00',
                      account_currency: 'BRL',
                      actions: [
                        { action_type: actionType, value: leadCount.toString() }
                      ],
                      cost_per_action_type: [
                        { action_type: actionType, value: (100 / leadCount).toFixed(2) }
                      ]
                    }
                  ]
                }
              }
            ],
            paging: {}
          };

          mockFetch = vi.fn(async () => ({
            ok: true,
            json: async () => mockMetaResponse
          }));
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {}
          } as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify leads are correctly extracted
          expect(responseStatus).toBe(200);
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads[0].leads).toBe(leadCount);

          // ASSERTION: Verify cost per lead is calculated
          const expectedCostPerLead = parseFloat((100 / leadCount).toFixed(2));
          expect(responseData.ads[0].costPerLead).toBe(expectedCostPerLead);
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    );
  });

  /**
   * Property 2.5: Derived metrics calculation (CTR, cost per lead) remains correct
   * 
   * **Validates: Requirement 3.5**
   * 
   * The system should correctly calculate derived metrics:
   * - CTR = (clicks / impressions) * 100
   * - Cost per lead = spend / leads (or from Meta's cost_per_action_type)
   */
  it('Property 2.5: Derived metrics calculation (CTR, cost per lead) remains correct', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1000, max: 100000 }), // impressions
        fc.integer({ min: 10, max: 5000 }), // clicks
        fc.float({ min: 10, max: 1000 }), // spend
        fc.integer({ min: 1, max: 100 }), // leads
        async (impressions, clicks, spend, leads) => {
          // Ensure clicks <= impressions
          const validClicks = Math.min(clicks, impressions);
          
          // Mock Meta API response
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: 'ACTIVE',
                effective_status: 'ACTIVE',
                created_time: '2024-01-01T10:00:00Z',
                updated_time: '2024-01-15T10:00:00Z',
                creative: {
                  id: 'creative_123',
                  title: 'Test Headline'
                },
                insights: {
                  data: [
                    {
                      impressions: impressions.toString(),
                      clicks: validClicks.toString(),
                      reach: Math.floor(impressions * 0.8).toString(),
                      spend: spend.toFixed(2),
                      account_currency: 'BRL',
                      actions: [
                        { action_type: 'lead', value: leads.toString() }
                      ],
                      cost_per_action_type: [
                        { action_type: 'lead', value: (spend / leads).toFixed(2) }
                      ]
                    }
                  ]
                }
              }
            ],
            paging: {}
          };

          mockFetch = vi.fn(async () => ({
            ok: true,
            json: async () => mockMetaResponse
          }));
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {}
          } as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify CTR calculation
          const expectedCTR = parseFloat(((validClicks / impressions) * 100).toFixed(2));
          expect(responseStatus).toBe(200);
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads[0].ctr).toBe(expectedCTR);

          // ASSERTION: Verify cost per lead calculation
          const expectedCostPerLead = parseFloat((spend / leads).toFixed(2));
          expect(responseData.ads[0].costPerLead).toBe(expectedCostPerLead);

          // ASSERTION: Verify other metrics are preserved
          expect(responseData.ads[0].impressions).toBe(impressions);
          expect(responseData.ads[0].clicks).toBe(validClicks);
          expect(responseData.ads[0].spend).toBe(parseFloat(spend.toFixed(2)));
          expect(responseData.ads[0].leads).toBe(leads);
        }
      ),
      {
        numRuns: 20,
        verbose: true
      }
    );
  });
});
