# Requirements Document

## Introduction

Este documento descreve os requisitos para um plano de melhorias do projeto **check-in-ads** — um dashboard React + TypeScript que consome a Meta Marketing API via proxy Vercel para monitorar anúncios, métricas de performance (impressões, cliques, leads, CPL) e filtrar por status e período.

As melhorias foram identificadas por análise estática do código e estão organizadas em três fases de prioridade:

- **Fase 1 — Crítico**: Segurança da API e integridade de dados
- **Fase 2 — Importante**: Correções de UI/UX e comportamento incorreto
- **Fase 3 — Qualidade**: Robustez, performance e manutenibilidade

---

## Glossary

- **Dashboard**: A aplicação React principal que exibe os anúncios e métricas.
- **Proxy**: As Vercel Serverless Functions em `api/` que intermediam chamadas à Meta Graph API.
- **Meta Graph API**: A API externa da Meta usada para buscar dados de anúncios.
- **Ad**: Objeto que representa um anúncio com seus metadados e métricas de performance.
- **QueryClient**: Instância do React Query que gerencia cache e estado de requisições assíncronas.
- **ErrorBoundary**: Componente React que captura erros em subárvores e exibe UI de fallback.
- **AnalyticsSection**: Componente que exibe gráficos de atividade e distribuição de anúncios.
- **TopBar**: Componente de cabeçalho com filtros de busca, status, período e indicador de sincronização.
- **AdDetailsModal**: Modal que exibe detalhes completos de um anúncio selecionado.
- **Settings**: Página de configurações da aplicação.
- **CORS**: Cross-Origin Resource Sharing — mecanismo de controle de acesso HTTP.
- **Rate Limiting**: Mecanismo que limita o número de requisições aceitas por período de tempo.
- **transformMetaAdToAd**: Função que converte a resposta bruta da Meta Graph API no tipo `Ad`.

---

## Requirements

---

### Requirement 1: Restringir CORS no Proxy da API

**User Story:** Como operador do sistema, quero que o proxy da API aceite requisições apenas de origens autorizadas, para que dados sensíveis de anúncios não sejam acessíveis por domínios não autorizados.

#### Acceptance Criteria

1. WHEN o Proxy recebe uma requisição HTTP, THE Proxy SHALL verificar o header `Origin` da requisição antes de processar.
2. WHEN o header `Origin` da requisição corresponde a uma origem configurada na lista de origens permitidas, THE Proxy SHALL incluir o header `Access-Control-Allow-Origin` com o valor exato da origem solicitada na resposta.
3. WHEN o header `Origin` da requisição não corresponde a nenhuma origem permitida, THE Proxy SHALL retornar uma resposta HTTP 403 sem processar a requisição.
4. THE Proxy SHALL ler a lista de origens permitidas a partir de uma variável de ambiente `ALLOWED_ORIGINS`, com suporte a múltiplas origens separadas por vírgula.
5. IF a variável de ambiente `ALLOWED_ORIGINS` não estiver configurada, THEN THE Proxy SHALL rejeitar todas as requisições cross-origin com HTTP 403.

---

### Requirement 2: Proteger o Access Token da Meta nos Logs do Servidor

**User Story:** Como operador do sistema, quero que o access token da Meta não apareça em logs de servidor ou URLs registradas, para que credenciais não sejam expostas em sistemas de observabilidade.

#### Acceptance Criteria

1. THE Proxy SHALL transmitir o `access_token` da Meta exclusivamente via header HTTP `Authorization: Bearer <token>` nas chamadas à Meta Graph API, nunca como query parameter na URL.
2. WHEN o Proxy registra a URL da requisição à Meta Graph API em logs, THE Proxy SHALL omitir o valor do parâmetro `access_token` da URL registrada.
3. THE Proxy SHALL remover o parâmetro `access_token` de qualquer URL antes de incluí-la em mensagens de log ou respostas de erro retornadas ao cliente.

---

### Requirement 3: Implementar Rate Limiting no Proxy

**User Story:** Como operador do sistema, quero que o proxy limite o número de requisições por IP por janela de tempo, para que o endpoint não possa ser sobrecarregado por flood de requisições.

#### Acceptance Criteria

1. THE Proxy SHALL rastrear o número de requisições recebidas por endereço IP dentro de uma janela de tempo deslizante de 60 segundos.
2. WHEN um endereço IP excede 30 requisições dentro da janela de 60 segundos, THE Proxy SHALL retornar HTTP 429 com o header `Retry-After` indicando o tempo em segundos até a janela ser resetada.
3. WHEN um endereço IP está dentro do limite permitido, THE Proxy SHALL processar a requisição normalmente e incluir o header `X-RateLimit-Remaining` na resposta com o número de requisições restantes.
4. IF o header `X-Forwarded-For` estiver presente na requisição, THEN THE Proxy SHALL usar o primeiro endereço IP do header para identificação do cliente.

---

### Requirement 4: Corrigir Validação de Token no Endpoint de Health Check

**User Story:** Como operador do sistema, quero que o endpoint de health check valide o token usando o App Secret em vez de auto-validação, para que a verificação de integridade seja segura e confiável.

#### Acceptance Criteria

1. THE Health_Check_Endpoint SHALL validar o `access_token` usando a chamada `debug_token` da Meta Graph API com o `app_access_token` (formado por `APP_ID|APP_SECRET`) como token de inspeção, não o próprio `access_token` como auto-validação.
2. THE Health_Check_Endpoint SHALL ler `META_APP_SECRET` a partir de variável de ambiente para construir o `app_access_token`.
3. IF a variável de ambiente `META_APP_SECRET` não estiver configurada, THEN THE Health_Check_Endpoint SHALL retornar HTTP 500 com mensagem indicando que `META_APP_SECRET` é obrigatório.

---

### Requirement 5: Eliminar Duplicação da Lógica de Transformação de Dados

**User Story:** Como desenvolvedor, quero que a lógica de transformação de dados da Meta API exista em um único lugar, para que manutenções e correções sejam aplicadas consistentemente sem risco de divergência.

#### Acceptance Criteria

1. THE Dashboard SHALL conter uma única implementação canônica da função `transformMetaAdToAd` compartilhada entre o Proxy e o cliente frontend.
2. THE Proxy SHALL utilizar a implementação canônica de `transformMetaAdToAd` para transformar respostas da Meta Graph API.
3. WHEN a função `transformMetaAdToAd` é removida de `src/lib/meta-api-client.ts`, THE Dashboard SHALL continuar compilando sem erros de TypeScript.
4. THE Dashboard SHALL não conter importações ou referências à função `transformMetaAdToAd` duplicada após a consolidação.

---

### Requirement 6: Remover Console.logs de Debug em Produção

**User Story:** Como desenvolvedor, quero que logs de debug sejam removidos do código de produção, para que dados internos não sejam expostos no console do navegador e a performance não seja degradada.

#### Acceptance Criteria

1. THE Dashboard SHALL não conter chamadas `console.log` nos arquivos `src/pages/Index.tsx`, `src/hooks/use-ads.ts`, `src/components/dashboard/OverviewCards.tsx` e `src/components/dashboard/TopBar.tsx` após a limpeza.
2. WHERE o ambiente de execução for desenvolvimento (`import.meta.env.DEV === true`), THE Dashboard SHALL permitir o uso de logs de debug via utilitário centralizado.
3. THE Dashboard SHALL manter chamadas `console.error` para erros reais que precisam ser rastreados em produção.

---

### Requirement 7: Corrigir a Página de Settings para Refletir a Configuração Real

**User Story:** Como usuário do dashboard, quero que a página de Settings mostre informações precisas sobre como a aplicação está configurada, para que eu não seja induzido a acreditar que posso alterar o token de acesso pelo navegador.

#### Acceptance Criteria

1. THE Settings_Page SHALL exibir uma seção informativa explicando que o token de acesso da Meta é configurado via variáveis de ambiente no servidor Vercel, não via interface do usuário.
2. THE Settings_Page SHALL remover o campo de entrada "Scraper Creators API Key" e o botão "Save Key" que salvam dados no localStorage sem efeito funcional.
3. THE Settings_Page SHALL exibir o status atual da integração com a Meta API consumindo o endpoint `/api/health`, incluindo validade do token e dados da conta de anúncios.
4. WHEN o endpoint `/api/health` retorna status `ok`, THE Settings_Page SHALL exibir um indicador visual verde com as informações da conta.
5. WHEN o endpoint `/api/health` retorna um erro, THE Settings_Page SHALL exibir um indicador visual vermelho com a mensagem de erro retornada.

---

### Requirement 8: Substituir Dados Mockados no AnalyticsSection por Dados Reais

**User Story:** Como usuário do dashboard, quero que os gráficos de analytics reflitam os dados reais dos anúncios carregados da API, para que as visualizações sejam úteis e precisas.

#### Acceptance Criteria

1. THE AnalyticsSection SHALL receber os dados de anúncios reais como prop em vez de importar dados de `mockAds.ts`.
2. WHEN os dados de anúncios são fornecidos, THE AnalyticsSection SHALL calcular dinamicamente a distribuição de anúncios por status (ativo/inativo) a partir dos dados recebidos.
3. WHEN os dados de anúncios são fornecidos, THE AnalyticsSection SHALL calcular dinamicamente a série temporal de anúncios agrupando por data de criação (`startDate`) em intervalos semanais.
4. WHEN nenhum dado de anúncio é fornecido ou a lista está vazia, THE AnalyticsSection SHALL exibir um estado vazio com mensagem informativa em vez de gráficos sem dados.
5. THE AnalyticsSection SHALL não importar nem referenciar `adActivityData` ou `adsByStatusData` de `mockAds.ts` após a correção.

---

### Requirement 9: Implementar Timestamp Real de Sincronização no TopBar

**User Story:** Como usuário do dashboard, quero ver quando os dados foram sincronizados pela última vez com a Meta API, para que eu saiba se as informações exibidas estão atualizadas.

#### Acceptance Criteria

1. THE TopBar SHALL exibir o timestamp da última sincronização bem-sucedida com a Meta API em vez do texto estático "Synced 5 min ago".
2. WHEN uma requisição à API é concluída com sucesso, THE Dashboard SHALL atualizar o timestamp de última sincronização para o horário atual.
3. WHEN o timestamp de última sincronização está disponível, THE TopBar SHALL exibir o tempo relativo desde a última sincronização (ex: "Sincronizado há 3 min").
4. WHEN nenhuma sincronização foi realizada na sessão atual, THE TopBar SHALL exibir "Nunca sincronizado" ou estado equivalente.
5. THE TopBar SHALL atualizar o texto de tempo relativo a cada 60 segundos sem necessidade de nova requisição à API.

---

### Requirement 10: Adicionar Filtro de Período nas Páginas ActiveAds e InactiveAds

**User Story:** Como usuário do dashboard, quero filtrar anúncios por período nas páginas de anúncios ativos e inativos, para que eu possa analisar métricas de performance em intervalos de tempo específicos.

#### Acceptance Criteria

1. THE ActiveAds_Page SHALL incluir um seletor de período de datas com o mesmo comportamento do seletor presente na página Index.
2. THE InactiveAds_Page SHALL incluir um seletor de período de datas com o mesmo comportamento do seletor presente na página Index.
3. WHEN o usuário seleciona um período de datas na página ActiveAds, THE ActiveAds_Page SHALL passar os parâmetros `dateFrom` e `dateTo` para o hook `useAds`.
4. WHEN o usuário seleciona um período de datas na página InactiveAds, THE InactiveAds_Page SHALL passar os parâmetros `dateFrom` e `dateTo` para o hook `useAds`.
5. THE ActiveAds_Page e THE InactiveAds_Page SHALL inicializar o filtro de período com os últimos 30 dias como valor padrão, consistente com a página Index.

---

### Requirement 11: Persistir Notas Internas do AdDetailsModal

**User Story:** Como usuário do dashboard, quero que as notas internas que escrevo sobre um anúncio sejam salvas, para que eu possa consultá-las em sessões futuras.

#### Acceptance Criteria

1. WHEN o usuário edita o campo "Internal Notes" no AdDetailsModal e fecha o modal, THE AdDetailsModal SHALL persistir o conteúdo das notas no `localStorage` usando o `id` do anúncio como chave.
2. WHEN o AdDetailsModal é aberto para um anúncio que possui notas salvas no `localStorage`, THE AdDetailsModal SHALL carregar e exibir as notas salvas no campo de texto.
3. WHEN o usuário limpa o campo de notas e fecha o modal, THE AdDetailsModal SHALL remover a entrada correspondente do `localStorage`.
4. THE AdDetailsModal SHALL exibir um indicador visual (ex: ícone ou texto) quando notas estiverem salvas para o anúncio exibido.

---

### Requirement 12: Adicionar Error Boundary Global

**User Story:** Como usuário do dashboard, quero que erros em componentes individuais não derrubem toda a interface, para que eu possa continuar usando outras partes do dashboard mesmo quando um componente falha.

#### Acceptance Criteria

1. THE Dashboard SHALL envolver a árvore de componentes com um ErrorBoundary que captura erros não tratados em componentes React.
2. WHEN um componente filho lança um erro não tratado, THE ErrorBoundary SHALL exibir uma UI de fallback com mensagem de erro amigável e botão para recarregar a página.
3. THE ErrorBoundary SHALL registrar o erro capturado via `console.error` com o stack trace completo.
4. WHEN o usuário clica no botão de recarregar na UI de fallback do ErrorBoundary, THE ErrorBoundary SHALL resetar seu estado de erro e tentar re-renderizar a árvore de componentes.

---

### Requirement 13: Configurar QueryClient com Políticas Globais de Retry e Erro

**User Story:** Como desenvolvedor, quero que o QueryClient tenha configurações globais de retry e tratamento de erro, para que o comportamento de falhas seja consistente em toda a aplicação.

#### Acceptance Criteria

1. THE QueryClient SHALL ser configurado com `retry: 1` como padrão global para todas as queries, permitindo uma nova tentativa em caso de falha transitória.
2. THE QueryClient SHALL ser configurado com `refetchOnWindowFocus: false` como padrão global para evitar refetches desnecessários.
3. WHEN uma query falha após todas as tentativas de retry, THE QueryClient SHALL exibir uma notificação toast ao usuário com a mensagem de erro.
4. THE Dashboard SHALL remover a configuração `retry: 0` local do hook `use-ads.ts` após a configuração global ser estabelecida.

---

### Requirement 14: Implementar Paginação na Tabela de Anúncios

**User Story:** Como usuário do dashboard, quero que a tabela de anúncios seja paginada, para que a interface não trave ao exibir centenas de anúncios simultaneamente.

#### Acceptance Criteria

1. THE AdsTable SHALL exibir no máximo 50 anúncios por página.
2. THE AdsTable SHALL incluir controles de paginação (anterior, próximo, número de página atual e total de páginas) abaixo da tabela.
3. WHEN o usuário navega para uma página diferente, THE AdsTable SHALL exibir o subconjunto correto de anúncios correspondente à página selecionada.
4. WHEN o filtro de busca ou status é alterado, THE AdsTable SHALL resetar para a primeira página automaticamente.
5. THE AdsTable SHALL exibir o total de anúncios filtrados e o intervalo de registros exibidos (ex: "Exibindo 1–50 de 234 anúncios").

---

### Requirement 15: Tornar Campos de Métricas do Tipo Ad Obrigatórios

**User Story:** Como desenvolvedor, quero que os campos de métricas do tipo `Ad` sejam obrigatórios em vez de opcionais, para que o código não precise de verificações defensivas desnecessárias em toda a aplicação.

#### Acceptance Criteria

1. THE Dashboard SHALL definir os campos `impressions`, `clicks`, `reach`, `ctr`, `spend`, `leads`, `costPerLead` e `currency` como obrigatórios (sem `?`) na interface `Ad` em `src/data/mockAds.ts`.
2. WHEN os campos de métricas são tornados obrigatórios, THE Proxy SHALL garantir que todos os campos de métricas sejam sempre preenchidos com valores numéricos padrão (`0` para números, `'BRL'` para currency) quando a Meta API não retornar o campo.
3. WHEN os campos de métricas são tornados obrigatórios, THE Dashboard SHALL remover todas as verificações de nulidade desnecessárias (ex: `ad.leads || 0`, `ad.impressions !== undefined`) nos componentes `OverviewCards`, `AdDetailsModal` e `AdsTable`.
4. THE Dashboard SHALL compilar sem erros de TypeScript após a alteração dos campos para obrigatórios.
