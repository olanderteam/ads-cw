# Guia de Publicação do App Meta para Produção

## Sobre o Dashboard

Este é um dashboard externo que exibe dados de anúncios do Meta Ads. O dashboard:
- **NÃO requer login do Facebook** pelos usuários finais
- Acessa os dados da conta de anúncios usando um System User Token (token de servidor)
- Exibe métricas como quantidade de leads, impressões, cliques, gastos, etc. para cada criativo
- É acessado diretamente via URL sem necessidade de autenticação do Facebook

## Contexto do Problema

Se as chamadas de API funcionam no Graph API Explorer mas falham na aplicação com erro `(#200) Ad account owner has NOT granted authorization`, o problema está relacionado ao modo do aplicativo Meta ou às permissões do token.

## Diagnóstico

### Cenário 1: App em Modo de Desenvolvimento

Apps da Meta em modo de desenvolvimento têm limitações:
- Apenas usuários com roles específicos (Admin, Developer, Tester) podem usar o app
- Tokens gerados funcionam apenas para esses usuários
- Chamadas de API de outros contextos falham com erro de autorização

### Cenário 2: Token Gerado para App Diferente

O token usado na aplicação pode ter sido gerado para um app diferente do configurado no dashboard.

## Verificação do Status do App

### Passo 1: Acessar o App Dashboard

1. Acesse: https://developers.facebook.com/apps/
2. Selecione o app que você está usando para o dashboard
3. No menu lateral, clique em "Settings" > "Basic"

### Passo 2: Verificar o Modo do App

Na seção "App Mode", você verá um dos seguintes status:

**Development Mode (Modo de Desenvolvimento)**
- Limitado a usuários com roles específicos
- Tokens funcionam apenas para admins/developers/testers
- Precisa ser publicado para uso em produção

**Live Mode (Modo Ao Vivo)**
- App aprovado pela Meta
- Pode ser usado por qualquer usuário
- Tokens funcionam em produção

## Solução: Publicar o App

Para resolver o problema de autorização, você precisa publicar o app Meta. Isso envolve solicitar permissões específicas e passar pela revisão da Meta.

---

## Respostas para Solicitação de Revisão do Meta

### 1. Ads Management Standard Access

**Como seu aplicativo usa essa permissão ou recurso?**

Nosso aplicativo é um dashboard de análise de anúncios do Meta Ads que permite aos proprietários de contas de anúncios visualizar e monitorar o desempenho de suas campanhas publicitárias em tempo real.

O aplicativo utiliza a permissão Ads Management Standard Access para:

1. **Leitura de Dados de Campanhas**: Acessar informações sobre campanhas ativas e inativas, incluindo nome, status, objetivo e orçamento
2. **Leitura de Conjuntos de Anúncios**: Obter dados sobre ad sets, incluindo segmentação, orçamento e status
3. **Leitura de Anúncios**: Visualizar detalhes dos anúncios individuais, incluindo criativos, textos e imagens
4. **Métricas de Performance**: Acessar insights e métricas de desempenho como impressões, cliques, CTR, gastos e leads gerados

**Endpoints da API utilizados:**
- `GET /{ad-account-id}/campaigns`
- `GET /{ad-account-id}/adsets`
- `GET /{ad-account-id}/ads`
- `GET /{ad-id}/insights`

**Fluxo de uso:**
1. Usuário acessa o dashboard através de URL direta (sem login do Facebook)
2. Sistema usa System User Token para autenticar com a Meta API
3. Dashboard busca dados da conta de anúncios configurada
4. Dados são exibidos em tabelas e gráficos para análise
5. Usuário pode filtrar por status (ativo/inativo) e período de tempo

**Benefício para o usuário:**
- Visualização centralizada de todas as campanhas
- Monitoramento de métricas de leads em tempo real
- Análise de performance sem precisar acessar o Gerenciador de Anúncios do Meta
- Interface simplificada focada em métricas essenciais

---

### 2. pages_read_engagement

**Como seu aplicativo usa essa permissão ou recurso?**

A permissão `pages_read_engagement` é utilizada para acessar métricas de engajamento de anúncios que direcionam para páginas do Facebook.

**Uso específico:**

1. **Métricas de Engajamento de Anúncios**
   - Acessar dados de interações em anúncios vinculados a páginas do Facebook
   - Visualizar curtidas, comentários, compartilhamentos e outras interações
   - Analisar engajamento orgânico gerado pelos anúncios

2. **Análise de Performance Social**
   - Entender como os anúncios geram engajamento na página
   - Medir impacto social das campanhas publicitárias
   - Correlacionar gastos com anúncios e crescimento de engajamento

**Endpoints utilizados:**
- `GET /{ad-id}/insights` com campos de engajamento
- Métricas: post_engagement, page_engagement, post_reactions

**Benefício para o usuário:**
- Visão completa do impacto dos anúncios além de conversões diretas
- Análise de engajamento social gerado pelas campanhas
- Métricas de brand awareness e interação com a audiência

**Importante:** Esta permissão é usada apenas para **leitura** de métricas de engajamento. O aplicativo NÃO publica, modifica ou interage com conteúdo de páginas.

---

### 3. ads_management

**Como seu aplicativo usa essa permissão ou recurso?**

A permissão `ads_management` permite acesso completo de leitura aos dados de campanhas, conjuntos de anúncios e anúncios da conta.

**Uso específico:**

1. **Leitura de Estrutura de Campanhas**
   - Endpoint: `GET /{ad-account-id}/campaigns`
   - Campos: id, name, status, objective, daily_budget, lifetime_budget, created_time, updated_time
   - Permite visualizar hierarquia completa de campanhas

2. **Leitura de Conjuntos de Anúncios**
   - Endpoint: `GET /{ad-account-id}/adsets`
   - Campos: id, name, status, campaign_id, targeting, daily_budget, bid_amount, optimization_goal
   - Exibe configurações de segmentação e otimização

3. **Leitura de Anúncios e Criativos**
   - Endpoint: `GET /{ad-account-id}/ads`
   - Campos: id, name, status, creative, effective_status, tracking_specs
   - Acessa detalhes completos dos anúncios

4. **Histórico e Alterações**
   - Visualizar quando anúncios foram criados, pausados ou modificados
   - Rastrear mudanças de status ao longo do tempo

**Importante:** Apesar do nome "management", o aplicativo usa esta permissão APENAS para **leitura**. Não realizamos nenhuma operação de:
- Criação de campanhas, ad sets ou anúncios
- Modificação de configurações
- Pausar ou ativar anúncios
- Alterar orçamentos ou lances

**Fluxo de uso:**
1. Sistema busca lista completa de campanhas da conta
2. Para cada campanha, busca ad sets associados
3. Para cada ad set, busca anúncios associados
4. Dados são organizados em hierarquia no dashboard
5. Usuário pode navegar pela estrutura completa

---

### 4. ads_read

**Como seu aplicativo usa essa permissão ou recurso?**

A permissão `ads_read` é fundamental para o funcionamento do nosso dashboard, pois permite a leitura de dados de anúncios e suas métricas de performance.

**Uso específico:**

1. **Listagem de Anúncios**
   - Endpoint: `GET /{ad-account-id}/ads`
   - Campos solicitados: id, name, status, creative, effective_status, adset_id, campaign_id
   - Frequência: A cada 5 minutos (cache) ou quando usuário solicita atualização manual

2. **Detalhes de Criativos**
   - Endpoint: `GET /{creative-id}`
   - Campos: image_url, video_id, thumbnail_url, body, title, call_to_action
   - Usado para exibir preview dos anúncios no modal de detalhes

3. **Insights e Métricas**
   - Endpoint: `GET /{ad-id}/insights`
   - Métricas: impressions, clicks, ctr, spend, actions (leads), cost_per_action_type
   - Permite análise de ROI e performance de cada criativo

**Interface do usuário:**

O dashboard exibe:
- Tabela com lista de todos os anúncios (nome, status, métricas)
- Modal de detalhes ao clicar em um anúncio (preview do criativo + métricas completas)
- Filtros por status (ativo/pausado/inativo)
- Filtros por período de tempo (hoje, últimos 7 dias, últimos 30 dias, etc.)
- Indicadores de performance (total de leads, gasto total, CTR médio)

**Frequência de chamadas:**
- Dados são cacheados por 5 minutos
- Usuário pode forçar atualização manual via botão "Refresh"
- Estimativa: 10-20 chamadas por sessão de usuário

---

### 5. business_management

**Como seu aplicativo usa essa permissão ou recurso?**

A permissão `business_management` é utilizada exclusivamente para validação e verificação de acesso à conta de anúncios.

**Uso específico:**

1. **Validação de Token**
   - Endpoint: `GET /debug_token`
   - Verifica se o token é válido e possui as permissões necessárias
   - Executado na primeira requisição (com cache de 1 hora)

2. **Verificação de Acesso à Conta**
   - Endpoint: `GET /me/adaccounts`
   - Lista contas de anúncios acessíveis pelo token
   - Valida se o token tem acesso à conta configurada no sistema

3. **Informações da Conta**
   - Endpoint: `GET /{ad-account-id}`
   - Campos: name, account_status, currency, timezone_name
   - Usado para exibir informações da conta no dashboard e validar que está ativa

**Importante:** Esta permissão é usada apenas para **leitura e validação**. O aplicativo NÃO realiza nenhuma operação de escrita ou modificação em contas de anúncios, campanhas ou configurações de negócio.

**Fluxo de validação:**
1. Na primeira requisição, sistema valida o token
2. Verifica se token tem acesso à conta de anúncios configurada
3. Obtém informações básicas da conta (nome, moeda, timezone)
4. Resultados são cacheados por 1 hora
5. Se validação falhar, sistema retorna erro apropriado

**Health Check:**
- Endpoint `/api/health` disponível para monitoramento
- Retorna status do token e da conta de anúncios
- Usado para detectar problemas de autorização proativamente

---

### 6. Instruções de Teste

**Como testar o aplicativo:**

1. **Acesso ao Dashboard**
   - URL: https://ads-cw.vercel.app
   - Não é necessário login do Facebook (dashboard externo)

2. **Visualização de Anúncios**
   - Ao acessar, você verá uma tabela com lista de anúncios
   - Cada linha mostra: nome do anúncio, status, impressões, cliques, CTR, gasto, leads

3. **Detalhes de um Anúncio**
   - Clique em qualquer linha da tabela
   - Modal abrirá mostrando:
     - Preview do criativo (imagem ou vídeo)
     - Texto do anúncio
     - Métricas detalhadas
     - Período de veiculação

4. **Filtros**
   - Use o filtro de status para ver apenas anúncios ativos ou inativos
   - Use o filtro de data para ver métricas de períodos específicos
   - Clique no botão "Refresh" para atualizar os dados manualmente

5. **Verificação de Permissões**
   - Acesse: https://ads-cw.vercel.app/api/health
   - Verá status do token e informações da conta de anúncios
   - Confirma que todas as validações estão funcionando

**Credenciais de Teste:**
- Não são necessárias credenciais de usuário
- O sistema usa System User Token configurado no backend
- Revisor da Meta pode testar com qualquer conta de anúncios de teste

**Endpoints da API que serão chamados durante o teste:**
- `GET /debug_token` - Validação do token
- `GET /me/adaccounts` - Lista de contas acessíveis
- `GET /{ad-account-id}` - Informações da conta
- `GET /{ad-account-id}/ads` - Lista de anúncios
- `GET /{ad-id}/insights` - Métricas de performance

---

## Vídeo de Demonstração

A Meta requer um vídeo demonstrando o uso do aplicativo. O vídeo deve mostrar:

1. **Abertura do aplicativo** (acesso via URL)
2. **Tela de autorização** (se aplicável - no nosso caso, não há login)
3. **Dashboard principal** com lista de anúncios
4. **Clique em um anúncio** para abrir modal de detalhes
5. **Uso dos filtros** (status e data)
6. **Atualização manual** dos dados (botão Refresh)
7. **Health check endpoint** (opcional, mas recomendado)

**Duração recomendada:** 2-3 minutos

**Formato:** MP4, MOV ou AVI

**Resolução mínima:** 720p

---

## Checklist de Submissão

Antes de submeter para revisão, certifique-se de:

- [ ] App está em modo Development
- [ ] Todas as permissões necessárias estão solicitadas:
  - [ ] Ads Management Standard Access
  - [ ] ads_read
  - [ ] business_management
- [ ] Respostas detalhadas preenchidas para cada permissão
- [ ] Vídeo de demonstração gravado e pronto para upload
- [ ] Screenshots do dashboard preparados
- [ ] URL do aplicativo acessível: https://ads-cw.vercel.app
- [ ] Health check endpoint funcionando: https://ads-cw.vercel.app/api/health
- [ ] System User Token configurado e válido

---

## Após Aprovação

Quando o app for aprovado:

1. **Modo do App mudará para Live**
2. **Gerar novo System User Token** (recomendado)
3. **Atualizar variáveis de ambiente no Vercel:**
   ```
   META_ACCESS_TOKEN=<novo_token>
   META_AD_ACCOUNT_ID=act_648451459117938
   META_APP_ID=<seu_app_id>
   META_APP_SECRET=<seu_app_secret>
   META_API_VERSION=v25.0
   ```
4. **Testar em produção** para confirmar que tudo funciona
5. **Monitorar health check** regularmente

---

## Troubleshooting

### Erro: "#200 Ad account owner has NOT granted authorization"

**Causa:** App ainda está em modo Development

**Solução:** Aguardar aprovação da Meta ou adicionar usuário como Admin/Developer/Tester do app

### Token expirando

**Causa:** Tokens de usuário expiram (System User Tokens não expiram)

**Solução:** Usar System User Token em produção

### Permissões insuficientes

**Causa:** Token não tem todas as permissões necessárias

**Solução:** Regenerar token após app ser aprovado com todas as permissões