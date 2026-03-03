# Documento de Requisitos de Bugfix

## Introdução

O dashboard não está exibindo os dados corretamente em comparação com o Gerenciador de Anúncios do Meta. Existem três problemas principais:

1. **Plataforma incorreta**: Todos os anúncios aparecem como "Facebook", mas deveriam mostrar a plataforma real onde estão veiculando (Facebook, Instagram, Messenger, Audience Network)
2. **Dados de criativos incompletos**: Informações dos criativos não estão sendo extraídas completamente da API
3. **Métricas agregadas incorretas**: As métricas da visão geral (cards de overview) não correspondem aos totais mostrados no Gerenciador de Anúncios

**Exemplo concreto:**
- Gerenciador Meta: Mostra anúncios rodando em Instagram e Facebook com plataformas específicas
- Dashboard: Mostra todos como "Facebook" independente da plataforma real

## Análise do Bug

### Comportamento Atual (Defeito)

1.1 QUANDO a API retorna dados de anúncios ENTÃO o sistema hardcoda `platform: 'Facebook'` para todos os anúncios, ignorando a plataforma real onde o anúncio está veiculando

1.2 QUANDO a API retorna dados de criativos ENTÃO o sistema pode não estar extraindo todos os campos disponíveis (image_url, video_id, thumbnail_url, etc.)

1.3 QUANDO o dashboard calcula métricas agregadas ENTÃO os valores podem não corresponder aos totais mostrados no Gerenciador de Anúncios do Meta

1.4 QUANDO um anúncio roda em múltiplas plataformas ENTÃO o sistema não identifica nem exibe quais plataformas estão ativas

### Comportamento Esperado (Correto)

2.1 QUANDO a API retorna dados de anúncios ENTÃO o sistema DEVERÁ extrair a plataforma real do campo apropriado da Meta API (publisher_platforms, configured_status, ou insights breakdowns)

2.2 QUANDO um anúncio roda em múltiplas plataformas ENTÃO o sistema DEVERÁ exibir todas as plataformas ativas (ex: "Facebook, Instagram")

2.3 QUANDO a API retorna dados de criativos ENTÃO o sistema DEVERÁ extrair todos os campos disponíveis incluindo:
   - Imagens (image_url, thumbnail_url)
   - Vídeos (video_id, thumbnail_url)
   - Textos (title, body, name)
   - Links (link_url, object_url)
   - Call-to-action (call_to_action_type)

2.4 QUANDO o dashboard calcula métricas agregadas ENTÃO os valores DEVERÃO corresponder exatamente aos totais mostrados no Gerenciador de Anúncios do Meta

2.5 QUANDO os dados são exibidos no dashboard ENTÃO DEVERÃO estar no mesmo formato e estrutura do Gerenciador de Anúncios, facilitando a leitura e comparação

### Comportamento Inalterado (Prevenção de Regressão)

3.1 QUANDO o usuário filtra anúncios por status ENTÃO o sistema DEVERÁ CONTINUAR A retornar anúncios filtrados corretamente

3.2 QUANDO o usuário filtra anúncios por data ENTÃO o sistema DEVERÁ CONTINUAR A aplicar o filtro de data corretamente nas métricas

3.3 QUANDO o sistema transforma dados do Meta para o formato interno ENTÃO DEVERÁ CONTINUAR A calcular métricas derivadas (CTR, cost per lead) corretamente

3.4 QUANDO o sistema busca múltiplas páginas de anúncios ENTÃO DEVERÁ CONTINUAR A paginar corretamente até o limite de 500 anúncios

## Causa Raiz Hipotética

Baseado na análise do código em `api/meta-ads.ts`:

1. **Plataforma Hardcoded**: Linha ~200 contém `platform: 'Facebook'` fixo, ignorando dados reais da API
   - A Meta API fornece informações de plataforma em campos como `publisher_platforms` ou através de breakdowns no insights
   - O código atual não está buscando nem processando esses campos

2. **Dados de Criativos Incompletos**: O campo `creative` está sendo buscado, mas pode haver:
   - Campos adicionais não sendo extraídos
   - Fallbacks inadequados quando campos estão vazios
   - Estrutura de dados do creative não sendo completamente mapeada

3. **Métricas Agregadas**: As métricas podem estar incorretas devido a:
   - Dados faltando de alguns anúncios
   - Cálculos incorretos no frontend (OverviewCards.tsx)
   - Dados não sendo agregados corretamente quando há múltiplas páginas

## Requisitos de Correção

### R1: Extração Correta de Plataforma

R1.1: O sistema DEVE buscar informações de plataforma da Meta API usando o campo apropriado

R1.2: O sistema DEVE mapear os valores da Meta API para os valores esperados no frontend:
- `facebook` → "Facebook"
- `instagram` → "Instagram"  
- `messenger` → "Messenger"
- `audience_network` → "Audience Network"

R1.3: Quando um anúncio roda em múltiplas plataformas, o sistema DEVE exibir todas as plataformas separadas por vírgula

R1.4: Quando a plataforma não puder ser determinada, o sistema DEVE usar "Meta Ads" como fallback

### R2: Extração Completa de Dados de Criativos

R2.1: O sistema DEVE extrair todos os campos disponíveis do creative:
- `image_url`, `thumbnail_url` para imagens
- `video_id`, `thumbnail_url` para vídeos
- `title`, `body`, `name` para textos
- `link_url`, `object_url` para links
- `call_to_action_type` para CTA

R2.2: O sistema DEVE implementar fallbacks apropriados quando campos estão vazios

R2.3: O sistema DEVE priorizar campos mais específicos sobre campos genéricos (ex: `title` sobre `name`)

### R3: Métricas Agregadas Corretas

R3.1: O sistema DEVE garantir que todas as métricas de todos os anúncios sejam incluídas nos cálculos agregados

R3.2: O sistema DEVE calcular corretamente:
- Total de leads
- Total de gastos (spend)
- Total de cliques
- Total de impressões
- Total de alcance (reach)
- Custo médio por lead
- CTR médio

R3.3: Os valores calculados DEVEM corresponder aos totais mostrados no Gerenciador de Anúncios do Meta (tolerância <1%)

### R4: Formato de Exibição

R4.1: Os dados DEVEM ser exibidos no dashboard no mesmo formato do Gerenciador de Anúncios

R4.2: As métricas DEVEM usar formatação apropriada:
- Números grandes com separadores de milhares
- Moeda com símbolo correto (R$, USD, etc.)
- Percentuais com 2 casas decimais

R4.3: A interface DEVE facilitar a leitura e comparação com o Gerenciador de Anúncios
