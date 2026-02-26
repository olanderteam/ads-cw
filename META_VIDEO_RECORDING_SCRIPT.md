# Roteiro de Gravação - Vídeo de Demonstração Meta App

## Informações Gerais

**Duração:** 2-3 minutos  
**Formato:** MP4, MOV ou AVI  
**Resolução:** Mínimo 720p (recomendado 1080p)  
**Áudio:** Opcional, mas recomendado narração em inglês ou português

---

## Preparação Antes de Gravar

### Checklist Técnico
- [ ] Limpar histórico e cache do navegador
- [ ] Fechar abas desnecessárias
- [ ] Desativar notificações do sistema
- [ ] Verificar que o dashboard está funcionando: https://ads-cw.vercel.app
- [ ] Verificar que há dados de anúncios para exibir
- [ ] Testar filtros e modal antes de gravar
- [ ] Preparar software de gravação de tela (OBS, Loom, QuickTime, etc.)

### Dados para Demonstração
- Conta de anúncios com pelo menos 5-10 anúncios ativos
- Anúncios com métricas visíveis (impressões, cliques, leads)
- Mix de anúncios ativos e pausados para demonstrar filtros

---

## Roteiro Detalhado

### CENA 1: Introdução (10 segundos)
**O que mostrar:**
- Tela inicial do navegador
- Barra de endereço visível

**Ações:**
1. Abrir navegador em tela limpa
2. Digitar URL: `https://ads-cw.vercel.app`
3. Pressionar Enter

**Narração (opcional):**
> "Este é o dashboard de análise de anúncios do Meta Ads. Vou demonstrar como ele acessa e exibe dados de campanhas publicitárias."

---

### CENA 2: Dashboard Principal (30 segundos)
**O que mostrar:**
- Carregamento da página
- Tabela de anúncios sendo populada
- Visão geral dos dados

**Ações:**
1. Aguardar página carregar completamente
2. Mostrar a tabela com lista de anúncios
3. Fazer scroll lento pela tabela para mostrar:
   - Nomes dos anúncios
   - Status (ativo/pausado)
   - Métricas (impressões, cliques, CTR, gasto, leads)
4. Apontar cursor para diferentes colunas

**Narração (opcional):**
> "O dashboard exibe todos os anúncios da conta com suas principais métricas de performance. Podemos ver impressões, cliques, taxa de cliques, gasto total e quantidade de leads gerados."

---

### CENA 3: Detalhes de um Anúncio (40 segundos)
**O que mostrar:**
- Abertura do modal de detalhes
- Preview do criativo
- Métricas detalhadas

**Ações:**
1. Clicar em uma linha da tabela (anúncio com boas métricas)
2. Aguardar modal abrir
3. Mostrar preview do criativo:
   - Se for imagem: mostrar imagem completa
   - Se for vídeo: deixar reproduzir alguns segundos
4. Fazer scroll no modal para mostrar:
   - Texto do anúncio
   - Call-to-action
   - Métricas detalhadas (impressões, cliques, CTR, gasto, leads, custo por lead)
   - Período de veiculação
5. Fechar modal (clicar no X ou fora do modal)

**Narração (opcional):**
> "Ao clicar em qualquer anúncio, abrimos um modal com detalhes completos. Aqui vemos o preview do criativo, o texto do anúncio, e todas as métricas de performance incluindo custo por lead e período de veiculação."

---

### CENA 4: Filtro de Status (25 segundos)
**O que mostrar:**
- Uso do filtro de status
- Atualização da tabela

**Ações:**
1. Localizar filtro de status (dropdown ou botões)
2. Clicar no filtro
3. Selecionar "Ativos" ou "Active"
4. Aguardar tabela atualizar
5. Mostrar que apenas anúncios ativos aparecem
6. Voltar filtro para "Todos" ou "All"

**Narração (opcional):**
> "Podemos filtrar anúncios por status. Aqui estou filtrando para ver apenas anúncios ativos. O dashboard atualiza automaticamente a lista."

---

### CENA 5: Filtro de Data (25 segundos)
**O que mostrar:**
- Uso do filtro de período
- Atualização das métricas

**Ações:**
1. Localizar filtro de data (date picker ou dropdown)
2. Clicar no filtro
3. Selecionar período diferente (ex: "Últimos 7 dias" ou "Last 7 days")
4. Aguardar dados atualizarem
5. Mostrar que métricas mudaram conforme o período

**Narração (opcional):**
> "Também podemos filtrar por período de tempo. Aqui estou selecionando os últimos 7 dias para ver métricas recentes. As métricas são atualizadas automaticamente."

---

### CENA 6: Atualização Manual (15 segundos)
**O que mostrar:**
- Botão de refresh
- Recarregamento dos dados

**Ações:**
1. Localizar botão "Refresh" ou ícone de atualização
2. Clicar no botão
3. Mostrar indicador de loading (spinner)
4. Aguardar dados recarregarem

**Narração (opcional):**
> "Os dados são atualizados automaticamente a cada 5 minutos, mas também podemos forçar uma atualização manual clicando no botão refresh."

---

### CENA 7: Health Check Endpoint (15 segundos)
**O que mostrar:**
- Endpoint de monitoramento
- Status do token e conta

**Ações:**
1. Abrir nova aba
2. Digitar URL: `https://ads-cw.vercel.app/api/health`
3. Mostrar resposta JSON com:
   - Status do token (valid: true)
   - Tipo do token (type: "SYSTEM_USER")
   - Informações da conta (name, status, currency)
   - Scopes/permissões

**Narração (opcional):**
> "O aplicativo também fornece um endpoint de health check que mostra o status do token de autenticação e informações da conta de anúncios. Isso permite monitoramento proativo da integração."

---

### CENA 8: Encerramento (10 segundos)
**O que mostrar:**
- Voltar para dashboard
- Visão geral final

**Ações:**
1. Voltar para aba do dashboard
2. Mostrar tela completa por alguns segundos
3. Fade out ou finalizar gravação

**Narração (opcional):**
> "Este dashboard utiliza as permissões do Meta apenas para leitura de dados, permitindo análise completa de performance sem modificar nenhuma configuração de campanhas."

---

## Dicas de Gravação

### Técnicas
- **Movimentos suaves:** Mova o cursor lentamente e de forma deliberada
- **Pausas:** Deixe cada tela visível por 2-3 segundos antes de mudar
- **Zoom:** Se necessário, use zoom para destacar elementos importantes
- **Transições:** Evite cortes bruscos entre cenas

### Qualidade
- **Resolução:** Grave em 1080p se possível
- **Frame rate:** Mínimo 30fps
- **Áudio:** Se narrar, use microfone de qualidade e ambiente silencioso
- **Iluminação:** Não aplicável para gravação de tela, mas certifique-se de que o contraste está bom

### Erros Comuns a Evitar
- ❌ Movimentos rápidos demais do cursor
- ❌ Clicar em elementos errados
- ❌ Dados de teste obviamente falsos
- ❌ Notificações ou pop-ups aparecendo
- ❌ Abas com conteúdo sensível visíveis
- ❌ Vídeo muito longo (mais de 4 minutos)

---

## Pós-Produção (Opcional)

### Edições Recomendadas
- Adicionar texto na tela destacando permissões usadas
- Adicionar setas ou círculos para destacar elementos
- Cortar pausas longas ou erros
- Adicionar intro/outro com nome do app

### Legendas
- Considere adicionar legendas em inglês
- Destaque endpoints da API sendo chamados
- Indique permissões sendo utilizadas em cada cena

---

## Checklist Final Antes de Enviar

- [ ] Vídeo tem entre 2-3 minutos
- [ ] Todas as 8 cenas estão incluídas
- [ ] Qualidade de vídeo é clara (mínimo 720p)
- [ ] Não há informações sensíveis visíveis (tokens, senhas, etc.)
- [ ] Dashboard funciona corretamente em todas as cenas
- [ ] Filtros e modal funcionam como esperado
- [ ] Health check endpoint mostra dados corretos
- [ ] Formato do arquivo é compatível (MP4, MOV ou AVI)
- [ ] Tamanho do arquivo é razoável (< 500MB)

---

## Upload para Meta

1. Acesse o App Dashboard: https://developers.facebook.com/apps/
2. Vá para "App Review" > "Permissions and Features"
3. Para cada permissão solicitada, clique em "Add Details"
4. Faça upload do vídeo na seção "Screencast"
5. Adicione screenshots adicionais se necessário

---

## Alternativa: Vídeo Narrado em Inglês

Se preferir narrar em inglês, use este script:

**Scene 1:** "This is a Meta Ads analytics dashboard. I'll demonstrate how it accesses and displays advertising campaign data."

**Scene 2:** "The dashboard displays all ads from the account with their main performance metrics. We can see impressions, clicks, click-through rate, total spend, and leads generated."

**Scene 3:** "By clicking on any ad, we open a modal with complete details. Here we see the creative preview, ad text, and all performance metrics including cost per lead and delivery period."

**Scene 4:** "We can filter ads by status. Here I'm filtering to see only active ads. The dashboard automatically updates the list."

**Scene 5:** "We can also filter by time period. Here I'm selecting the last 7 days to see recent metrics. Metrics are updated automatically."

**Scene 6:** "Data is automatically updated every 5 minutes, but we can also force a manual update by clicking the refresh button."

**Scene 7:** "The application also provides a health check endpoint that shows the authentication token status and ad account information. This allows proactive monitoring of the integration."

**Scene 8:** "This dashboard uses Meta permissions only for reading data, allowing complete performance analysis without modifying any campaign settings."
