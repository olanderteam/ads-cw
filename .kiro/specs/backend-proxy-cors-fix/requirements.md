# Requirements Document

## Introduction

This feature implements a backend proxy using Vercel Serverless Functions to solve CORS (Cross-Origin Resource Sharing) issues when the React dashboard fetches ads from the Scraper Creators API. Currently, direct browser-to-API requests are blocked by CORS policy in production. The proxy will act as an intermediary, making server-to-server requests that bypass CORS restrictions while keeping the API key secure.

## Glossary

- **Frontend**: The React + TypeScript + Vite application that displays the ads dashboard
- **Scraper_Creators_API**: The external API at `https://api.scrapecreators.com/v1/facebook/adLibrary/company/ads` that provides Meta ads data
- **Proxy_Function**: The Vercel Serverless Function that forwards requests from the Frontend to Scraper_Creators_API
- **API_Key**: The authentication credential required by Scraper_Creators_API (x-api-key header)
- **React_Query**: The data fetching library (@tanstack/react-query) used by the Frontend
- **Ad_Data**: The JSON response containing Meta ads information from Scraper_Creators_API

## Requirements

### Requirement 1: Proxy Endpoint Creation

**User Story:** As a developer, I want a serverless function endpoint that proxies requests to Scraper Creators API, so that I can bypass CORS restrictions.

#### Acceptance Criteria

1. THE Proxy_Function SHALL be created in the `/api` directory following Vercel serverless function conventions
2. WHEN the Proxy_Function receives a request, THE Proxy_Function SHALL forward it to Scraper_Creators_API with the appropriate headers
3. WHEN Scraper_Creators_API returns a response, THE Proxy_Function SHALL return the same data structure to the Frontend
4. THE Proxy_Function SHALL set appropriate CORS headers to allow requests from the Frontend domain
5. THE Proxy_Function SHALL accept GET requests with query parameters matching the current implementation (pageId, country, active_status)

### Requirement 2: API Key Management

**User Story:** As a developer, I want the API key to be stored securely on the server, so that it is not exposed in the client-side code.

#### Acceptance Criteria

1. THE Proxy_Function SHALL read the API_Key from environment variables as the primary source
2. WHERE an API_Key is provided as a query parameter, THE Proxy_Function SHALL use that key instead of the environment variable
3. IF no API_Key is available from either source, THEN THE Proxy_Function SHALL return an error response with status 401
4. THE Proxy_Function SHALL include the API_Key in the x-api-key header when calling Scraper_Creators_API
5. THE Proxy_Function SHALL not log or expose the API_Key in error messages

### Requirement 3: Error Handling

**User Story:** As a developer, I want comprehensive error handling in the proxy, so that I can debug issues and provide meaningful feedback to users.

#### Acceptance Criteria

1. WHEN Scraper_Creators_API returns an error status, THEN THE Proxy_Function SHALL forward the status code and error message to the Frontend
2. WHEN a network error occurs, THEN THE Proxy_Function SHALL return a 502 Bad Gateway status with a descriptive error message
3. WHEN the request method is not GET, THEN THE Proxy_Function SHALL return a 405 Method Not Allowed status
4. WHEN required query parameters are missing, THEN THE Proxy_Function SHALL return a 400 Bad Request status with details about missing parameters
5. THE Proxy_Function SHALL log errors to the console for debugging purposes without exposing sensitive information

### Requirement 4: Frontend Integration

**User Story:** As a developer, I want to update the frontend to use the proxy endpoint, so that the application works in production without CORS issues.

#### Acceptance Criteria

1. THE Frontend SHALL call the Proxy_Function endpoint instead of directly calling Scraper_Creators_API
2. WHEN constructing the proxy URL, THE Frontend SHALL include all necessary query parameters (pageId, country, active_status)
3. WHERE an API_Key is stored in localStorage, THE Frontend SHALL include it as a query parameter to the Proxy_Function
4. THE Frontend SHALL maintain the same error handling behavior as the current implementation
5. THE Frontend SHALL continue to use React_Query for data fetching with the same configuration (staleTime, retry)

### Requirement 5: Data Structure Compatibility

**User Story:** As a developer, I want the proxy to maintain the same data structure, so that existing frontend code continues to work without modifications.

#### Acceptance Criteria

1. THE Proxy_Function SHALL return Ad_Data in the exact same JSON structure as Scraper_Creators_API
2. THE Frontend SHALL continue to transform the raw API response using the existing adapter logic
3. THE Frontend SHALL continue to map ScraperCreatorAdRaw objects to Ad objects with the same field mappings
4. WHEN Ad_Data contains carousel ads with cards, THE Frontend SHALL use the first card for display as currently implemented
5. THE Frontend SHALL maintain the same fallback behavior for missing fields (title, body, image, etc.)

### Requirement 6: Deployment Compatibility

**User Story:** As a developer, I want the proxy to work seamlessly with Vercel deployment, so that the application functions correctly in production.

#### Acceptance Criteria

1. THE Proxy_Function SHALL be automatically deployed when the application is deployed to Vercel
2. THE Proxy_Function SHALL be accessible at the `/api/ads` endpoint relative to the application domain
3. WHERE environment variables are configured in Vercel, THE Proxy_Function SHALL access them at runtime
4. THE Proxy_Function SHALL execute within Vercel's serverless function timeout limits (10 seconds for Hobby plan)
5. THE Proxy_Function SHALL handle cold starts gracefully without timing out

### Requirement 7: Backward Compatibility

**User Story:** As a developer, I want to maintain backward compatibility with the existing codebase, so that I minimize breaking changes.

#### Acceptance Criteria

1. THE Frontend SHALL keep the existing `fetchAds()` function signature and return type
2. THE Frontend SHALL maintain the same React_Query hook interface (`useAds()`)
3. THE Frontend SHALL preserve the localStorage API key fallback mechanism for development/testing
4. WHERE the Proxy_Function is unavailable, THE Frontend SHALL provide a meaningful error message
5. THE Frontend SHALL continue to support the mock data fallback for development purposes
