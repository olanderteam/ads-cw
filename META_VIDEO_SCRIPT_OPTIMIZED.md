# Roteiro de Vídeo Otimizado para Aprovação da Meta

## 🎯 Objetivo do Vídeo

Demonstrar CLARAMENTE como o app usa cada permissão solicitada:
1. **ads_read** - Ler dados de anúncios
2. **ads_management** - Acessar estrutura de campanhas
3. **business_management** - Validar token e conta
4. **pages_read_engagement** - Métricas de engajamento

**Duração ideal**: 2-3 minutos  
**Foco**: Mostrar que o app é READ-ONLY (apenas leitura)

---

## 📱 Roteiro Simplificado (6 Cenas)

### CENA 1: Introdução - Acesso ao Dashboard (15 segundos)

**O que mostrar:**
- URL do app sendo acessada
- Dashboard carregando
- Título/logo visível

**Ações:**
1. Abrir navegador em tela limpa
2. Digitar na barra: `https://ads-cw.vercel.app`
3. Pressionar Enter
4. Aguardar página carregar (2-3 segundos)
5. Mostrar tela completa do dashboard

**Narração sugerida (opcional):**
> "This is an external analytics dashboard that displays Meta Ads data. It uses read-only access to show ad performance metrics."

**Por que a Meta precisa ver:**
- Confirmar que é um dashboard externo
- Ver que não há login do Facebook (acesso direto via URL)

---

### CENA 2: Demonstrar ads_read - Lista de Anúncios (30 segundos)

**O que mostrar:**
- Tabela com lista de anúncios
- Colunas: Nome, Status, Impressões, Cliques, CTR, Gasto, Leads
- Scroll pela lista

**Ações:**
1. Fazer scroll lento pela tabela de anúncios
2. Pausar para mostrar diferentes anúncios
3. Destacar as métricas visíveis:
   - Impressões
   - Cliques
   - CTR (taxa de cliques)
   - Gasto
   - Leads

**Narração sugerida:**
> "The app uses ads_read permission to display a list of ads with their performance metrics including impressions, clicks, CTR, spend, and leads generated."

**Por que a Meta precisa ver:**
- Demonstra uso da permissão `ads_read`
- Mostra que apenas LEITURA de dados (não há botões de edição)
- Exibe métricas de insights

---

### CENA 3: Demonstrar ads_management - Detalhes do Anúncio (40 segundos)

**O que mostrar:**
- Clicar em um anúncio
- Modal com detalhes completos
- Preview do criativo (imagem/vídeo)
- Texto do anúncio
- Métricas detalhadas

**Ações:**
1. Clicar em uma linha da tabela (escolher anúncio com boas métricas)
2. Aguardar modal abrir
3. Mostrar preview do criativo (imagem ou vídeo)
4. Scroll para mostrar:
   - Nome do anúncio
   - Status (Active/Paused)
   - Texto do anúncio
   - Call-to-action
   - Métricas detalhadas:
     - Impressões: X
     - Cliques: X
     - CTR: X%
     - Gasto: R$ X
     - Leads: X
     - Custo por Lead: R$ X
   - Período de veiculação (datas)
5. Pausar por 3-5 segundos
6. Fechar modal

**Narração sugerida:**
> "The app uses ads_management permission to access detailed ad information including creative preview, ad copy, and comprehensive performance metrics. This is read-only access - the app cannot modify or create ads."

**Por que a Meta precisa ver:**
- Demonstra uso da permissão `ads_management`
- Mostra acesso a estrutura completa do anúncio
- Confirma que é READ-ONLY (sem botões de editar/pausar/deletar)

---

### CENA 4: Demonstrar Filtros - Status e Data (30 segundos)

**O que mostrar:**
- Filtro de status (Active/Inactive)
- Filtro de período de tempo
- Atualização dos dados

**Ações:**
1. **Filtro de Status:**
   - Clicar no filtro de status
   - Selecionar "Active" ou "Ativos"
   - Aguardar tabela atualizar
   - Mostrar que apenas anúncios ativos aparecem
   - Voltar para "All"

2. **Filtro de Data:**
   - Clicar no filtro de data
   - Selecionar período (ex: "Last 7 days")
   - Aguardar dados atualizarem
   - Mostrar que métricas mudaram

**Narração sugerida:**
> "Users can filter ads by status and date range to analyze performance for specific periods. The app queries the Meta API with these parameters to retrieve filtered data."

**Por que a Meta precisa ver:**
- Mostra uso prático dos parâmetros da API
- Demonstra que o app faz queries específicas (não baixa tudo)
- Confirma funcionalidade de análise

---

### CENA 5: Demonstrar business_management - Health Check (20 segundos)

**O que mostrar:**
- Endpoint de validação
- Status do token
- Informações da conta

**Ações:**
1. Abrir nova aba (Ctrl+T ou Cmd+T)
2. Digitar na barra: `https://ads-cw.vercel.app/api/health`
3. Pressionar Enter
4. Aguardar resposta JSON aparecer
5. Pausar por 5-7 segundos para mostrar:
   - `"status": "ok"`
   - `"token": { "valid": true, "type": "SYSTEM_USER" }`
   - `"account": { "name": "Cardápio Web - Conta de Anúncio", "status": "ACTIVE" }`
6. Fechar aba

**Narração sugerida:**
> "The app uses business_management permission to validate the access token and verify account access. This health check endpoint confirms the integration is working correctly."

**Por que a Meta precisa ver:**
- Demonstra uso da permissão `business_management`
- Mostra validação de token (segurança)
- Confirma que app verifica acesso antes de fazer queries

---

### CENA 6: Demonstrar pages_read_engagement - Métricas de Engajamento (25 segundos)

**O que mostrar:**
- Voltar ao dashboard
- Abrir modal de um anúncio novamente
- Destacar métricas de engajamento

**Ações:**
1. Voltar para aba do dashboard
2. Clicar em outro anúncio (de preferência com engajamento)
3. No modal, destacar métricas de engajamento:
   - Impressões (alcance)
   - Cliques (interação)
   - CTR (taxa de engajamento)
   - Leads (conversões)
4. Scroll para mostrar todas as métricas
5. Pausar por 3 segundos
6. Fechar modal

**Narração sugerida:**
> "The app uses pages_read_engagement permission to access engagement metrics from ads linked to Facebook pages, including impressions, clicks, and conversion data."

**Por que a Meta precisa ver:**
- Demonstra uso da permissão `pages_read_engagement`
- Mostra métricas de engajamento social
- Confirma análise de performance completa

---

### CENA 7: Encerramento - Visão Geral (10 segundos)

**O que mostrar:**
- Dashboard completo
- Resumo visual

**Ações:**
1. Mostrar dashboard completo por 5 segundos
2. Fazer scroll suave pela página
3. Finalizar com tela limpa

**Narração sugerida:**
> "This dashboard provides read-only access to Meta Ads data, allowing advertisers to monitor campaign performance without modifying any settings."

**Por que a Meta precisa ver:**
- Resumo visual do app
- Reforça que é READ-ONLY
- Finalização profissional

---

## 🎬 Como Gravar

### Opção 1: Usar Reflect.run (Recomendado)

1. Acesse: https://reflect.run/
2. Crie novo teste: "Meta Ads Dashboard - Permission Demo"
3. Starting URL: `https://ads-cw.vercel.app`
4. Clique "Create & Record"
5. Siga as 7 cenas acima
6. Pare gravação
7. Exporte vídeo (MP4, 1080p)

### Opção 2: Gravar Tela Diretamente

**Windows:**
- Xbox Game Bar (Win+G)
- OBS Studio (mais profissional)

**Mac:**
- QuickTime Player (Cmd+Ctrl+N)
- OBS Studio

**Online:**
- Loom (https://loom.com)
- ScreenRec

---

## ✅ Checklist de Qualidade

Antes de enviar para a Meta:

### Conteúdo
- [ ] Todas as 7 cenas incluídas
- [ ] Cada permissão demonstrada claramente
- [ ] Fica claro que é READ-ONLY (sem botões de edição)
- [ ] Health check mostra token válido
- [ ] Métricas aparecem corretamente

### Técnico
- [ ] Duração: 2-3 minutos (não mais que 4 minutos!)
- [ ] Resolução: Mínimo 720p (recomendado 1080p)
- [ ] Formato: MP4, MOV ou AVI
- [ ] Tamanho: Menos de 500MB
- [ ] Movimentos suaves (não muito rápido)
- [ ] Sem informações sensíveis (tokens, senhas)

### Clareza
- [ ] URL visível em todas as cenas
- [ ] Texto legível (não muito pequeno)
- [ ] Sem notificações ou pop-ups
- [ ] Sem abas desnecessárias abertas

---

## 📝 Texto para Acompanhar o Vídeo

Quando enviar o vídeo para a Meta, adicione esta descrição:

```
Video Demonstration - Meta Ads Analytics Dashboard

This video demonstrates how our application uses the requested permissions:

1. ads_read (0:15-0:45): Displays list of ads with performance metrics (impressions, clicks, CTR, spend, leads)

2. ads_management (0:45-1:25): Shows detailed ad information including creative preview, ad copy, and comprehensive metrics. READ-ONLY access - no editing capabilities.

3. business_management (1:25-1:45): Validates access token and verifies account access through health check endpoint

4. pages_read_engagement (1:45-2:10): Displays engagement metrics from ads linked to Facebook pages

The application provides read-only access to ad data for performance analysis. No modifications to campaigns, ads, or account settings are possible through this dashboard.

URL: https://ads-cw.vercel.app
Health Check: https://ads-cw.vercel.app/api/health
```

---

## 🎯 Dicas Importantes

### Durante a Gravação

✅ **Movimentos lentos** - Cursor deve se mover suavemente  
✅ **Pausas estratégicas** - Deixe cada informação importante visível por 3-5 segundos  
✅ **Foco nas permissões** - Cada cena demonstra uma permissão específica  
✅ **Destaque READ-ONLY** - Mostre que não há botões de editar/criar/deletar  

❌ **Evite** movimentos rápidos  
❌ **Evite** clicar em elementos errados  
❌ **Evite** mostrar informações sensíveis  
❌ **Evite** vídeo muito longo (máximo 4 minutos)  

### Narração (Opcional mas Recomendado)

- Use inglês (Meta é empresa americana)
- Fale devagar e claramente
- Mencione cada permissão pelo nome
- Reforce que é "read-only access"
- Use microfone de qualidade

### Sem Narração

Se não quiser narrar:
- Adicione texto na tela destacando cada permissão
- Use setas ou círculos para destacar elementos
- Certifique-se que fica claro o que está sendo demonstrado

---

## 🚀 Próximos Passos

1. ✅ Grave o vídeo seguindo este roteiro
2. ✅ Verifique qualidade (checklist acima)
3. ✅ Exporte em MP4, 1080p
4. ✅ Adicione a descrição acima
5. ✅ Submeta para Meta com as respostas do `META_APP_PUBLICATION_GUIDE.md`

---

## 📞 Suporte

Se tiver dúvidas durante a gravação:
- Revise o `META_APP_PUBLICATION_GUIDE.md` para entender o que a Meta espera
- Teste o dashboard antes de gravar: https://ads-cw.vercel.app
- Verifique health check: https://ads-cw.vercel.app/api/health

Boa sorte com a gravação e aprovação! 🎬🚀
