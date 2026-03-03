# Documento de Requisitos de Bugfix

## Introdução

O dashboard que consome dados da Meta Marketing API apresenta dois problemas críticos que afetam a precisão e utilidade das informações exibidas:

1. **Dados Divergentes**: As métricas exibidas (impressões, cliques, leads, gastos) não correspondem aos valores mostrados no Meta Ads Manager para o mesmo período, mesmo após a correção anterior (meta-ads-data-mismatch-fix)

2. **Identificação Incorreta de Plataformas**: O dashboard mostra apenas "Facebook" como plataforma para todos os anúncios, quando deveria identificar e exibir todas as plataformas onde cada anúncio está sendo veiculado (Facebook, Instagram, Messenger, Audience Network)

**Análise Técnica:**
- O campo `publisher_platforms` não está sendo solicitado na requisição à Meta Graph API
- A transformação de dados define `platform: 'Facebook'` de forma hardcoded (linha ~200 do arquivo api/meta-ads.ts)
- Podem estar faltando outros campos essenciais que causam divergência nas métricas

## Análise do Bug

### Comportamento Atual (Defeito)

1.1 QUANDO a API solicita dados de anúncios à Meta Graph API ENTÃO o sistema não inclui o campo `publisher_platforms` na lista de campos solicitados

1.2 QUANDO a transformação de dados processa um anúncio ENTÃO o sistema define `platform: 'Facebook'` de forma hardcoded para todos os anúncios, independentemente das plataformas reais onde estão sendo veiculados

1.3 QUANDO o dashboard exibe métricas de anúncios ENTÃO os valores de impressões, cliques, leads e gastos divergem dos valores mostrados no Meta Ads Manager para o mesmo período

1.4 QUANDO o usuário visualiza um anúncio que está rodando em múltiplas plataformas (ex: Facebook + Instagram) ENTÃO o sistema mostra apenas "Facebook" como plataforma

### Comportamento Esperado (Correto)

2.1 QUANDO a API solicita dados de anúncios à Meta Graph API ENTÃO o sistema DEVERÁ incluir o campo `publisher_platforms` na lista de campos solicitados dentro do campo insights

2.2 QUANDO a transformação de dados processa um anúncio ENTÃO o sistema DEVERÁ extrair as plataformas reais do campo `publisher_platforms` retornado pela API

2.3 QUANDO o campo `publisher_platforms` contém múltiplas plataformas ENTÃO o sistema DEVERÁ armazenar e exibir todas as plataformas (ex: "Facebook, Instagram" ou como array)

2.4 QUANDO o campo `publisher_platforms` está vazio ou ausente ENTÃO o sistema DEVERÁ usar "Unknown" ou "N/A" como valor padrão ao invés de "Facebook"

2.5 QUANDO o dashboard exibe métricas de anúncios ENTÃO os valores de impressões, cliques, leads e gastos DEVERÃO corresponder aos valores mostrados no Meta Ads Manager para o mesmo período (com tolerância de <1% devido a diferenças de arredondamento)

2.6 QUANDO a API solicita campos de insights ENTÃO o sistema DEVERÁ incluir todos os campos essenciais necessários para garantir correspondência exata com o Meta Ads Manager

### Comportamento Inalterado (Prevenção de Regressão)

3.1 QUANDO o usuário filtra anúncios por intervalo de datas ENTÃO o sistema DEVERÁ CONTINUAR A aplicar o filtro time_range corretamente no campo insights conforme implementado na correção anterior

3.2 QUANDO o usuário filtra por status (active/inactive) ENTÃO o sistema DEVERÁ CONTINUAR A retornar anúncios filtrados por status corretamente

3.3 QUANDO a API retorna múltiplas páginas de anúncios ENTÃO o sistema DEVERÁ CONTINUAR A buscar todas as páginas até o limite de 500 anúncios

3.4 QUANDO a API retorna dados de leads de diferentes action_types ENTÃO o sistema DEVERÁ CONTINUAR A buscar leads de todos os tipos suportados (lead, onsite_conversion.lead_grouped, leadgen_grouped, offsite_conversion.fb_pixel_lead)

3.5 QUANDO a transformação de dados calcula métricas derivadas (CTR, cost per lead) ENTÃO o sistema DEVERÁ CONTINUAR A calcular essas métricas corretamente

3.6 QUANDO a API retorna dados de creative (título, corpo, imagem, CTA) ENTÃO o sistema DEVERÁ CONTINUAR A extrair e exibir essas informações corretamente

3.7 QUANDO ocorrem erros da Meta API (401, 403, 429) ENTÃO o sistema DEVERÁ CONTINUAR A retornar mensagens de erro apropriadas em português
