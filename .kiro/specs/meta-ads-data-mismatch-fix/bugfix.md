# Documento de Requisitos de Bugfix

## Introdução

Quando o usuário filtra dados de anúncios por intervalo de datas na aplicação, as métricas exibidas (impressões, cliques, leads) não correspondem aos valores mostrados no Gerenciador de Anúncios do Meta para o mesmo período.

**Exemplo concreto (período 20-27 fev):**
- Gerenciador Meta: 1.320.919 impressões, 7.421 cliques
- Dashboard: 1.320.889 impressões, 10.669 cliques

A discrepância indica que o filtro de data não está sendo aplicado corretamente na requisição à API do Meta, resultando em dados agregados de períodos diferentes ou com configurações incorretas.

## Análise do Bug

### Comportamento Atual (Defeito)

1.1 QUANDO o usuário seleciona um intervalo de datas (dateFrom e dateTo) ENTÃO o sistema aplica o filtro time_range tanto no campo insights quanto como parâmetro da requisição, causando conflito na agregação de dados

1.2 QUANDO a API do Meta recebe time_range duplicado (no insights field e como query parameter) ENTÃO o sistema retorna métricas inconsistentes que não correspondem ao período solicitado

1.3 QUANDO o filtro de data é aplicado incorretamente ENTÃO as métricas de impressões, cliques e leads divergem dos valores mostrados no Gerenciador de Anúncios do Meta

### Comportamento Esperado (Correto)

2.1 QUANDO o usuário seleciona um intervalo de datas (dateFrom e dateTo) ENTÃO o sistema DEVERÁ aplicar o filtro time_range APENAS no campo insights usando a sintaxe correta `.time_range({'since':'YYYY-MM-DD','until':'YYYY-MM-DD'})`

2.2 QUANDO a API do Meta recebe a requisição com time_range corretamente configurado ENTÃO o sistema DEVERÁ retornar métricas que correspondem exatamente ao período solicitado

2.3 QUANDO o filtro de data é aplicado corretamente ENTÃO as métricas de impressões, cliques, leads e gastos DEVERÃO corresponder aos valores mostrados no Gerenciador de Anúncios do Meta para o mesmo período (com tolerância de <1% devido a diferenças de arredondamento)

2.4 QUANDO nenhum filtro de data é fornecido ENTÃO o sistema DEVERÁ usar date_preset(last_30d) como padrão no campo insights

### Comportamento Inalterado (Prevenção de Regressão)

3.1 QUANDO o usuário filtra por status (active/inactive) sem filtro de data ENTÃO o sistema DEVERÁ CONTINUAR A retornar anúncios filtrados por status com métricas dos últimos 30 dias

3.2 QUANDO o usuário busca anúncios por texto (headline ou adId) ENTÃO o sistema DEVERÁ CONTINUAR A aplicar o filtro de busca localmente no frontend sem afetar os dados da API

3.3 QUANDO a API retorna múltiplas páginas de anúncios ENTÃO o sistema DEVERÁ CONTINUAR A buscar todas as páginas até o limite de 500 anúncios

3.4 QUANDO a API retorna dados de leads de diferentes action_types ENTÃO o sistema DEVERÁ CONTINUAR A buscar leads de todos os tipos suportados (lead, onsite_conversion.lead_grouped, leadgen_grouped, offsite_conversion.fb_pixel_lead)

3.5 QUANDO a transformação de dados do Meta para o formato interno é executada ENTÃO o sistema DEVERÁ CONTINUAR A calcular CTR, cost per lead e outras métricas derivadas corretamente
