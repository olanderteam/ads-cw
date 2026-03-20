# Documento de Requisitos do Bugfix

## Introdução

Os criativos (imagens dos anúncios) estão sendo exibidos em qualidade muito baixa, tornando impossível visualizar claramente os detalhes dos anúncios. O usuário reportou que "antes era a melhor qualidade" mas agora as imagens aparecem comprimidas e difíceis de ver. Este problema afeta tanto as miniaturas na tabela de anúncios quanto a visualização no modal de detalhes, prejudicando a capacidade dos usuários de avaliar e analisar os criativos dos anúncios.

## Análise do Bug

### Comportamento Atual (Defeito)

1.1 QUANDO uma miniatura de criativo é exibida na tabela de anúncios (AdsTable.tsx) ENTÃO o sistema exibe a imagem em um container de apenas 36x36px (`h-9 w-9`) com `object-cover`, resultando em imagens severamente cortadas e comprimidas

1.2 QUANDO uma imagem de criativo é exibida no modal de detalhes (AdDetailsModal.tsx) ENTÃO o sistema pode não estar solicitando a URL de melhor qualidade disponível da API do Meta, resultando em imagens de baixa resolução

1.3 QUANDO o usuário tenta visualizar os detalhes de um criativo ENTÃO o sistema exibe imagens em qualidade inferior à que era exibida anteriormente, impossibilitando a análise clara dos criativos

### Comportamento Esperado (Correto)

2.1 QUANDO uma miniatura de criativo é exibida na tabela de anúncios ENTÃO o sistema DEVERÁ exibir a imagem em um container maior (mínimo 80x80px) com `object-cover` para permitir visualização adequada sem corte excessivo

2.2 QUANDO uma imagem de criativo é exibida no modal de detalhes ENTÃO o sistema DEVERÁ solicitar e exibir a URL de melhor qualidade disponível da API do Meta, garantindo alta resolução e clareza

2.3 QUANDO o usuário visualiza um criativo no modal ENTÃO o sistema DEVERÁ exibir a imagem em tamanho adequado (mínimo 400px de altura) com `object-contain` para preservar proporções e qualidade

### Comportamento Inalterado (Prevenção de Regressão)

3.1 QUANDO uma imagem de criativo falha ao carregar ENTÃO o sistema DEVERÁ CONTINUAR A exibir o ícone de fallback (Image icon) no container com fundo muted

3.2 QUANDO o usuário clica em "View" ou na linha da tabela ENTÃO o sistema DEVERÁ CONTINUAR A abrir o modal de detalhes do anúncio

3.3 QUANDO o modal de detalhes é exibido ENTÃO o sistema DEVERÁ CONTINUAR A mostrar todas as informações do anúncio (headline, body, métricas, tags, etc.) sem alterações

3.4 QUANDO as métricas de performance são exibidas ENTÃO o sistema DEVERÁ CONTINUAR A formatar e exibir os valores corretamente (impressões, clicks, CTR, spend, leads, cost per lead)

3.5 QUANDO o usuário interage com outros elementos da tabela (badges de status, botões de ação) ENTÃO o sistema DEVERÁ CONTINUAR A funcionar normalmente sem impacto
