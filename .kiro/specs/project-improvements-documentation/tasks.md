# Implementation Plan: project-improvements-documentation

## Overview

Implementação das 15 melhorias identificadas no projeto **check-in-ads**, organizadas em três fases de prioridade. As tarefas seguem a ordem do design: primeiro a infraestrutura compartilhada da API, depois as correções de segurança, em seguida as melhorias de UI/UX, e por fim as melhorias de qualidade e robustez.

## Tasks

- [x] 1. Criar utilitários compartilhados da API (Fase 1 — base)
  - [x] 1.1 Criar `api/_cors.ts` com função `applyCors`
    - Implementar leitura de `ALLOWED_ORIGINS` do ambiente, split por vírgula e trim
    - Implementar validação do header `Origin` contra a lista de origens permitidas
    - Retornar `false` e responder HTTP 403 quando origem não autorizada ou lista vazia
    - Retornar `true` e setar `Access-Control-Allow-Origin` com valor exato da origem quando autorizada
    - Incluir headers `Vary: Origin`, `Access-Control-Allow-Methods` e `Access-Control-Allow-Headers`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 1.2 Escrever property tests para `applyCors` (P1 e P2)
    - **Property 1: CORS rejeita origens não autorizadas**
    - **Validates: Requirements 1.3, 1.5**
    - **Property 2: CORS aceita origens autorizadas**
    - **Validates: Requirements 1.2**
    - Arquivo: `src/test/api/cors.test.ts`

  - [x] 1.3 Criar `api/_rate-limit.ts` com função `checkRateLimit` e `getClientIp`
    - Implementar store em memória `Map<string, RateLimitEntry>` com janela deslizante de 60s
    - Implementar `checkRateLimit(ip)` retornando `{ allowed, remaining, retryAfter }`
    - Bloquear após 30 requisições na janela, retornando `allowed: false` e `retryAfter` em segundos
    - Implementar `getClientIp` lendo `x-forwarded-for` (primeiro IP) com fallback para `remoteAddress`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 1.4 Escrever property tests para rate limiting (P4 e P5)
    - **Property 4: Rate limiting bloqueia após limite**
    - **Validates: Requirements 3.2**
    - **Property 5: Rate limiting permite requisições dentro do limite**
    - **Validates: Requirements 3.3**
    - Arquivo: `src/test/api/rate-limit.test.ts`

  - [x] 1.5 Criar `api/_transform.ts` com a função canônica `transformMetaAdToAd`
    - Mover a implementação completa de `api/meta-ads.ts` para `api/_transform.ts`
    - Garantir que todos os campos de métricas (`impressions`, `clicks`, `reach`, `ctr`, `spend`, `leads`, `costPerLead`, `currency`) sempre retornem valores não-nulos com defaults `0`/`'BRL'`
    - Exportar a função para uso em `api/meta-ads.ts`
    - _Requirements: 5.1, 5.2, 15.2_

  - [ ]* 1.6 Escrever property test para `transformMetaAdToAd` (P6)
    - **Property 6: transformMetaAdToAd sempre produz campos obrigatórios**
    - **Validates: Requirements 5.1, 15.2**
    - Arquivo: `src/test/api/transform.test.ts`

- [x] 2. Aplicar melhorias de segurança no proxy `api/meta-ads.ts`
  - [x] 2.1 Substituir CORS wildcard por `applyCors` de `api/_cors.ts`
    - Remover `response.setHeader('Access-Control-Allow-Origin', '*')` e headers CORS manuais
    - Chamar `applyCors(request, response)` no início do handler; retornar se `false`
    - Manter tratamento do preflight OPTIONS após a validação CORS
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Integrar rate limiting usando `checkRateLimit` e `getClientIp`
    - Chamar `getClientIp(request)` para obter o IP do cliente
    - Chamar `checkRateLimit(ip)` e retornar HTTP 429 com header `Retry-After` quando `allowed: false`
    - Incluir header `X-RateLimit-Remaining` na resposta quando `allowed: true`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 2.3 Mover `access_token` para header `Authorization: Bearer` e sanitizar logs
    - Remover `access_token` dos `URLSearchParams` da URL construída para a Meta API
    - Adicionar header `Authorization: Bearer ${accessToken}` nas chamadas `fetch` à Meta API
    - Substituir `console.log('Meta API Request URL:', url)` por log com URL sanitizada (token redactado)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 2.4 Escrever property test para sanitização de token em logs (P3)
    - **Property 3: Token nunca aparece em URLs logadas**
    - **Validates: Requirements 2.2, 2.3**
    - Arquivo: `src/test/api/token-sanitization.test.ts`

  - [x] 2.5 Substituir lógica de transformação inline por importação de `api/_transform.ts`
    - Remover o bloco `allAds.map((metaAd) => { ... })` inline do handler
    - Importar e usar `transformMetaAdToAd` de `api/_transform.ts`
    - _Requirements: 5.1, 5.2_

- [x] 3. Corrigir `api/health.ts`
  - [x] 3.1 Aplicar CORS restrito e validação com `app_access_token`
    - Substituir CORS wildcard por `applyCors(request, response)` de `api/_cors.ts`
    - Ler `META_APP_SECRET` do ambiente; retornar HTTP 500 com mensagem se ausente
    - Construir `appAccessToken = \`${appId}|${appSecret}\`` e usar como `access_token` na chamada `debug_token`
    - Remover `access_token` da URL do `accountUrl` e usar header `Authorization: Bearer`
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3_

  - [ ]* 3.2 Escrever unit test para health check sem `META_APP_SECRET` (exemplo)
    - Verificar que retorna HTTP 500 quando `META_APP_SECRET` não está configurado
    - Arquivo: `src/test/api/health.test.ts`

- [x] 4. Checkpoint — Verificar compilação e testes da Fase 1
  - Garantir que `api/_cors.ts`, `api/_rate-limit.ts`, `api/_transform.ts` compilam sem erros TypeScript
  - Garantir que `api/meta-ads.ts` e `api/health.ts` compilam sem erros após as modificações
  - Executar os testes de propriedade criados nas tarefas 1.2, 1.4, 1.6 e 2.4
  - Garantir que todos os testes passam; perguntar ao usuário se surgirem dúvidas

- [x] 5. Criar utilitário de logger e limpar console.logs de debug
  - [x] 5.1 Criar `src/lib/logger.ts` com logger centralizado
    - Implementar `logger.debug` e `logger.info` que só emitem quando `import.meta.env.DEV === true`
    - Implementar `logger.error` que sempre emite via `console.error`
    - _Requirements: 6.2, 6.3_

  - [ ]* 5.2 Escrever property test para `logger.debug` em produção (P12)
    - **Property 12: logger.debug não emite em produção**
    - **Validates: Requirements 6.2**
    - Arquivo: `src/test/lib/logger.test.ts`

  - [x] 5.3 Substituir `console.log` por `logger.debug/info` nos arquivos de frontend
    - Em `src/pages/Index.tsx`: substituir todos os `console.log` por `logger.debug`
    - Em `src/hooks/use-ads.ts`: substituir todos os `console.log` por `logger.debug`
    - Em `src/components/dashboard/TopBar.tsx`: substituir todos os `console.log` por `logger.debug`
    - Manter `console.error` existentes em `use-ads.ts` (erros reais)
    - _Requirements: 6.1, 6.3_

- [x] 6. Tornar campos de métricas do tipo `Ad` obrigatórios
  - [x] 6.1 Atualizar interface `Ad` em `src/data/mockAds.ts`
    - Remover `?` dos campos `impressions`, `clicks`, `reach`, `ctr`, `spend`, `leads`, `costPerLead`, `currency`
    - Atualizar os objetos `mockAds` para incluir valores numéricos em todos os campos de métricas
    - Atualizar `adActivityData` e `adsByStatusData` se necessário (serão removidos em tarefa posterior)
    - _Requirements: 15.1_

  - [x] 6.2 Remover verificações defensivas desnecessárias nos componentes
    - Em `src/components/dashboard/AdsTable.tsx`: remover `ad.impressions !== undefined`, `ad.reach !== undefined`, etc.
    - Em `src/components/dashboard/AdDetailsModal.tsx`: remover verificações `!== undefined` nos campos de métricas
    - Em `src/components/dashboard/OverviewCards.tsx`: remover `|| 0` e verificações de nulidade nos campos de métricas
    - _Requirements: 15.3, 15.4_

- [x] 7. Remover função `transformMetaAdToAd` duplicada do frontend
  - [x] 7.1 Remover `transformMetaAdToAd` de `src/lib/meta-api-client.ts`
    - Deletar a função `transformMetaAdToAd` exportada de `src/lib/meta-api-client.ts`
    - Verificar que não há importações de `transformMetaAdToAd` em nenhum arquivo frontend
    - Confirmar que `src/hooks/use-ads.ts` não importa nem usa `transformMetaAdToAd`
    - _Requirements: 5.3, 5.4_

- [x] 8. Checkpoint — Verificar compilação TypeScript após mudanças de tipo
  - Executar `tsc --noEmit` para confirmar que o projeto compila sem erros após tornar campos obrigatórios
  - Garantir que todos os testes existentes continuam passando
  - Perguntar ao usuário se surgirem dúvidas

- [x] 9. Implementar persistência de notas no `AdDetailsModal`
  - [x] 9.1 Adicionar persistência de notas via `localStorage` no `AdDetailsModal`
    - Definir `NOTES_KEY = (adId: string) => \`ad_notes_\${adId}\``
    - Inicializar estado `notes` lendo do `localStorage` via `useState(() => localStorage.getItem(NOTES_KEY(ad.id)) ?? '')`
    - Criar função `handleClose` que persiste notas não-vazias ou remove a chave se vazia, depois chama `onClose()`
    - Substituir o botão/ação de fechar para usar `handleClose` em vez de `onClose` diretamente
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 9.2 Adicionar indicador visual de notas salvas no `AdDetailsModal`
    - Importar ícone `StickyNote` do `lucide-react`
    - Exibir `<StickyNote>` no header do modal quando `notes.trim().length > 0`
    - _Requirements: 11.4_

  - [ ]* 9.3 Escrever property tests para persistência de notas (P9 e P10)
    - **Property 9: Notas persistem round-trip no localStorage**
    - **Validates: Requirements 11.1, 11.2**
    - **Property 10: Notas vazias são removidas do localStorage**
    - **Validates: Requirements 11.3**
    - Arquivo: `src/test/components/ad-notes.test.ts`

- [x] 10. Substituir dados mockados no `AnalyticsSection` por dados reais
  - [x] 10.1 Refatorar `AnalyticsSection` para receber `ads: Ad[]` como prop
    - Adicionar interface `AnalyticsSectionProps { ads: Ad[] }`
    - Calcular `adsByStatus` com `useMemo` filtrando `ads` por `status === 'active'` e `'inactive'`
    - Calcular `adActivity` com `useMemo` agrupando `ads` por semana usando `startDate`
    - Remover importações de `adActivityData` e `adsByStatusData` de `mockAds.ts`
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 10.2 Adicionar estado vazio no `AnalyticsSection`
    - Quando `ads.length === 0`, renderizar componente de estado vazio com mensagem informativa
    - _Requirements: 8.4_

  - [x] 10.3 Atualizar `Index.tsx` para passar `ads` como prop ao `AnalyticsSection`
    - Substituir `<AnalyticsSection />` por `<AnalyticsSection ads={ads} />`
    - _Requirements: 8.1_

  - [ ]* 10.4 Escrever property test para distribuição por status no `AnalyticsSection` (P11)
    - **Property 11: AnalyticsSection — distribuição por status é consistente**
    - **Validates: Requirements 8.2**
    - Arquivo: `src/test/components/analytics-section.test.ts`

- [x] 11. Implementar timestamp real de sincronização no `TopBar`
  - [x] 11.1 Adicionar prop `lastSyncedAt` ao `TopBar` e calcular tempo relativo
    - Adicionar `lastSyncedAt?: Date | null` à interface `TopBarProps`
    - Implementar `useEffect` com `setInterval` de 60s para atualizar texto relativo
    - Exibir "Nunca sincronizado" quando `lastSyncedAt` é `null` ou `undefined`
    - Exibir "Sincronizado agora" quando diff < 1 min, "Sincronizado há X min" caso contrário
    - _Requirements: 9.1, 9.3, 9.4, 9.5_

  - [x] 11.2 Expor `dataUpdatedAt` do React Query em `useAds` e passar para `TopBar` em `Index.tsx`
    - Retornar `dataUpdatedAt` do `useQuery` no hook `useAds`
    - Em `Index.tsx`, converter `dataUpdatedAt` para `Date` e passar como `lastSyncedAt` ao `TopBar`
    - _Requirements: 9.2_

  - [ ]* 11.3 Escrever unit tests para `TopBar` com timestamp (exemplos)
    - Verificar que exibe "Nunca sincronizado" quando `lastSyncedAt` é null
    - Arquivo: `src/test/components/topbar.test.tsx`

- [x] 12. Adicionar filtro de período nas páginas `ActiveAds` e `InactiveAds`
  - [x] 12.1 Adicionar estado de `dateRange` e `debouncedDateRange` em `ActiveAds.tsx`
    - Replicar o padrão de `Index.tsx`: estado `dateRange` inicializado com últimos 30 dias
    - Implementar `handleDateRangeChange` com debounce de 500ms para `debouncedDateRange`
    - Formatar `dateFrom`/`dateTo` em `YYYY-MM-DD` e passar para `useAds`
    - Passar `dateRange` e `onDateRangeChange` para o componente `TopBar`
    - _Requirements: 10.1, 10.3, 10.5_

  - [x] 12.2 Adicionar estado de `dateRange` e `debouncedDateRange` em `InactiveAds.tsx`
    - Replicar o mesmo padrão aplicado em `ActiveAds.tsx`
    - _Requirements: 10.2, 10.4, 10.5_

- [x] 13. Refatorar página `Settings` para refletir configuração real
  - [x] 13.1 Remover campo "Scraper Creators API Key" e adicionar seção informativa
    - Remover estado `token`, `handleSave`, `handleClear` e o `Card` de "Scraper Creators Configuration"
    - Adicionar `Card` explicando que o token é configurado via variáveis de ambiente no Vercel
    - Listar as variáveis necessárias: `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `META_APP_ID`, `META_APP_SECRET`, `ALLOWED_ORIGINS`
    - _Requirements: 7.1, 7.2_

  - [x] 13.2 Adicionar card de status da integração consumindo `/api/health`
    - Usar `useQuery` para buscar `/api/health` com `staleTime: 5min` e `retry: 1`
    - Exibir indicador verde com dados da conta quando `status === 'ok'`
    - Exibir indicador vermelho com mensagem de erro quando health retorna erro
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ]* 13.3 Escrever unit tests para `Settings` (exemplos)
    - Verificar que exibe indicador verde quando health retorna `status: 'ok'`
    - Verificar que exibe indicador vermelho quando health retorna erro
    - Arquivo: `src/test/components/settings.test.tsx`

- [x] 14. Checkpoint — Verificar Fase 2 completa
  - Garantir que todas as páginas renderizam sem erros
  - Executar os testes de propriedade e unit tests criados nas tarefas 9.3, 10.4, 11.3 e 13.3
  - Garantir que todos os testes passam; perguntar ao usuário se surgirem dúvidas

- [x] 15. Adicionar `ErrorBoundary` global
  - [x] 15.1 Criar `src/components/ErrorBoundary.tsx`
    - Implementar class component com `getDerivedStateFromError` e `componentDidCatch`
    - `componentDidCatch` deve chamar `console.error('[ErrorBoundary]', error, info.componentStack)`
    - Renderizar UI de fallback com mensagem amigável e botão "Tentar novamente"
    - Botão deve chamar `this.setState({ hasError: false, error: null })` para resetar
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 15.2 Envolver `<App />` com `<ErrorBoundary>` em `src/main.tsx`
    - Importar `ErrorBoundary` e envolver `<App />` no `createRoot(...).render(...)`
    - _Requirements: 12.1_

  - [ ]* 15.3 Escrever unit tests para `ErrorBoundary` (exemplos)
    - Verificar que renderiza UI de fallback quando filho lança erro
    - Verificar que reseta ao clicar em "Tentar novamente"
    - Arquivo: `src/test/components/error-boundary.test.tsx`

- [x] 16. Configurar `QueryClient` com políticas globais de retry e erro
  - [x] 16.1 Atualizar `QueryClient` em `src/App.tsx` com configurações globais
    - Importar `QueryCache` de `@tanstack/react-query`
    - Configurar `defaultOptions.queries` com `retry: 1` e `refetchOnWindowFocus: false`
    - Adicionar `queryCache: new QueryCache({ onError: (error) => toast.error(...) })` para notificações globais de erro
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 16.2 Remover configurações locais redundantes de `src/hooks/use-ads.ts`
    - Remover `retry: 0` do `useQuery` em `use-ads.ts`
    - Remover `refetchOnWindowFocus: false` do `useQuery` em `use-ads.ts`
    - _Requirements: 13.4_

- [x] 17. Implementar paginação na `AdsTable`
  - [x] 17.1 Adicionar estado de paginação e lógica de slice em `AdsTable.tsx`
    - Definir `PAGE_SIZE = 50` como constante
    - Adicionar estado `page` inicializado em `1`
    - Adicionar `useEffect` que reseta `page` para `1` quando `ads` muda
    - Calcular `totalPages`, `start`, `pageAds = ads.slice(start, start + PAGE_SIZE)`
    - Renderizar a tabela com `pageAds` em vez de `ads`
    - _Requirements: 14.1, 14.3, 14.4_

  - [x] 17.2 Adicionar controles de paginação e contador de registros abaixo da tabela
    - Renderizar botões "Anterior" e "Próximo" com estado desabilitado nas bordas
    - Exibir "Página X de Y" entre os botões
    - Exibir texto "Exibindo {start+1}–{min(start+PAGE_SIZE, total)} de {total} anúncios"
    - _Requirements: 14.2, 14.5_

  - [ ]* 17.3 Escrever property tests para paginação (P7 e P8)
    - **Property 7: Paginação exibe subconjunto correto**
    - **Validates: Requirements 14.1, 14.3**
    - **Property 8: Paginação reseta ao filtrar**
    - **Validates: Requirements 14.4**
    - Arquivo: `src/test/components/ads-table-pagination.test.ts`

- [x] 18. Final checkpoint — Garantir que tudo está integrado e funcionando
  - Executar `tsc --noEmit` para confirmar compilação TypeScript sem erros
  - Executar todos os testes com `vitest --run` e garantir que passam
  - Verificar que não há importações de `adActivityData` ou `adsByStatusData` em componentes (apenas em `mockAds.ts`)
  - Verificar que não há `console.log` nos arquivos `Index.tsx`, `use-ads.ts` e `TopBar.tsx`
  - Perguntar ao usuário se surgirem dúvidas

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para uma entrega mais rápida
- Cada tarefa referencia os requisitos específicos para rastreabilidade
- Os checkpoints nas tarefas 4, 8, 14 e 18 garantem validação incremental
- Os testes de propriedade usam `fast-check` (já instalado como devDependency)
- Arquivos com prefixo `_` em `api/` não são expostos como endpoints pelo Vercel
- A ordem das tarefas garante que dependências são criadas antes de serem usadas (ex: `_cors.ts` antes de `meta-ads.ts`)
