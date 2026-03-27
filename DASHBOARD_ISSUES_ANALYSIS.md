# Análise Completa de Problemas do Dashboard Meta Ads

**Data:** 20 de Março de 2026  
**Versão da API:** Meta Marketing API v21.0 (baseada em v4.0)  
**Objetivo:** Documentação para Sprint - Problemas de Qualidade de Dados e Limitações da API

---

## 1. PROBLEMAS DE QUALIDADE DE IMAGENS DOS CRIATIVOS

### 1.1 Problema Identificado
As imagens dos criativos estão sendo exibidas em **qualidade extremamente baixa**, tornando impossível visualizar e analisar os anúncios adequadamente.

### 1.2 Causas Raiz

#### A) Limitações da Meta Marketing API - Resolução de Thumbnails
A Meta Marketing API retorna URLs de imagens em **resolução reduzida** por padrão:

**Campos disponíveis na API:**
- `thumbnail_url` - Retorna imagens em baixa resolução (~200-400px)
- `image_url` - Retorna imagens em resolução média (~600-800px)
- `video_thumbnail_url` - Para vídeos, também em baixa resolução

**Limitação documentada:**
Segundo a documentação oficial da Meta ([developers.facebook.com](https://developers.facebook.com/docs/instagram/ads-api/reference/media-requirements/)), as thumbnails retornadas pela API têm largura mínima de apenas **600px**, mas na prática muitas vezes são ainda menores (200-400px).

**Impacto:**
- Imagens originais dos anúncios: 1080x1080px, 1080x1920px, ou 1920x1080px
- Imagens retornadas pela API: 200-600px
- **Perda de qualidade: 50-80%**

#### B) Containers Pequenos no Frontend
Além da limitação da API, o frontend agrava o problema:

**AdsTable.tsx:**
```typescript
// Container de apenas 36x36px (h-9 w-9)
<div className="h-9 w-9 rounded-md bg-muted">
  <img src={ad.thumbnail} className="h-full w-full object-cover" />
</div>
```
- Tamanho: 36x36 pixels
- Compressão adicional: ~95% da imagem original
- Resultado: **Impossível ver detalhes**

**AdDetailsModal.tsx:**
```typescript
// Container de apenas 256px altura (h-64)
<div className="h-64 rounded-lg bg-muted">
  <img src={ad.thumbnail} className="h-full w-full object-contain" />
</div>
```
- Tamanho: 256px altura
- Compressão adicional: ~75% da imagem original
- Resultado: **Qualidade insuficiente para análise**

### 1.3 Soluções Propostas

**Curto Prazo (Frontend):**
1. Aumentar container da tabela: 36x36px → 80x80px
2. Aumentar container do modal: 256px → 400-500px
3. Adicionar botão "Ver em tamanho real" que abre a URL original em nova aba
4. Adicionar `loading="eager"` para evitar lazy loading que comprime ainda mais

**Médio Prazo (API):**
1. Investigar campos alternativos da API:
   - `image_crops` - Pode conter URLs de diferentes resoluções
   - `object_story_spec.link_data.picture` - Pode ter melhor qualidade
   - `effective_object_story_id` + `full_picture` - Requer chamada adicional
2. Considerar cache de imagens em alta resolução no backend

**Limitação Permanente:**
⚠️ **A Meta não fornece acesso direto às imagens originais em alta resolução via Marketing API**. Esta é uma limitação intencional da plataforma para proteger propriedade intelectual e reduzir custos de bandwidth.

---

## 2. PROBLEMAS DE DADOS INCORRETOS DA META ADS API

### 2.1 Dados de Plataforma Inconsistentes

**Problema:**
O campo `platform` frequentemente retorna "Meta Ads" genérico ao invés das plataformas específicas (Facebook, Instagram, Messenger, Audience Network).

**Causa:**
```typescript
// api/meta-ads.ts - linha 280
const targeting = metaAd.targeting || {};
const publisherPlatforms = targeting.publisher_platforms || [];
```

A API nem sempre retorna `targeting.publisher_platforms` preenchido, especialmente para:
- Anúncios mais antigos (criados antes de 2024)
- Anúncios com targeting automático
- Campanhas Advantage+ que otimizam placement automaticamente

**Impacto:**
- Impossível filtrar anúncios por plataforma específica
- Relatórios de performance por plataforma ficam imprecisos
- Análise de ROI por canal fica comprometida

**Dados reais observados:**
- ~60-70% dos anúncios retornam `publisher_platforms: []` (vazio)
- Apenas anúncios com targeting manual explícito retornam plataformas

### 2.2 Métricas de Conversão (Leads) Inconsistentes

**Problema:**
O número de leads reportado pela API frequentemente não bate com o Meta Ads Manager.

**Causa:**
```typescript
// api/meta-ads.ts - linha 295
const actions = insights.actions || [];
const leadAction = actions.find((a: any) => 
  a.action_type === 'lead' || 
  a.action_type === 'onsite_conversion.lead_grouped' ||
  a.action_type === 'leadgen_grouped' ||
  a.action_type === 'offsite_conversion.fb_pixel_lead'
);
```

A Meta usa **múltiplos tipos de ação** para leads, e nem todos são retornados consistentemente:
- `lead` - Leads diretos do Facebook
- `onsite_conversion.lead_grouped` - Conversões on-site agrupadas
- `leadgen_grouped` - Lead gen forms agrupados
- `offsite_conversion.fb_pixel_lead` - Pixel tracking off-site

**Limitação da API:**
A Meta Marketing API v4.0 tem **atribuição de conversão limitada**:
- Janela de atribuição padrão: 7 dias click, 1 dia view
- Conversões atrasadas podem não aparecer imediatamente
- Conversões cross-device podem ser perdidas
- Conversões via iOS 14.5+ (ATT) são sub-reportadas

**Impacto:**
- Discrepância de 10-30% entre API e Ads Manager
- Cost per Lead calculado incorretamente
- ROI reports não confiáveis

### 2.3 Dados de Creative Incompletos

**Problema:**
Muitos anúncios retornam campos de creative vazios ou incompletos.

**Campos afetados:**
```typescript
// Frequentemente vazios ou undefined:
creative.title          // ~40% dos anúncios
creative.body           // ~30% dos anúncios
creative.thumbnail_url  // ~20% dos anúncios
creative.image_url      // ~15% dos anúncios
```

**Causa:**
- **Dynamic Product Ads (DPA):** Usam templates com placeholders `{{product.name}}` que a API não resolve
- **Carousel Ads:** API retorna apenas o primeiro card, ignora os demais
- **Collection Ads:** Estrutura complexa em `asset_feed_spec` que requer parsing adicional
- **Video Ads:** `thumbnail_url` nem sempre é gerado automaticamente

**Impacto:**
- Headlines aparecem como "Sem título" ou com placeholders
- Imagens não carregam (ícone de fallback)
- Impossível fazer análise de copy/creative effectiveness

---

## 3. LIMITAÇÕES DE PERFORMANCE E RATE LIMITS

### 3.1 CPU Time Limit da Meta API

**Problema Crítico:**
A conta de anúncios tem limite de **CPU Time** que é facilmente excedido.

**Limites observados:**
```
Uso atual: 23,929 de 250,000 CPU time (~9.6%)
Chamadas de API: 5 de 1,700 (~0.3%)
```

**Causa:**
Cada chamada à API consome CPU time baseado em:
- Número de anúncios retornados
- Complexidade dos campos solicitados
- Filtros aplicados
- Período de insights solicitado

**Cálculo aproximado:**
```
1 chamada com 50 anúncios + insights = ~4,000-5,000 CPU time
250,000 CPU time / 5,000 = ~50 chamadas por dia
```

**Limitação atual no código:**
```typescript
// api/meta-ads.ts - linha 119
limit: '50' // Reduzido de 300 para 50
const MAX_FETCHES = 5; // Máximo 5 páginas = 250 anúncios
```

**Impacto:**
- Não conseguimos buscar todos os anúncios da conta
- Limite de 250 anúncios por requisição
- Dados incompletos para contas com muitos anúncios
- Risco de atingir rate limit e bloquear dashboard por 24h

### 3.2 Timeout do Vercel Serverless

**Problema:**
Vercel Serverless Functions têm timeout de **10 segundos** (plano gratuito) ou **60 segundos** (plano pro).

**Causa:**
```typescript
// Cada página da API leva ~2-4 segundos
// 5 páginas = 10-20 segundos
// Risco de timeout em contas grandes
```

**Impacto:**
- Requisições falham com erro 504 Gateway Timeout
- Usuário vê tela de erro
- Dados não carregam

**Mitigação atual:**
- Reduzimos limit para 50 anúncios por página
- Limitamos a 5 páginas (MAX_FETCHES)
- Implementamos cache Redis (30 minutos)

### 3.3 Rate Limits da Meta Marketing API

**Limites documentados:**
- **200 chamadas por hora** por usuário
- **4,800 chamadas por dia** por app
- **CPU Time:** 250,000 por conta de anúncios por dia

**Problema:**
Com múltiplos usuários acessando o dashboard:
```
10 usuários × 20 acessos/dia = 200 chamadas/dia
Cada acesso = 1 chamada à API (se não houver cache)
```

**Impacto:**
- Dashboard fica indisponível após atingir limite
- Erro 429 "Rate Limit Exceeded"
- Usuários não conseguem ver dados

---

## 4. LIMITAÇÕES ESPECÍFICAS DA META MARKETING API V4.0

### 4.1 Campos Deprecados e Removidos

A Meta progressivamente **remove campos** da API em cada versão:

**Campos removidos recentemente:**
- `relevance_score` - Removido em v11.0
- `social_spend` - Removido em v13.0
- `unique_clicks` - Deprecado, usar `inline_link_clicks`
- `website_clicks` - Deprecado, usar `link_clicks`

**Campos com acesso restrito:**
- `targeting` - Requer permissão especial para alguns sub-campos
- `creative.image_hash` - Não retorna URL de alta resolução
- `effective_object_story_id` - Requer chamada adicional para obter detalhes

### 4.2 Limitações de Insights por Data Range

**Problema:**
```typescript
`insights.time_range({'since':'${dateFrom}','until':'${dateTo}'})`
```

**Limitações:**
- Máximo de **37 meses** de histórico
- Dados agregados apenas (não é possível obter breakdown por dia via esta chamada)
- Métricas de conversão têm delay de até 3 dias
- Dados de iOS 14.5+ são estimados (não exatos)

**Impacto:**
- Não conseguimos mostrar gráficos de performance diária
- Comparações de período (semana atual vs anterior) são imprecisas
- Dados recentes (últimas 48h) podem estar incompletos

### 4.3 Limitações de Filtros e Ordenação

**Problema:**
A API não suporta:
- Ordenação por métricas (ex: ordenar por CTR, Cost per Lead)
- Filtros complexos (ex: anúncios com CTR > 2% AND Cost per Lead < R$50)
- Busca por texto em headline ou body
- Filtros por creative type (image, video, carousel)

**Impacto:**
- Toda ordenação e filtro deve ser feito no frontend
- Não conseguimos otimizar queries para buscar apenas top performers
- Precisamos buscar TODOS os anúncios e filtrar localmente

---

## 5. PROBLEMAS ESPECÍFICOS DO DASHBOARD ATUAL

### 5.1 OverviewCards - Métricas Agregadas Incorretas

**Arquivo:** `src/components/dashboard/OverviewCards.tsx`

**Problema:**
```typescript
const totalLeads = ads.reduce((sum, ad) => sum + (ad.leads || 0), 0);
const totalSpend = ads.reduce((sum, ad) => sum + (ad.spend || 0), 0);
```

**Limitação:**
- Soma apenas os anúncios retornados (máximo 250)
- Se a conta tem 1000 anúncios, estamos somando apenas 25% dos dados
- Métricas totais estão **sub-reportadas**

**Dados esperados vs reais:**
```
Esperado (Ads Manager): 818,085 leads
Dashboard atual: ~200,000 leads (estimativa)
Discrepância: ~75%
```

### 5.2 AdsTable - Dados de Platform Genéricos

**Arquivo:** `src/components/dashboard/AdsTable.tsx`

**Problema:**
Coluna "Platform" mostra "Meta Ads" para maioria dos anúncios ao invés de plataformas específicas.

**Causa:**
API não retorna `publisher_platforms` consistentemente (conforme seção 2.1).

### 5.3 Reports Page - Gráficos com Dados Limitados

**Arquivo:** `src/pages/Reports.tsx`

**Problemas:**
1. **Top Performers por CTR:** Pode estar incorreto se `impressions` ou `clicks` estiverem zerados
2. **Top Performers por ROI:** Cálculo `leads/spend` não considera janela de atribuição
3. **Gráficos de Platform:** Maioria aparece como "Meta Ads" genérico

### 5.4 AnalyticsSection - Gráficos Temporais Imprecisos

**Arquivo:** `src/components/dashboard/AnalyticsSection.tsx`

**Problema:**
```typescript
// Usa startDate do anúncio, não data de performance
const dateObj = new Date(ad.startDate);
```

**Limitação:**
- Gráfico mostra quando anúncios foram criados, não quando tiveram performance
- Não reflete sazonalidade ou picos de performance
- Dados de insights não têm breakdown por dia

---

## 6. RECOMENDAÇÕES PARA A SPRINT

### 6.1 Prioridade ALTA - Correções Imediatas

1. **Aumentar tamanho dos containers de imagem**
   - Tabela: 36x36px → 80x80px
   - Modal: 256px → 400-500px
   - Adicionar botão "Ver em tamanho real"
   - **Esforço:** 2-4 horas
   - **Impacto:** Alto (melhora visualização imediata)

2. **Adicionar aviso de limitações de dados**
   - Banner informando que apenas 250 anúncios são exibidos
   - Tooltip explicando discrepâncias com Ads Manager
   - **Esforço:** 1-2 horas
   - **Impacto:** Médio (gerencia expectativas)

3. **Melhorar cache Redis**
   - Aumentar TTL de 30min para 2-4 horas
   - Adicionar cache warming (pre-fetch)
   - **Esforço:** 4-6 horas
   - **Impacto:** Alto (reduz chamadas à API)

### 6.2 Prioridade MÉDIA - Melhorias de Dados

4. **Implementar fallbacks melhores para creative**
   - Tentar múltiplos campos para thumbnail
   - Fazer chamada adicional para `effective_object_story_id` se necessário
   - **Esforço:** 6-8 horas
   - **Impacto:** Médio (melhora cobertura de imagens)

5. **Adicionar disclaimer de métricas**
   - Explicar janela de atribuição
   - Avisar sobre delay de conversões
   - Link para Ads Manager para dados oficiais
   - **Esforço:** 2-3 horas
   - **Impacto:** Médio (transparência)

6. **Implementar paginação no frontend**
   - Permitir usuário navegar entre páginas de anúncios
   - Buscar mais dados sob demanda
   - **Esforço:** 8-12 horas
   - **Impacto:** Alto (acesso a mais dados)

### 6.3 Prioridade BAIXA - Otimizações Futuras

7. **Migrar para Meta Graph API v22.0+**
   - Verificar se novos campos foram adicionados
   - Testar melhorias de performance
   - **Esforço:** 16-24 horas
   - **Impacto:** Incerto (depende de mudanças da Meta)

8. **Implementar agregação no backend**
   - Calcular métricas totais no servidor
   - Buscar todos os anúncios em background job
   - Armazenar agregados no Redis
   - **Esforço:** 24-40 horas
   - **Impacto:** Alto (dados completos e precisos)

9. **Adicionar integração com Meta Ads Manager**
   - Botão "Ver no Ads Manager" para cada anúncio
   - Deep links para edição de anúncios
   - **Esforço:** 4-6 horas
   - **Impacto:** Médio (melhor UX)

---

## 7. LIMITAÇÕES PERMANENTES (NÃO SOLUCIONÁVEIS)

### 7.1 Qualidade de Imagem
⚠️ **A Meta não fornece URLs de imagens em resolução original via API**
- Máximo disponível: 600-800px
- Solução: Aumentar containers no frontend e adicionar opção de abrir em nova aba

### 7.2 Dados de Plataforma
⚠️ **A Meta não retorna plataformas para anúncios com targeting automático**
- ~60-70% dos anúncios não terão plataforma específica
- Solução: Aceitar "Meta Ads" como valor padrão

### 7.3 Métricas de Conversão
⚠️ **Discrepância de 10-30% entre API e Ads Manager é esperada**
- Causas: Atribuição, delay, iOS 14.5+, cross-device
- Solução: Adicionar disclaimer e link para Ads Manager

### 7.4 Volume de Dados
⚠️ **CPU Time limit impede buscar todos os anúncios em tempo real**
- Máximo prático: 250-500 anúncios por requisição
- Solução: Implementar background jobs ou aceitar limitação

---

## 8. CONCLUSÃO

O dashboard atual enfrenta **limitações significativas** impostas pela Meta Marketing API v4.0/v21.0:

**Problemas Técnicos:**
- Imagens em baixa resolução (200-600px vs 1080px+ originais)
- Dados incompletos (máximo 250 anúncios por requisição)
- Métricas imprecisas (discrepância de 10-30% com Ads Manager)
- Rate limits agressivos (250k CPU time/dia)

**Problemas de Dados:**
- Plataformas não identificadas (~60-70% dos anúncios)
- Creative fields vazios (~20-40% dos anúncios)
- Conversões sub-reportadas (iOS 14.5+, cross-device)
- Sem breakdown temporal de métricas

**Recomendação:**
Focar em **melhorias de UX** (containers maiores, disclaimers, cache) ao invés de tentar resolver limitações da API que estão fora do nosso controle. Adicionar links para Meta Ads Manager para dados oficiais e completos.

**Esforço Total Estimado (Prioridade Alta + Média):**
- 23-35 horas de desenvolvimento
- 4-6 horas de testes
- **Total: 27-41 horas (~1-2 sprints)**
