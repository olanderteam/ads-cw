# Implementation Plan: Backend Proxy for CORS Fix

## Overview

This implementation creates a Vercel Serverless Function to proxy requests from the React frontend to the Scraper Creators API, solving CORS issues while maintaining security and backward compatibility. The implementation follows an incremental approach: first creating the proxy function with core functionality, then adding comprehensive error handling, followed by frontend integration, and finally adding tests to validate correctness.

## Tasks

- [x] 1. Set up proxy function infrastructure
  - Create `/api` directory in project root
  - Create `/api/ads.ts` file for the serverless function
  - Install Vercel types: `npm install --save-dev @vercel/node`
  - Set up basic TypeScript configuration for API routes
  - _Requirements: 1.1, 6.1_

- [x] 2. Implement core proxy functionality
  - [x] 2.1 Create request handler with method validation
    - Implement handler function with VercelRequest and VercelResponse types
    - Add GET method validation (return 405 for other methods)
    - _Requirements: 1.1, 3.3_
  
  - [x] 2.2 Implement query parameter extraction and validation
    - Extract pageId, country, active_status from request.query
    - Validate required parameters are present (return 400 if missing)
    - _Requirements: 1.5, 3.4_
  
  - [x] 2.3 Implement API key retrieval logic
    - Check for apiKey in query parameters first
    - Fall back to process.env.SCRAPER_CREATORS_API_KEY
    - Return 401 if no API key is available
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ]* 2.4 Write property test for API key precedence
    - **Property 4: API key precedence**
    - **Validates: Requirements 2.2**
  
  - [x] 2.5 Implement request forwarding to Scraper Creators API
    - Construct URL with query parameters
    - Add x-api-key header with retrieved API key
    - Make fetch request to Scraper Creators API
    - _Requirements: 1.2, 2.4_
  
  - [ ]* 2.6 Write property test for request forwarding
    - **Property 1: Request forwarding with correct headers and parameters**
    - **Validates: Requirements 1.2, 1.5, 2.4**

- [x] 3. Implement response handling and CORS
  - [x] 3.1 Add CORS headers to all responses
    - Set Access-Control-Allow-Origin header
    - Set Access-Control-Allow-Methods header (GET, OPTIONS)
    - Set Access-Control-Allow-Headers header
    - _Requirements: 1.4_
  
  - [x] 3.2 Implement response passthrough
    - Parse JSON response from Scraper Creators API
    - Return the same JSON structure to frontend
    - Maintain response status codes
    - _Requirements: 1.3, 5.1_
  
  - [ ]* 3.3 Write property test for response passthrough
    - **Property 2: Response passthrough without modification**
    - **Validates: Requirements 1.3, 5.1**
  
  - [ ]* 3.4 Write unit test for CORS headers
    - **Property 3: CORS headers presence**
    - **Validates: Requirements 1.4**

- [x] 4. Implement comprehensive error handling
  - [x] 4.1 Add upstream API error handling
    - Check response.ok from Scraper Creators API
    - Forward error status codes to frontend
    - Return 502 for upstream failures with descriptive message
    - _Requirements: 3.1, 3.2_
  
  - [x] 4.2 Add network error handling
    - Wrap fetch in try-catch block
    - Return 502 for network failures
    - Log errors without exposing API key
    - _Requirements: 3.2, 3.5_
  
  - [x] 4.3 Ensure API key confidentiality in errors
    - Review all error messages to ensure API key is not included
    - Sanitize error logs
    - _Requirements: 2.5_
  
  - [ ]* 4.4 Write property test for API key confidentiality
    - **Property 5: API key confidentiality**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.5 Write property test for error status forwarding
    - **Property 6: Error status forwarding**
    - **Validates: Requirements 3.1**
  
  - [ ]* 4.6 Write property test for method validation
    - **Property 7: Method validation**
    - **Validates: Requirements 3.3**
  
  - [ ]* 4.7 Write property test for parameter validation
    - **Property 8: Parameter validation**
    - **Validates: Requirements 3.4**
  
  - [ ]* 4.8 Write unit tests for specific error scenarios
    - Test 401 error when API key is missing
    - Test 405 error for POST/PUT/DELETE requests
    - Test 400 error for missing query parameters
    - Test 502 error for network failures
    - _Requirements: 2.3, 3.2, 3.3, 3.4_

- [ ] 5. Checkpoint - Ensure proxy function tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update frontend to use proxy endpoint
  - [x] 6.1 Modify fetchAds() function in src/lib/scraper-creators.ts
    - Change URL from external API to `/api/ads`
    - Construct query parameters with URLSearchParams
    - Include apiKey as query parameter if available from localStorage
    - Remove x-api-key header (now handled by proxy)
    - Keep all existing data transformation logic unchanged
    - _Requirements: 4.1, 4.2, 4.3, 7.1_
  
  - [ ]* 6.2 Write property test for proxy endpoint usage
    - **Property 9: Proxy endpoint usage**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 6.3 Write unit test for localStorage API key inclusion
    - Test that apiKey query param is added when localStorage has a key
    - Test that request works without apiKey query param
    - _Requirements: 4.3, 7.3_

- [x] 7. Verify data transformation preservation
  - [x] 7.1 Ensure existing adapter logic remains unchanged
    - Verify ScraperCreatorAdRaw to Ad mapping is identical
    - Verify carousel card logic (first card selection) is preserved
    - Verify fallback values for missing fields are unchanged
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 7.1_
  
  - [ ]* 7.2 Write property test for data transformation preservation
    - **Property 10: Data transformation preservation**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

- [x] 8. Verify error handling preservation
  - [x] 8.1 Ensure error handling behavior is unchanged
    - Verify errors are still logged to console
    - Verify errors are re-thrown for React Query
    - Verify React Query configuration is unchanged (staleTime, retry)
    - _Requirements: 4.4, 4.5, 7.2_
  
  - [ ]* 8.2 Write property test for error handling preservation
    - **Property 11: Error handling preservation**
    - **Validates: Requirements 4.4**
  
  - [ ]* 8.3 Write unit test for React Query configuration
    - Verify staleTime is 5 minutes
    - Verify retry is 1
    - _Requirements: 4.5, 7.2_

- [x] 9. Add environment variable configuration
  - [x] 9.1 Create .env.example file
    - Document SCRAPER_CREATORS_API_KEY variable
    - Add instructions for local development
    - _Requirements: 2.1, 6.3_
  
  - [x] 9.2 Update README with deployment instructions
    - Document how to set environment variables in Vercel
    - Document the proxy endpoint usage
    - Document backward compatibility notes
    - _Requirements: 6.3, 7.4_

- [ ] 10. Install property-based testing library
  - Install fast-check: `npm install --save-dev fast-check @types/fast-check`
  - Create test utilities for generating random query parameters
  - Create test utilities for mocking Scraper Creators API responses
  - _Requirements: Testing Strategy_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The proxy function will be automatically deployed when pushing to Vercel
- Environment variables must be configured in Vercel dashboard for production
- Local development can use .env file with SCRAPER_CREATORS_API_KEY
- All existing frontend code (React Query, data transformation) remains unchanged
- The proxy maintains complete backward compatibility with the existing implementation
