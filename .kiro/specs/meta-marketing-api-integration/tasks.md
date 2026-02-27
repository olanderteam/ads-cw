# Implementation Plan: Meta Marketing API Integration

## Overview

Este plano de implementação detalha as etapas para migrar a aplicação da API do Scraper Creator para a Meta Marketing API oficial, incluindo validação abrangente de tokens e contas, suporte a múltiplos endpoints, extração de métricas de leads, e monitoramento de saúde da integração. A implementação será incremental, começando pela configuração e validação, seguida pela criação do cliente de API, atualização do proxy endpoint, modificação da interface de dados, atualização dos componentes de UI, e finalmente a remoção do código legado.

## Tasks

- [x] 1. Setup environment and configuration
  - Adicionar variáveis de ambiente para Meta API (META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_API_VERSION)
  - Atualizar arquivo .env.example com as novas variáveis
  - Instalar dependência fast-check para property-based testing: `npm install --save-dev fast-check`
  - _Requirements: 1.1, 7.1_

- [x] 2. Add validation environment variables
  - Adicionar META_APP_ID e META_APP_SECRET ao .env e .env.example
  - Documentar que estas variáveis são usadas para validação de token
  - Atualizar README.md com instruções sobre onde encontrar App ID e App Secret
  - _Requirements: 1A.1, 11.4_

- [ ] 3. Implement token validation functions
  - [x] 3.1 Create token validation utilities in src/lib/meta-token-validator.ts
    - Implementar interface TokenDebugResponse
    - Implementar função validateToken() que chama debug_token endpoint
    - Verificar is_valid, expires_at, type e scopes
    - Implementar cache de validação com TTL de 1 hora
    - Retornar erro 401 se token inválido
    - Retornar erro 403 se scopes insuficientes
    - _Requirements: 1A.1, 1A.2, 1A.3, 1A.4, 1A.5, 1A.6_
  
  - [x] 3.2 Implement token type detection
    - Implementar função isSystemUserToken() que verifica se type === 'SYSTEM'
    - Implementar função getTokenExpirationDays() que calcula dias até expiração
    - Registrar aviso no log se token expira em menos de 7 dias
    - _Requirements: 1A.4, 1B.4_
  
  - [ ]* 3.3 Write property test for token validation
    - Testar que tokens válidos passam validação
    - Testar que tokens inválidos são rejeitados
    - **Validates: Requirements 1A.1, 1A.2, 1A.5**
  
  - [ ]* 3.4 Write unit test for scope validation
    - Testar que tokens sem ads_read ou read_insights são rejeitados
    - _Requirements: 1A.3_

- [x] 4. Implement ad account validation functions
  - [x] 4.1 Create ad account validation utilities in src/lib/meta-account-validator.ts
    - Implementar interface AdAccountInfo
    - Implementar função validateAdAccount() que busca informações da conta
    - Verificar account_status === 1 (ACTIVE)
    - Extrair e retornar currency, timezone_name, name
    - Implementar cache de informações da conta com TTL de 24 horas
    - Retornar erro 403 se conta não está ativa
    - _Requirements: 1C.1, 1C.2, 1C.3, 1C.6_
  
  - [x] 4.2 Implement token access verification
    - Implementar função verifyTokenHasAccountAccess() que lista contas acessíveis
    - Verificar se ad_account_id está na lista de contas
    - Retornar erro 403 se token não tem acesso à conta
    - _Requirements: 1C.4, 1C.5_
  
  - [ ]* 4.3 Write property test for account validation
    - Testar que contas ativas passam validação
    - Testar que contas inativas são rejeitadas
    - **Validates: Requirements 1C.1, 1C.2, 1C.5**
  
  - [ ]* 4.4 Write unit test for account access verification
    - Testar que token sem acesso à conta é rejeitado
    - _Requirements: 1C.4, 1C.5_

- [ ] 5. Implement comprehensive validation on startup
  - [x] 5.1 Create validation orchestrator in src/lib/meta-setup-validator.ts
    - Implementar função validateSetup() que executa todas as validações
    - Chamar validateToken() primeiro
    - Chamar validateAdAccount() em seguida
    - Chamar verifyTokenHasAccountAccess() por último
    - Implementar cache global de validação com TTL de 1 hora
    - Registrar mensagens de sucesso no console
    - _Requirements: 1A.6, 1C.6_
  
  - [ ]* 5.2 Write integration test for complete validation flow
    - Testar fluxo completo de validação
    - Mockar respostas da Meta API
    - **Validates: Requirements 1A.1, 1C.1, 1C.4**

- [x] 6. Checkpoint - Ensure validation functions work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update Ad interface with performance metrics
  - [x] 7.1 Extend Ad interface in src/data/mockAds.ts
    - Adicionar campos opcionais: impressions, clicks, ctr, spend, leads, costPerLead, currency
    - Manter todos os campos existentes para compatibilidade
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 7.2 Write property test for Ad interface compatibility
    - **Property 1: Meta API Response Transformation Completeness**
    - **Validates: Requirements 2.2, 2.5, 5.3**

- [ ] 8. Implement lead metrics extraction
  - [x] 8.1 Create lead metrics extractor in src/lib/meta-lead-extractor.ts
    - Implementar interface AdInsight com campos actions e cost_per_action_type
    - Implementar função extractLeadMetrics() que procura action_type "lead" ou "onsite_conversion.lead_grouped"
    - Priorizar "lead" sobre "onsite_conversion.lead_grouped" quando ambos presentes
    - Extrair número de leads do campo actions
    - Extrair custo por lead do campo cost_per_action_type
    - Calcular custo por lead manualmente (spend / leads) se cost_per_action_type não disponível
    - Retornar zero para leads quando action_type não encontrado
    - _Requirements: 3B.1, 3B.2, 3B.3, 3B.4, 3B.5_
  
  - [ ]* 8.2 Write property test for lead extraction
    - Testar que leads são extraídos corretamente de actions array
    - **Validates: Requirements 3B.1, 3B.4**
  
  - [ ]* 8.3 Write unit test for multiple lead action types
    - Testar priorização de "lead" sobre "onsite_conversion.lead_grouped"
    - _Requirements: 3B.3_
  
  - [ ]* 8.4 Write unit test for manual cost per lead calculation
    - Testar cálculo quando cost_per_action_type não disponível
    - _Requirements: 3B.5_

- [ ] 9. Implement comprehensive endpoint support
  - [x] 9.1 Add endpoint utilities in src/lib/meta-endpoints.ts
    - Implementar função buildCampaignsUrl() com fields: id, name, status, objective, daily_budget, lifetime_budget
    - Implementar função buildAdSetsUrl() com fields: id, name, status, campaign_id, targeting, daily_budget
    - Implementar função buildAdsUrl() com fields: id, name, status, adset_id, campaign_id, creative, effective_status
    - Implementar função buildInsightsUrl() com suporte para level (account, campaign, ad)
    - Implementar função buildDateFilter() que aceita date_preset ou time_range customizado
    - Suportar date_presets: today, yesterday, last_7d, last_30d, last_90d, this_month, last_month
    - _Requirements: 3A.1, 3A.2, 3A.3, 3A.4, 3A.5, 3A.6, 3A.7, 3A.8_
  
  - [ ]* 9.2 Write property test for URL construction
    - Testar que URLs são construídas corretamente com todos os parâmetros
    - **Validates: Requirements 3A.1, 3A.2, 3A.3**
  
  - [ ]* 9.3 Write unit test for date preset support
    - Testar todos os date_presets suportados
    - _Requirements: 3A.7_
  
  - [ ]* 9.4 Write unit test for custom date range
    - Testar time_range com since e until
    - _Requirements: 3A.8_

- [ ] 10. Create Meta API client
  - [x] 10.1 Create src/lib/meta-api-client.ts
    - Implementar interface FetchAdsParams com campos: status, dateFrom, dateTo
    - Implementar interface MetaApiError para tratamento de erros
    - Implementar função fetchAds() que chama /api/meta-ads
    - Implementar função transformMetaAdToAd() para mapear resposta da API para interface Ad
    - Incluir lógica de extração de thumbnail de vídeo (priorizar video_thumbnail_url)
    - Incluir lógica de cálculo de costPerLead (spend / leads)
    - Incluir tratamento de campos ausentes com valores padrão
    - Integrar extractLeadMetrics() para extrair métricas de leads
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 3.2, 3.3, 5.3, 5.4, 3B.1_
  
  - [ ]* 10.2 Write property test for video thumbnail extraction
    - **Property 2: Video Thumbnail Extraction**
    - **Validates: Requirements 2.3**
  
  - [ ]* 10.3 Write property test for metrics extraction
    - **Property 3: Performance Metrics Extraction**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 10.4 Write property test for cost per lead calculation
    - **Property 4: Cost Per Lead Calculation**
    - **Validates: Requirements 3.3**
  
  - [ ]* 10.5 Write unit test for carousel ad transformation
    - Testar que anúncios carousel extraem dados do primeiro card
    - _Requirements: 2.4_
  
  - [ ]* 10.6 Write unit test for missing metrics handling
    - Testar que métricas ausentes recebem valor zero ou "N/A"
    - _Requirements: 3.4, 5.4_

- [ ] 11. Checkpoint - Ensure client and utilities tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Create Meta API proxy endpoint with validation
  - [x] 12.1 Create api/meta-ads.ts
    - Implementar handler para requisições GET
    - Validar parâmetros de query (status, dateFrom, dateTo)
    - Carregar META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_APP_ID, META_APP_SECRET do ambiente
    - Chamar validateSetup() na primeira requisição (com cache)
    - Construir URL do Graph API com fields apropriados usando meta-endpoints utilities
    - Incluir parâmetros de filtro (effective_status, time_range)
    - Fazer requisição autenticada ao Meta Graph API
    - Transformar resposta usando transformMetaAdToAd()
    - Implementar tratamento de erros com códigos apropriados (401, 403, 429, 400, 502)
    - Configurar CORS headers
    - _Requirements: 1.2, 1.3, 1.4, 1A.6, 1C.6, 2.1, 6.4, 7.3, 7.4, 7.5, 8.2_
  
  - [ ]* 12.2 Write property test for authentication header inclusion
    - **Property 11: Authentication Header Inclusion**
    - **Validates: Requirements 1.2**
  
  - [ ]* 12.3 Write property test for request parameter validation
    - **Property 10: Request Parameter Validation**
    - **Validates: Requirements 7.4**
  
  - [ ]* 12.4 Write property test for error type differentiation
    - **Property 12: Error Type Differentiation**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 12.5 Write unit test for invalid token error
    - Testar que token ausente/inválido retorna 401
    - _Requirements: 1.3_
  
  - [ ]* 12.6 Write unit test for malformed request error
    - Testar que requisições malformadas retornam 400
    - _Requirements: 7.5_

- [ ] 13. Create health check endpoint
  - [x] 13.1 Create api/health.ts
    - Implementar handler que valida token e ad account
    - Retornar informações sobre token: valid, type, expiresAt, scopes
    - Retornar informações sobre ad account: name, status, currency, timezone
    - Incluir aviso se token expira em menos de 7 dias
    - Retornar status 200 quando tudo OK, 500 quando há problemas
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 13.2 Write unit test for health check success
    - Testar que health check retorna 200 quando tudo está OK
    - _Requirements: 12.5_
  
  - [ ]* 13.3 Write unit test for health check failure
    - Testar que health check retorna 500 quando há problemas
    - _Requirements: 12.5_
  
  - [ ]* 13.4 Write unit test for token expiration warning
    - Testar que aviso é incluído quando token expira em menos de 7 dias
    - _Requirements: 12.4_

- [ ] 14. Checkpoint - Ensure proxy endpoint and health check tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Update useAds hook
  - [x] 15.1 Modify src/hooks/use-ads.ts
    - Adicionar interface UseAdsOptions com campos: status, dateFrom, dateTo
    - Atualizar useAds para aceitar parâmetros de filtro
    - Atualizar queryKey para incluir options (para cache correto)
    - Substituir chamada de fetchAds do scraper-creators para meta-api-client
    - Manter configuração de cache (staleTime: 5 minutos)
    - _Requirements: 6.1, 6.3, 10.1_
  
  - [ ]* 15.2 Write property test for cache behavior
    - **Property 14: Cache Behavior Within TTL**
    - **Validates: Requirements 10.1, 10.3**

- [ ] 16. Create filter components
  - [x] 16.1 Create status filter component
    - Criar componente com opções: all, active, inactive
    - Integrar com useAds hook passando parâmetro status
    - _Requirements: 6.1, 6.2_
  
  - [x] 16.2 Create date range filter component
    - Criar componente com campos dateFrom e dateTo
    - Integrar com useAds hook passando parâmetros de data
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 16.3 Write property test for status filter correctness
    - **Property 7: Status Filter Correctness**
    - **Validates: Requirements 6.2**
  
  - [ ]* 16.4 Write property test for date range filter parameters
    - **Property 8: Date Range Filter API Parameters**
    - **Validates: Requirements 6.4**
  
  - [ ]* 16.5 Write property test for combined filter application
    - **Property 9: Combined Filter Application**
    - **Validates: Requirements 6.5**

- [ ] 17. Update AdDetailsModal component
  - [x] 17.1 Add MetricsSection component to AdDetailsModal
    - Criar seção que exibe: impressions, clicks, CTR, spend, leads, costPerLead
    - Formatar valores monetários com currency do Ad
    - Exibir "N/A" para métricas undefined ou zero
    - Adicionar período de veiculação (startDate, lastSeen)
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 17.2 Write property test for modal metrics display
    - **Property 6: Modal Metrics Display Completeness**
    - **Validates: Requirements 4.2**
  
  - [ ]* 17.3 Write property test for currency formatting
    - **Property 5: Currency Formatting Consistency**
    - **Validates: Requirements 3.5**
  
  - [ ]* 17.4 Write unit test for modal opening on ad click
    - Testar que clicar em anúncio abre modal com detalhes
    - _Requirements: 4.1_

- [ ] 18. Implement error handling UI
  - [x] 18.1 Create ErrorDisplay component
    - Criar componente que exibe mensagens de erro amigáveis
    - Mapear códigos de erro para mensagens específicas
    - Incluir botão "Try Again" para retry
    - _Requirements: 8.1, 8.3, 8.5_
  
  - [x] 18.2 Add error logging to meta-api-client
    - Adicionar console.error para todos os erros capturados
    - Incluir contexto relevante (parâmetros, status, mensagem)
    - _Requirements: 8.4, 12.6_
  
  - [ ]* 18.3 Write property test for error logging consistency
    - **Property 13: Error Logging Consistency**
    - **Validates: Requirements 8.4**
  
  - [ ]* 18.4 Write unit test for expired token error message
    - Testar que erro 401 exibe mensagem de token expirado
    - _Requirements: 8.3_

- [ ] 19. Checkpoint - Ensure UI components work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Add loading and refresh functionality
  - [x] 20.1 Add loading indicator to AdsTable
    - Usar isLoading do useAds hook
    - Exibir spinner durante fetch de dados
    - _Requirements: 10.4_
  
  - [x] 20.2 Add manual refresh button
    - Adicionar botão que chama refetch() do TanStack Query
    - Permitir forçar atualização dos dados
    - _Requirements: 10.2_
  
  - [ ]* 20.3 Write unit test for loading indicator
    - Testar que loading indicator aparece durante fetch
    - _Requirements: 10.4_
  
  - [ ]* 20.4 Write unit test for manual refresh
    - Testar que botão refresh dispara nova requisição
    - _Requirements: 10.2_

- [ ] 21. Optimize API requests
  - [ ] 21.1 Implement parallel metrics fetching
    - Modificar proxy endpoint para buscar insights em paralelo quando possível
    - Usar Promise.all() para requisições concorrentes
    - _Requirements: 10.5_
  
  - [ ]* 21.2 Write property test for parallel fetching
    - **Property 15: Parallel Metrics Fetching**
    - **Validates: Requirements 10.5**

- [ ] 22. Integration testing
  - [ ]* 22.1 Write integration test for complete ad fetch flow
    - Testar fluxo completo: frontend → proxy → Meta API → transformação → UI
    - Usar MSW para mockar Meta API
    - _Requirements: 2.1, 3.1, 4.5_
  
  - [ ]* 22.2 Write integration test for filter application
    - Testar que filtros são aplicados corretamente end-to-end
    - _Requirements: 6.2, 6.4, 6.5_
  
  - [ ]* 22.3 Write integration test for error scenarios
    - Testar todos os tipos de erro (401, 403, 429, 400, 502)
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 22.4 Write integration test for validation flow
    - Testar que validação é executada na primeira requisição
    - _Requirements: 1A.6, 1C.6_

- [ ] 23. Checkpoint - Ensure all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 24. Remove Scraper Creator integration
  - [x] 24.1 Delete src/lib/scraper-creators.ts
    - Remover arquivo completamente
    - _Requirements: 9.2_
  
  - [x] 24.2 Delete api/ads.ts
    - Remover proxy endpoint antigo
    - _Requirements: 9.1, 9.3_
  
  - [x] 24.3 Remove Scraper Creator environment variables
    - Remover SCRAPER_CREATORS_API_KEY do .env e .env.example
    - _Requirements: 9.4_
  
  - [ ]* 24.4 Write unit test to verify no direct Meta API calls in frontend
    - Verificar que frontend não faz chamadas diretas à Meta API
    - _Requirements: 7.3_

- [ ] 25. Update documentation
  - [x] 25.1 Update README.md
    - Documentar novas variáveis de ambiente (incluindo APP_ID e APP_SECRET)
    - Adicionar instruções para obter Meta access token
    - Adicionar instruções para gerar system user token
    - Documentar estrutura da nova API
    - Adicionar link para health check endpoint
    - _Requirements: 1.1, 1B.2, 1B.5, 7.1, 11.2, 11.5_
  
  - [x] 25.2 Add API documentation comments
    - Adicionar JSDoc comments em meta-api-client.ts
    - Adicionar JSDoc comments em meta-token-validator.ts
    - Adicionar JSDoc comments em meta-account-validator.ts
    - Adicionar JSDoc comments em meta-lead-extractor.ts
    - Adicionar JSDoc comments em meta-endpoints.ts
    - Documentar interfaces e funções principais
    - _Requirements: 5.3_
  
  - [x] 25.3 Create production deployment guide
    - Documentar processo de geração de system user token
    - Documentar configuração de variáveis de ambiente no Vercel
    - Documentar como usar health check endpoint para monitoramento
    - _Requirements: 11.2, 11.3, 11.5_

- [x] 26. Final checkpoint - Complete testing and verification
  - Run all tests (unit, property, integration)
  - Verify all environment variables are configured
  - Test health check endpoint
  - Test with real Meta account if possible
  - Verify token validation is working
  - Verify ad account validation is working
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end flows
- The migration maintains backward compatibility until final cleanup (task 24)
- All monetary values should be formatted according to the account's currency
- Error messages should be user-friendly and actionable
- The proxy endpoint is the only layer that accesses the Meta access token
- Token and ad account validation should be cached to avoid excessive API calls
- System user tokens are recommended for production deployments
- Health check endpoint provides visibility into integration status
- Lead metrics extraction handles multiple action types with proper prioritization
- Comprehensive endpoint support enables future feature expansion
