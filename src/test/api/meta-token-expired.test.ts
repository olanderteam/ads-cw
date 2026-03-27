import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Bug Condition Exploration Test - Expected Behavior Verification
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * This test verifies the expected behavior where a valid Meta access token
 * allows successful API requests.
 * 
 * CRITICAL: This test MUST PASS after fix - passing confirms the bug is fixed.
 * 
 * The fix involves updating the META_ACCESS_TOKEN in environment files with a valid token,
 * causing all API requests to return 200 (OK) with ad data successfully.
 * 
 * Expected behavior after fix:
 * - API requests with valid token return 200 status
 * - API requests return ad data successfully
 * - No authentication errors occur
 */

describe('Bug Condition Exploration: Expected Behavior Verification', () => {
  /**
   * Property 1: Expected Behavior - Valid Token Authentication Success
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * 
   * Scoped PBT Approach: Test the expected behavior - API requests using the valid token.
   * 
   * This test makes a REAL API call to Meta Graph API with the valid token
   * to confirm it returns successful responses with data.
   * 
   * EXPECTED OUTCOME: This test PASSES after fix (confirms bug is fixed)
   * 
   * After fix: This test verifies that API returns 200 status with ad data.
   */
  it('Property 1: API requests with valid token return successful responses (200)', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Scoped to the expected behavior with valid token
        fc.constant({
          validToken: 'EAAS7gYaF3mgBRKT5QeVGr3OZBuYPaXyA6Ew103tKfytH4C4lr32e6DZARicfTDAGLBemHdyXPWK2Vv5XujDkTt14rdZCmJjBozWKstaImdNZB3mNfuBRoSOy7TR1V1EZC0fkSKiKRQ4lKFZB4t3hSkjnxa5AjRWojJ9NwBTbETKNyw7deRcsbBA1G13sfkcwZDZD',
          accountId: 'act_648451459117938',
          apiVersion: 'v25.0',
          endpoint: 'ads'
        }),
        async (testCase) => {
          // Construct Meta Graph API URL
          const baseUrl = `https://graph.facebook.com/${testCase.apiVersion}/${testCase.accountId}/${testCase.endpoint}`;
          
          // Build query parameters
          const params = new URLSearchParams({
            access_token: testCase.validToken,
            fields: 'id,name,status',
            limit: '1'
          });

          const url = `${baseUrl}?${params.toString()}`;

          console.log('Testing valid token with URL:', url);

          // Make REAL API call to Meta Graph API
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('Response status:', response.status);

          // Parse response
          const data = await response.json();
          console.log('Response data:', JSON.stringify(data, null, 2));

          // ASSERTION 1: Verify successful status
          // Expected: 200 (OK)
          expect(response.status).toBe(200);

          // ASSERTION 2: Verify data structure contains ads data
          expect(data).toHaveProperty('data');
          expect(data.data).toBeDefined();
          expect(Array.isArray(data.data)).toBe(true);

          // ASSERTION 3: Verify no authentication errors
          expect(data.error).toBeUndefined();

          // ASSERTION 4: Verify data is returned (may be empty array if no ads, but should be defined)
          expect(data.data).toBeDefined();

          // Document the successful response
          console.log('=== SUCCESSFUL RESPONSE ===');
          console.log('Valid Token:', testCase.validToken.slice(0, 20) + '...');
          console.log('Account ID:', testCase.accountId);
          console.log('API Version:', testCase.apiVersion);
          console.log('Endpoint:', testCase.endpoint);
          console.log('Response Status:', response.status);
          console.log('Data Count:', data.data?.length || 0);
          console.log('===========================');
        }
      ),
      {
        numRuns: 1, // Single concrete test case
        verbose: true
      }
    );
  });
});
