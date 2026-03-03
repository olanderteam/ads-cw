import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import handler from '../../../api/meta-ads';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Bug Condition Exploration Tests
 * 
 * **Validates: Requirements R1.1, R1.2, R1.3, R1.4, R2.1, R2.2, R2.3, R3.1, R3.2, R3.3**
 * 
 * These tests explore three bug conditions:
 * 1. Platform is hardcoded as "Facebook" instead of being extracted from API
 * 2. Creative data extraction is incomplete
 * 3. Aggregated metrics may be incorrect
 * 
 * CRITICAL: These tests MUST FAIL on unfixed code - failure confirms the bugs exist.
 */

describe('Bug Condition Exploration: Platform, Creative Data, and Metrics', () => {
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
   * Property 1: Platform Detection
   * 
   * **Validates: Requirements R1.1, R1.2, R1.3, R1.4**
   * 
   * Expected behavior (what the test encodes):
   * - Platform should be extracted from publisher_platforms field
   * - Platform values should be mapped correctly (facebook → Facebook, instagram → Instagram)
   * - Multiple platforms should be joined with ", "
   * - Fallback to "Meta Ads" when platform cannot be determined
   * 
   * EXPECTED OUTCOME: This test FAILS on unfixed code (proves bug exists)
   * The unfixed code hardcodes platform as "Facebook" for all ads.
   */
  it('Property 1: Platform should be extracted from Meta API, not hardcoded as Facebook', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          { platforms: ['instagram'], expected: 'Instagram' },
          { platforms: ['facebook', 'instagram'], expected: 'Facebook, Instagram' },
          { platforms: ['messenger'], expected: 'Messenger' },
          { platforms: ['audience_network'], expected: 'Audience Network' }
        ),
        async (testCase) => {
          // Mock Meta API response with specific publisher_platforms
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: 'ACTIVE',
                effective_status: 'ACTIVE',
                created_time: '2024-02-15T10:00:00Z',
                updated_time: '2024-02-27T10:00:00Z',
                targeting: {
                  publisher_platforms: testCase.platforms
                },
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
                      impressions: '10000',
                      clicks: '500',
                      reach: '8000',
                      spend: '100.00',
                      account_currency: 'BRL',
                      actions: [
                        { action_type: 'lead', value: '50' }
                      ],
                      cost_per_action_type: [
                        { action_type: 'lead', value: '2.00' }
                      ]
                    }
                  ]
                }
              }
            ],
            paging: {}
          };

          // Mock fetch
          mockFetch = vi.fn(async () => ({
            ok: true,
            json: async () => mockMetaResponse
          }));
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {}
          } as unknown as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify platform is extracted correctly
          expect(responseStatus).toBe(200);
          expect(responseData).toBeDefined();
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads.length).toBeGreaterThan(0);

          const ad = responseData.ads[0];
          
          // CRITICAL: This assertion FAILS on unfixed code (expected behavior)
          // Unfixed code hardcodes platform as "Facebook"
          expect(ad.platform).toBe(testCase.expected);
        }
      ),
      {
        numRuns: 4, // Test all platform combinations
        verbose: true
      }
    );
  });

  /**
   * Property 2: Creative Data Completeness
   * 
   * **Validates: Requirements R2.1, R2.2, R2.3**
   * 
   * Expected behavior (what the test encodes):
   * - All available creative fields should be extracted
   * - Fallbacks should work correctly when primary fields are missing
   * - Nested fields (object_story_spec) should be checked
   * 
   * EXPECTED OUTCOME: This test may FAIL on unfixed code if creative extraction is incomplete
   */
  it('Property 2: Creative data should be extracted completely with proper fallbacks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({
          // Test case with nested object_story_spec data
          creative: {
            id: 'creative_123',
            object_story_spec: {
              link_data: {
                name: 'Headline from object_story_spec',
                message: 'Body from object_story_spec',
                picture: 'https://example.com/picture.jpg',
                link: 'https://example.com/destination',
                call_to_action: {
                  type: 'SHOP_NOW'
                }
              }
            }
          },
          expected: {
            headline: 'Headline from object_story_spec',
            body: 'Body from object_story_spec',
            thumbnail: 'https://example.com/picture.jpg',
            destinationUrl: 'https://example.com/destination',
            ctaText: 'SHOP_NOW'
          }
        }),
        async (testCase) => {
          // Mock Meta API response with nested creative data
          const mockMetaResponse = {
            data: [
              {
                id: '123456789',
                name: 'Test Ad',
                status: 'ACTIVE',
                effective_status: 'ACTIVE',
                created_time: '2024-02-15T10:00:00Z',
                updated_time: '2024-02-27T10:00:00Z',
                targeting: {
                  publisher_platforms: ['facebook']
                },
                creative: testCase.creative,
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

          // Mock fetch
          mockFetch = vi.fn(async () => ({
            ok: true,
            json: async () => mockMetaResponse
          }));
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {}
          } as unknown as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify creative data is extracted completely
          expect(responseStatus).toBe(200);
          expect(responseData).toBeDefined();
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads.length).toBeGreaterThan(0);

          const ad = responseData.ads[0];
          
          // CRITICAL: These assertions may FAIL on unfixed code if fallbacks are incomplete
          expect(ad.headline).toBe(testCase.expected.headline);
          expect(ad.body).toBe(testCase.expected.body);
          expect(ad.thumbnail).toBe(testCase.expected.thumbnail);
          expect(ad.destinationUrl).toBe(testCase.expected.destinationUrl);
          expect(ad.ctaText).toBe(testCase.expected.ctaText);
        }
      ),
      {
        numRuns: 1,
        verbose: true
      }
    );
  });

  /**
   * Property 3: Aggregated Metrics Accuracy
   * 
   * **Validates: Requirements R3.1, R3.2, R3.3**
   * 
   * Expected behavior (what the test encodes):
   * - All metrics from all ads should be included in aggregations
   * - Calculations should be correct (sum, average)
   * - Values should match what Meta Ads Manager would show
   * 
   * EXPECTED OUTCOME: This test should PASS on unfixed code (metrics calculation is likely correct)
   * But we include it to ensure no regressions during fix
   */
  it('Property 3: Aggregated metrics should be calculated correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({
          ads: [
            {
              impressions: '10000',
              clicks: '500',
              reach: '8000',
              spend: '100.00',
              leads: '50'
            },
            {
              impressions: '20000',
              clicks: '1000',
              reach: '15000',
              spend: '200.00',
              leads: '100'
            },
            {
              impressions: '5000',
              clicks: '250',
              reach: '4000',
              spend: '50.00',
              leads: '25'
            }
          ],
          expected: {
            totalImpressions: 35000,
            totalClicks: 1750,
            totalReach: 27000,
            totalSpend: 350.00,
            totalLeads: 175
          }
        }),
        async (testCase) => {
          // Mock Meta API response with multiple ads
          const mockMetaResponse = {
            data: testCase.ads.map((adMetrics, index) => ({
              id: `ad_${index}`,
              name: `Test Ad ${index}`,
              status: 'ACTIVE',
              effective_status: 'ACTIVE',
              created_time: '2024-02-15T10:00:00Z',
              updated_time: '2024-02-27T10:00:00Z',
              targeting: {
                publisher_platforms: ['facebook']
              },
              creative: {
                id: `creative_${index}`,
                title: `Headline ${index}`
              },
              insights: {
                data: [
                  {
                    impressions: adMetrics.impressions,
                    clicks: adMetrics.clicks,
                    reach: adMetrics.reach,
                    spend: adMetrics.spend,
                    account_currency: 'BRL',
                    actions: [
                      { action_type: 'lead', value: adMetrics.leads }
                    ],
                    cost_per_action_type: [
                      { action_type: 'lead', value: (parseFloat(adMetrics.spend) / parseInt(adMetrics.leads)).toFixed(2) }
                    ]
                  }
                ]
              }
            })),
            paging: {}
          };

          // Mock fetch
          mockFetch = vi.fn(async () => ({
            ok: true,
            json: async () => mockMetaResponse
          }));
          global.fetch = mockFetch;

          // Create mock request
          const mockRequest = {
            method: 'GET',
            query: {}
          } as unknown as VercelRequest;

          // Call handler
          await handler(mockRequest, mockResponse as VercelResponse);

          // ASSERTION: Verify response structure
          expect(responseStatus).toBe(200);
          expect(responseData).toBeDefined();
          expect(responseData.ads).toBeDefined();
          expect(responseData.ads.length).toBe(3);

          // Calculate aggregated metrics from returned ads
          const totalImpressions = responseData.ads.reduce((sum: number, ad: any) => sum + (ad.impressions || 0), 0);
          const totalClicks = responseData.ads.reduce((sum: number, ad: any) => sum + (ad.clicks || 0), 0);
          const totalReach = responseData.ads.reduce((sum: number, ad: any) => sum + (ad.reach || 0), 0);
          const totalSpend = responseData.ads.reduce((sum: number, ad: any) => sum + (ad.spend || 0), 0);
          const totalLeads = responseData.ads.reduce((sum: number, ad: any) => sum + (ad.leads || 0), 0);

          // ASSERTION: Verify aggregated metrics are correct
          expect(totalImpressions).toBe(testCase.expected.totalImpressions);
          expect(totalClicks).toBe(testCase.expected.totalClicks);
          expect(totalReach).toBe(testCase.expected.totalReach);
          expect(totalSpend).toBeCloseTo(testCase.expected.totalSpend, 2);
          expect(totalLeads).toBe(testCase.expected.totalLeads);
        }
      ),
      {
        numRuns: 1,
        verbose: true
      }
    );
  });

  /**
   * Property 1b: Platform Fallback
   * 
   * **Validates: Requirement R1.4**
   * 
   * Expected behavior:
   * - When publisher_platforms is missing or empty, use "Meta Ads" as fallback
   * 
   * EXPECTED OUTCOME: This test FAILS on unfixed code (uses "Facebook" instead of "Meta Ads")
   */
  it('Property 1b: Platform should fallback to "Meta Ads" when publisher_platforms is missing', async () => {
    // Mock Meta API response WITHOUT publisher_platforms
    const mockMetaResponse = {
      data: [
        {
          id: '123456789',
          name: 'Test Ad',
          status: 'ACTIVE',
          effective_status: 'ACTIVE',
          created_time: '2024-02-15T10:00:00Z',
          updated_time: '2024-02-27T10:00:00Z',
          targeting: {}, // No publisher_platforms
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
                account_currency: 'BRL'
              }
            ]
          }
        }
      ],
      paging: {}
    };

    // Mock fetch
    mockFetch = vi.fn(async () => ({
      ok: true,
      json: async () => mockMetaResponse
    }));
    global.fetch = mockFetch;

    // Create mock request
    const mockRequest = {
      method: 'GET',
      query: {}
    } as unknown as VercelRequest;

    // Call handler
    await handler(mockRequest, mockResponse as VercelResponse);

    // ASSERTION: Verify fallback to "Meta Ads"
    expect(responseStatus).toBe(200);
    expect(responseData.ads[0].platform).toBe('Meta Ads');
  });
});


/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * These tests verify that existing functionality remains unchanged after the fix.
 * They observe behavior on UNFIXED code and capture the expected behavior patterns
 * that must be preserved.
 * 
 * EXPECTED OUTCOME: These tests PASS on unfixed code (confirms baseline behavior to preserve)
 */
describe('Property 4: Preservation - Existing Functionality Unchanged', () => {
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
   * Property 4.1: Status filters work correctly
   * 
   * **Validates: Requirement 3.1**
   * 
   * When status filter is provided, the system should apply the filter correctly.
   */
  it('Property 4.1: Status filters should continue working correctly', async () => {
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
          } as unknown as VercelRequest;

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
        numRuns: 2,
        verbose: true
      }
    );
  });

  /**
   * Property 4.2: Date filters work correctly
   * 
   * **Validates: Requirement 3.2**
   * 
   * When date filters are provided, the system should apply them correctly in insights field.
   */
  it('Property 4.2: Date filters should continue working correctly', async () => {
    const dateFrom = '2024-02-20';
    const dateTo = '2024-02-27';

    // Mock Meta API response
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

    // Create mock request with date filters
    const mockRequest = {
      method: 'GET',
      query: { dateFrom, dateTo }
    } as unknown as VercelRequest;

    // Call handler
    await handler(mockRequest, mockResponse as VercelResponse);

    // ASSERTION: Verify time_range is applied in insights field
    const decodedUrl = decodeURIComponent(calledUrl);
    expect(decodedUrl).toContain(`insights.time_range({'since':'${dateFrom}','until':'${dateTo}'})`);

    // ASSERTION: Verify response is successful
    expect(responseStatus).toBe(200);
    expect(responseData.ads).toBeDefined();
  });

  /**
   * Property 4.3: Pagination works correctly
   * 
   * **Validates: Requirement 3.3**
   * 
   * When API returns multiple pages, the system should fetch all pages.
   */
  it('Property 4.3: Pagination should continue working correctly', async () => {
    let fetchCallCount = 0;
    const adsPerPage = 20;
    const numPages = 3;

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
      const hasNextPage = fetchCallCount < numPages;
      
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
    } as unknown as VercelRequest;

    // Call handler
    await handler(mockRequest, mockResponse as VercelResponse);

    // ASSERTION: Verify all pages were fetched
    expect(fetchCallCount).toBe(numPages);

    // ASSERTION: Verify total ads returned
    expect(responseStatus).toBe(200);
    expect(responseData.ads).toBeDefined();
    expect(responseData.ads.length).toBe(numPages * adsPerPage);
  });

  /**
   * Property 4.4: Derived metrics are calculated correctly
   * 
   * **Validates: Requirement 3.4**
   * 
   * The system should correctly calculate CTR and cost per lead.
   */
  it('Property 4.4: Derived metrics (CTR, cost per lead) should continue being calculated correctly', async () => {
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
          } as unknown as VercelRequest;

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
        numRuns: 10,
        verbose: true
      }
    );
  });
});
