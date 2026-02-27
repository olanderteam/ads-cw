# Meta Ads Data Mismatch Fix - Bugfix Design

## Overview

O bug ocorre quando o usuário filtra dados de anúncios por intervalo de datas, resultando em métricas inconsistentes que não correspondem aos valores do Gerenciador de Anúncios do Meta. A causa raiz é a duplicação do filtro `time_range`: ele é aplicado tanto no campo `insights` (sintaxe correta) quanto como query parameter (sintaxe incorreta), causando conflito na agregação de dados pela API do Meta.

A estratégia de correção é remover o parâmetro `time_range` duplicado da query string, mantendo apenas a aplicação correta no campo `insights` usando a sintaxe `.time_range({'since':'YYYY-MM-DD','until':'YYYY-MM-DD'})`.

## Glossary

- **Bug_Condition (C)**: A condição que dispara o bug - quando filtros de data (dateFrom e dateTo) são fornecidos pelo usuário
- **Property (P)**: O comportamento desejado - métricas devem corresponder exatamente aos valores do Gerenciador de Anúncios do Meta para o período solicitado (tolerância <1%)
- **Preservation**: Comportamentos existentes que devem permanecer inalterados - filtros de status, busca de texto, paginação, agregação de leads de múltiplos action_types, e cálculo de métricas derivadas
- **handler**: A função serverless em `api/meta-ads.ts` que processa requisições GET e busca dados da Meta Graph API
- **insights field**: Campo especial da Meta Graph API que permite filtrar métricas por período usando sintaxe `.time_range()` ou `.date_preset()`
- **time_range parameter**: Parâmetro de query string que NÃO deve ser usado para filtrar insights, apenas para filtrar anúncios por data de criação
- **effective_status**: Propriedade que determina o estado atual do anúncio (ACTIVE, PAUSED, etc.)

## Bug Details

### Fault Condition

O bug manifesta quando o usuário fornece filtros de data (dateFrom e dateTo) na requisição. A função `handler` em `api/meta-ads.ts` está aplicando o filtro `time_range` de duas formas conflitantes: (1) corretamente no campo insights usando `.time_range({'since':'...','until':'...'})`, e (2) incorretamente como query parameter usando `params.append('time_range', ...)`.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type VercelRequest
  OUTPUT: boolean
  
  RETURN input.query.dateFrom IS NOT NULL
         AND input.query.dateTo IS NOT NULL
         AND time_range_applied_in_insights_field(input)
         AND time_range_applied_as_query_parameter(input)
END FUNCTION
```

### Examples

- **Exemplo 1 (período 20-27 fev)**: Usuário filtra por 20-27 fev → Gerenciador Meta mostra 1.320.919 impressões e 7.421 cliques → Dashboard mostra 1.320.889 impressões e 10.669 cliques (divergência de 30 impressões e 3.248 cliques)

- **Exemplo 2 (período customizado)**: Usuário filtra por 01-15 mar → Gerenciador Meta mostra 500.000 impressões → Dashboard mostra 485.000 impressões (divergência de 15.000 impressões ou 3%)

- **Exemplo 3 (período de 1 dia)**: Usuário filtra por 25 fev → Gerenciador Meta mostra 100.000 impressões → Dashboard mostra 95.000 impressões (divergência de 5%)

- **Edge case (sem filtro de data)**: Usuário não fornece filtro de data → Sistema deve usar `date_preset(last_30d)` no campo insights → Métricas devem corresponder aos últimos 30 dias no Gerenciador Meta

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Filtros de status (active/inactive) devem continuar funcionando corretamente usando `filtering` com `effective_status`
- Busca por texto (headline ou adId) deve continuar sendo aplicada localmente no frontend
- Paginação deve continuar buscando todas as páginas até o limite de 500 anúncios
- Agregação de leads de múltiplos action_types (lead, onsite_conversion.lead_grouped, leadgen_grouped, offsite_conversion.fb_pixel_lead) deve continuar funcionando
- Cálculo de métricas derivadas (CTR, cost per lead) deve continuar sendo calculado corretamente
- Transformação de dados do formato Meta para o formato interno (interface Ad) deve continuar funcionando

**Scope:**
Todas as requisições que NÃO envolvem filtros de data (dateFrom e dateTo) devem ser completamente inalteradas por esta correção. Isso inclui:
- Requisições sem filtros (deve usar date_preset(last_30d))
- Requisições apenas com filtro de status
- Requisições com busca de texto no frontend
- Tratamento de erros da API do Meta (401, 403, 429, 502)
- Headers CORS e validação de método HTTP

## Hypothesized Root Cause

Baseado na descrição do bug e análise do código, as causas mais prováveis são:

1. **Duplicação do Filtro time_range**: O código atual aplica `time_range` em dois lugares:
   - Corretamente no campo insights: `.time_range({'since':'${dateFrom}','until':'${dateTo}'})`
   - Incorretamente como query parameter: `params.append('time_range', JSON.stringify({since: dateFrom, until: dateTo}))`
   
   A API do Meta pode estar interpretando esses dois filtros de forma conflitante, resultando em agregação incorreta de dados.

2. **Semântica Incorreta do Parâmetro time_range**: O parâmetro `time_range` na query string é usado para filtrar anúncios por data de criação/modificação, NÃO para filtrar métricas de insights. Isso pode estar causando a API a retornar um conjunto diferente de anúncios do esperado.

3. **Ordem de Precedência**: A API do Meta pode estar dando precedência ao parâmetro de query string sobre o filtro no campo insights, ou vice-versa, causando inconsistência.

4. **Agregação de Múltiplos Períodos**: A duplicação pode estar causando a API a agregar dados de múltiplos períodos ou aplicar o filtro de forma parcial.

## Correctness Properties

Property 1: Fault Condition - Date Filter Accuracy

_For any_ requisição onde filtros de data (dateFrom e dateTo) são fornecidos, a função handler corrigida SHALL aplicar o filtro time_range APENAS no campo insights usando a sintaxe `.time_range({'since':'YYYY-MM-DD','until':'YYYY-MM-DD'})`, e as métricas retornadas (impressões, cliques, leads, gastos) SHALL corresponder aos valores do Gerenciador de Anúncios do Meta para o mesmo período com tolerância de <1%.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Non-Date Filter Behavior

_For any_ requisição que NÃO inclui filtros de data (dateFrom e dateTo ausentes ou nulos), a função handler corrigida SHALL produzir exatamente o mesmo resultado que a função original, preservando filtros de status, paginação, agregação de leads, cálculo de métricas derivadas, e uso de date_preset(last_30d) como padrão.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assumindo que nossa análise de causa raiz está correta:

**File**: `api/meta-ads.ts`

**Function**: `handler` (função serverless default export)

**Specific Changes**:
1. **Remover Parâmetro time_range Duplicado**: Remover as linhas que adicionam `time_range` como query parameter
   - Localizar o bloco: `if (dateFrom && dateTo) { params.append('time_range', ...) }`
   - Deletar completamente este bloco (linhas ~67-72)
   - Manter apenas a aplicação no campo insights

2. **Validar Sintaxe do Campo insights**: Confirmar que a sintaxe do campo insights está correta
   - Verificar que usa `.time_range({'since':'${dateFrom}','until':'${dateTo}'})`
   - Verificar que usa `.date_preset(last_30d)` quando dateFrom/dateTo não são fornecidos

3. **Adicionar Comentário Explicativo**: Adicionar comentário no código explicando por que time_range NÃO deve ser usado como query parameter
   - Comentário deve mencionar que time_range como query parameter filtra anúncios por data de criação, não métricas de insights

4. **Validar Formato de Data**: Adicionar validação básica para garantir que dateFrom e dateTo estão no formato YYYY-MM-DD
   - Validação pode ser simples regex ou verificação de formato
   - Retornar erro 400 se formato for inválido

5. **Logging para Debug**: Adicionar log da URL final construída para facilitar debug futuro
   - Log deve incluir os campos solicitados e parâmetros aplicados
   - Útil para validar que a requisição está correta

## Testing Strategy

### Validation Approach

A estratégia de testes segue uma abordagem de duas fases: primeiro, demonstrar o bug no código não corrigido usando testes exploratórios, depois verificar que a correção funciona corretamente e preserva comportamentos existentes.

### Exploratory Fault Condition Checking

**Goal**: Demonstrar o bug ANTES de implementar a correção. Confirmar ou refutar a análise de causa raiz. Se refutarmos, precisaremos re-hipotizar.

**Test Plan**: Escrever testes que fazem requisições com filtros de data e comparam as métricas retornadas com valores conhecidos do Gerenciador de Anúncios do Meta. Executar esses testes no código NÃO CORRIGIDO para observar falhas e entender a causa raiz.

**Test Cases**:
1. **Teste de Período Específico (20-27 fev)**: Simular requisição com dateFrom=2024-02-20 e dateTo=2024-02-27 (falhará no código não corrigido - esperado: 1.320.919 impressões, atual: 1.320.889)
2. **Teste de Período Customizado (1-15 mar)**: Simular requisição com período de 15 dias (falhará no código não corrigido - divergência esperada de ~3%)
3. **Teste de Período de 1 Dia**: Simular requisição com dateFrom=dateTo (falhará no código não corrigido - divergência esperada de ~5%)
4. **Teste de URL Construída**: Inspecionar a URL final construída para verificar duplicação de time_range (confirmará a causa raiz)

**Expected Counterexamples**:
- Métricas retornadas divergem dos valores do Gerenciador de Anúncios do Meta
- URL construída contém time_range tanto no campo insights quanto como query parameter
- Possíveis causas: duplicação de filtro, semântica incorreta do parâmetro, ordem de precedência

### Fix Checking

**Goal**: Verificar que para todas as requisições onde a condição de bug se aplica (filtros de data fornecidos), a função corrigida produz o comportamento esperado (métricas correspondem ao Gerenciador Meta).

**Pseudocode:**
```
FOR ALL request WHERE isBugCondition(request) DO
  response := handler_fixed(request)
  metaManagerMetrics := getMetricsFromMetaManager(request.dateFrom, request.dateTo)
  ASSERT abs(response.impressions - metaManagerMetrics.impressions) / metaManagerMetrics.impressions < 0.01
  ASSERT abs(response.clicks - metaManagerMetrics.clicks) / metaManagerMetrics.clicks < 0.01
  ASSERT abs(response.leads - metaManagerMetrics.leads) / metaManagerMetrics.leads < 0.01
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todas as requisições onde a condição de bug NÃO se aplica (sem filtros de data), a função corrigida produz o mesmo resultado que a função original.

**Pseudocode:**
```
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT handler_original(request) = handler_fixed(request)
END FOR
```

**Testing Approach**: Testes baseados em propriedades são recomendados para preservation checking porque:
- Geram muitos casos de teste automaticamente através do domínio de entrada
- Capturam edge cases que testes unitários manuais podem perder
- Fornecem garantias fortes de que o comportamento permanece inalterado para todas as entradas não-buggy

**Test Plan**: Observar comportamento no código NÃO CORRIGIDO primeiro para requisições sem filtros de data, depois escrever testes baseados em propriedades capturando esse comportamento.

**Test Cases**:
1. **Preservation de Filtro de Status**: Observar que filtrar por status=active funciona corretamente no código não corrigido, depois verificar que continua funcionando após correção
2. **Preservation de date_preset Padrão**: Observar que requisições sem filtros de data usam last_30d no código não corrigido, depois verificar que continua usando após correção
3. **Preservation de Paginação**: Observar que paginação busca todas as páginas no código não corrigido, depois verificar que continua funcionando após correção
4. **Preservation de Agregação de Leads**: Observar que leads de múltiplos action_types são agregados no código não corrigido, depois verificar que continua funcionando após correção

### Unit Tests

- Testar construção da URL com filtros de data (verificar que time_range aparece apenas no campo insights)
- Testar construção da URL sem filtros de data (verificar que usa date_preset(last_30d))
- Testar validação de formato de data (YYYY-MM-DD)
- Testar edge cases (dateFrom sem dateTo, dateTo sem dateFrom)
- Testar que filtros de status continuam funcionando
- Testar transformação de dados do formato Meta para formato interno

### Property-Based Tests

- Gerar períodos de data aleatórios e verificar que métricas correspondem ao Gerenciador Meta (tolerância <1%)
- Gerar combinações aleatórias de filtros (status + data, apenas status, apenas data) e verificar comportamento correto
- Gerar requisições aleatórias sem filtros de data e verificar que comportamento é preservado (comparar com código original)
- Testar que agregação de leads funciona corretamente para múltiplos action_types em vários cenários

### Integration Tests

- Testar fluxo completo: frontend → meta-api-client → api/meta-ads → Meta Graph API
- Testar que filtros de data no frontend resultam em métricas corretas no dashboard
- Testar que mudança de período de data atualiza métricas corretamente
- Testar que feedback visual (loading, erros) funciona corretamente durante filtragem por data
- Testar cenários de erro (token inválido, rate limit) com filtros de data
