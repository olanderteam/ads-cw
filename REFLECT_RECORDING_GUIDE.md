# Guia de Gravação com Reflect.run

## Por que usar Reflect.run?

✅ Grava tela automaticamente enquanto você testa  
✅ Qualidade profissional (1080p)  
✅ Pode exportar vídeo para enviar à Meta  
✅ Cria testes automatizados ao mesmo tempo  
✅ Gratuito para começar

---

## Passo 1: Configurar Variáveis no Vercel (PRIMEIRO!)

Antes de gravar, certifique-se que o app está funcionando em produção:

1. Configure as variáveis no Vercel: https://vercel.com/gabes-projects-97f403fa/ads-cw/settings/environment-variables

2. Adicione as 5 variáveis (veja `VERCEL_ENV_SETUP.md`)

3. Faça redeploy

4. Teste: https://ads-cw.vercel.app/api/health (deve retornar status "ok")

5. Teste: https://ads-cw.vercel.app (deve mostrar anúncios)

**⚠️ NÃO PROSSIGA se o app não estiver funcionando em produção!**

---

## Passo 2: Criar Conta no Reflect.run

1. Acesse: https://reflect.run/

2. Clique em **"Sign Up"** ou **"Get Started"**

3. Crie conta com:
   - Email
   - Google
   - GitHub

4. Confirme seu email (se necessário)

---

## Passo 3: Criar Novo Teste

### 3.1 Criar Projeto

1. No dashboard do Reflect, clique em **"Create Project"**

2. Nome do projeto: **"Meta Ads Dashboard Demo"**

3. Clique em **"Create"**

### 3.2 Criar Teste

1. Clique em **"Create Test"**

2. Nome do teste: **"Dashboard Demo for Meta Review"**

3. **Starting URL**: `https://ads-cw.vercel.app`

4. Clique em **"Create & Record"**

---

## Passo 4: Gravar o Teste (Seguindo o Roteiro)

O Reflect vai abrir uma janela do Chrome com gravação ativa. Siga este roteiro:

### CENA 1: Página Inicial (10 segundos)

1. **Aguarde** a página carregar completamente
2. **Pause** por 2-3 segundos para mostrar a tela inicial
3. **Scroll lentamente** pela tabela de anúncios

**Ações no Reflect:**
- Não clique em nada ainda, apenas deixe carregar
- O Reflect está gravando automaticamente

### CENA 2: Visualizar Anúncios (20 segundos)

1. **Scroll** pela tabela para mostrar diferentes anúncios
2. **Pause** em alguns anúncios para mostrar as métricas
3. Mostre as colunas: Nome, Status, Impressões, Cliques, CTR, Gasto, Leads

**Ações no Reflect:**
- Use scroll suave
- Não vá muito rápido

### CENA 3: Abrir Modal de Detalhes (40 segundos)

1. **Clique** em uma linha da tabela (escolha um anúncio com boas métricas)
2. **Aguarde** o modal abrir
3. **Pause** para mostrar o preview do criativo (imagem ou vídeo)
4. **Scroll** dentro do modal para mostrar:
   - Texto do anúncio
   - Call-to-action
   - Métricas detalhadas (impressões, cliques, CTR, gasto, leads, custo por lead)
   - Período de veiculação
5. **Pause** por 3-5 segundos
6. **Feche** o modal (clique no X ou fora do modal)

**Ações no Reflect:**
- Clique devagar e deliberadamente
- Aguarde animações terminarem

### CENA 4: Filtro de Status (25 segundos)

1. **Localize** o filtro de status (dropdown ou botões)
2. **Clique** no filtro
3. **Selecione** "Active" ou "Ativos"
4. **Aguarde** a tabela atualizar
5. **Pause** para mostrar apenas anúncios ativos
6. **Clique** no filtro novamente
7. **Selecione** "All" ou "Todos"

**Ações no Reflect:**
- Movimentos lentos e claros
- Aguarde cada atualização

### CENA 5: Filtro de Data (25 segundos)

1. **Localize** o filtro de data (date picker ou dropdown)
2. **Clique** no filtro
3. **Selecione** um período diferente (ex: "Last 7 days" ou "Últimos 7 dias")
4. **Aguarde** os dados atualizarem
5. **Pause** para mostrar as métricas atualizadas

**Ações no Reflect:**
- Certifique-se que as métricas mudaram
- Mostre que o filtro funcionou

### CENA 6: Botão Refresh (15 segundos)

1. **Localize** o botão "Refresh" ou ícone de atualização
2. **Clique** no botão
3. **Aguarde** o loading indicator (spinner)
4. **Aguarde** os dados recarregarem
5. **Pause** por 2 segundos

**Ações no Reflect:**
- Mostre claramente o loading
- Aguarde completar

### CENA 7: Health Check Endpoint (15 segundos)

1. **Abra nova aba** (Ctrl+T ou Cmd+T)
2. **Digite** na barra de endereço: `https://ads-cw.vercel.app/api/health`
3. **Pressione** Enter
4. **Aguarde** a resposta JSON aparecer
5. **Pause** por 5 segundos para mostrar:
   - `"status": "ok"`
   - Token válido
   - Informações da conta
6. **Feche** a aba

**Ações no Reflect:**
- Digite devagar para ficar legível
- Deixe tempo para ler o JSON

### CENA 8: Encerramento (10 segundos)

1. **Volte** para a aba do dashboard
2. **Pause** mostrando a tela completa
3. **Finalize** a gravação

**Ações no Reflect:**
- Deixe a tela limpa e organizada
- Não feche abruptamente

---

## Passo 5: Finalizar Gravação no Reflect

### 5.1 Parar Gravação

1. No canto superior direito, clique em **"Stop Recording"**

2. O Reflect vai processar o teste

3. Aguarde alguns segundos

### 5.2 Revisar o Teste

1. O Reflect mostra todos os passos gravados

2. Você pode:
   - **Replay** - Ver o teste rodando novamente
   - **Edit** - Editar passos se necessário
   - **Delete** - Remover passos desnecessários

3. Revise e certifique-se que tudo está correto

### 5.3 Salvar o Teste

1. Clique em **"Save"** ou **"Save Test"**

2. O teste está salvo e pode ser executado novamente

---

## Passo 6: Exportar Vídeo

### Opção A: Exportar Diretamente (Se disponível)

1. No teste salvo, procure por **"Export Video"** ou **"Download Video"**

2. Selecione qualidade: **1080p**

3. Clique em **"Export"** ou **"Download"**

4. Aguarde o processamento (pode levar alguns minutos)

5. Baixe o vídeo MP4

### Opção B: Gravar Tela Durante Replay

Se o Reflect não tiver opção de exportar vídeo diretamente:

1. Abra um software de gravação de tela:
   - **Windows**: Xbox Game Bar (Win+G) ou OBS Studio
   - **Mac**: QuickTime Player (Cmd+Ctrl+N) ou OBS Studio
   - **Online**: Loom, ScreenRec

2. No Reflect, clique em **"Run Test"** ou **"Replay"**

3. **Inicie a gravação** de tela

4. Deixe o teste rodar completamente

5. **Pare a gravação**

6. Salve o vídeo

### Opção C: Usar OBS Studio (Mais Profissional)

1. Baixe OBS Studio: https://obsproject.com/

2. Instale e abra

3. Configurações:
   - **Settings** > **Video**
   - Base Resolution: 1920x1080
   - Output Resolution: 1920x1080
   - FPS: 30

4. Adicione fonte:
   - Clique em **"+"** em Sources
   - Selecione **"Display Capture"** ou **"Window Capture"**
   - Selecione a janela do Chrome com Reflect

5. No Reflect, clique em **"Run Test"**

6. No OBS, clique em **"Start Recording"**

7. Aguarde o teste completar

8. No OBS, clique em **"Stop Recording"**

9. Vídeo salvo em: `C:\Users\[seu_usuario]\Videos` (Windows) ou `~/Movies` (Mac)

---

## Passo 7: Editar Vídeo (Opcional)

Se quiser melhorar o vídeo:

### Ferramentas Gratuitas

- **Windows**: Clipchamp (built-in no Windows 11) ou DaVinci Resolve
- **Mac**: iMovie ou DaVinci Resolve
- **Online**: Clipchamp, Kapwing

### Edições Recomendadas

1. **Cortar** início e fim (remover momentos de setup)

2. **Adicionar texto** destacando:
   - "Meta Marketing API Integration"
   - "Read-only access to ad data"
   - Permissões sendo usadas

3. **Adicionar setas** ou círculos para destacar:
   - Métricas importantes
   - Filtros
   - Botões

4. **Acelerar** partes lentas (loading, etc.) - mas não muito!

5. **Adicionar intro/outro** (opcional):
   - Intro: Nome do app + propósito
   - Outro: "Thank you for reviewing"

---

## Passo 8: Verificar Qualidade do Vídeo

Antes de enviar para a Meta:

### Checklist de Qualidade

- [ ] Duração: 2-4 minutos (não muito longo!)
- [ ] Resolução: Mínimo 720p (recomendado 1080p)
- [ ] Formato: MP4, MOV ou AVI
- [ ] Tamanho: Menos de 500MB
- [ ] Áudio: Opcional (pode ser mudo ou com narração)
- [ ] Todas as 8 cenas incluídas
- [ ] Movimentos suaves (não muito rápido)
- [ ] Sem informações sensíveis visíveis (tokens, senhas)
- [ ] Dashboard funciona corretamente
- [ ] Métricas aparecem
- [ ] Filtros funcionam
- [ ] Modal abre e fecha
- [ ] Health check mostra status "ok"

---

## Passo 9: Upload para Meta

### 9.1 Preparar Vídeo

1. Renomeie o arquivo para algo descritivo:
   - `meta-ads-dashboard-demo.mp4`
   - `ads-dashboard-api-integration.mp4`

2. Verifique o tamanho (deve ser < 500MB)

### 9.2 Submeter para Revisão

1. Acesse: https://developers.facebook.com/apps/1332064888938088/app-review/

2. Vá para **"Permissions and Features"**

3. Para cada permissão solicitada:
   - Clique em **"Request"** ou **"Add Details"**
   - Preencha as respostas (use `META_APP_PUBLICATION_GUIDE.md`)
   - Na seção **"Screencast"**, clique em **"Upload Video"**
   - Selecione seu vídeo
   - Aguarde upload completar

4. Adicione screenshots adicionais (opcional mas recomendado):
   - Screenshot do dashboard
   - Screenshot do modal de detalhes
   - Screenshot do health check

5. Clique em **"Submit for Review"**

---

## Dicas Importantes

### Durante a Gravação

✅ **Movimentos lentos** - Cursor deve se mover suavemente  
✅ **Pausas** - Deixe cada tela visível por 2-3 segundos  
✅ **Foco** - Mostre apenas o que é relevante  
✅ **Clareza** - Certifique-se que texto é legível  

❌ **Evite** movimentos rápidos do cursor  
❌ **Evite** clicar em elementos errados  
❌ **Evite** notificações ou pop-ups  
❌ **Evite** mostrar informações sensíveis  

### Qualidade do Vídeo

- Use resolução 1080p se possível
- Frame rate: 30fps é suficiente
- Não comprima muito (qualidade > tamanho)
- Teste o vídeo antes de enviar

### Conteúdo

- Mostre TODAS as permissões sendo usadas
- Destaque que é read-only (apenas leitura)
- Mostre que funciona corretamente
- Mostre que não modifica nada

---

## Troubleshooting

### Reflect não está gravando

→ Verifique se deu permissão para gravar tela  
→ Tente usar Chrome (navegador recomendado)  
→ Desative extensões que podem interferir

### Vídeo muito grande (> 500MB)

→ Use ferramenta de compressão: HandBrake (gratuito)  
→ Reduza resolução para 720p  
→ Reduza duração (corte partes desnecessárias)

### Dashboard não funciona durante gravação

→ Verifique se variáveis estão configuradas no Vercel  
→ Teste `/api/health` antes de gravar  
→ Verifique console do navegador (F12) para erros

### Reflect não tem opção de exportar vídeo

→ Use Opção B ou C (gravar tela durante replay)  
→ OBS Studio é gratuito e profissional

---

## Alternativa: Gravar Sem Reflect

Se preferir não usar Reflect, pode gravar diretamente:

### Windows
- Xbox Game Bar (Win+G) - Built-in
- OBS Studio - Gratuito e profissional

### Mac
- QuickTime Player (Cmd+Ctrl+N) - Built-in
- OBS Studio - Gratuito e profissional

### Online
- Loom - Gratuito, fácil de usar
- ScreenRec - Gratuito

Siga o mesmo roteiro em `META_VIDEO_RECORDING_SCRIPT.md`

---

## Resumo Rápido

1. ✅ Configure variáveis no Vercel
2. ✅ Teste app em produção
3. ✅ Crie conta no Reflect.run
4. ✅ Crie novo teste
5. ✅ Grave seguindo o roteiro (8 cenas)
6. ✅ Exporte vídeo
7. ✅ Verifique qualidade
8. ✅ Upload para Meta

**Tempo estimado**: 30-45 minutos (incluindo edição)

---

## Links Úteis

- Reflect.run: https://reflect.run/
- OBS Studio: https://obsproject.com/
- HandBrake (compressão): https://handbrake.fr/
- Meta App Review: https://developers.facebook.com/apps/1332064888938088/app-review/

---

## Próximos Passos

Após gravar e enviar:

1. ✅ Aguardar revisão da Meta (1-3 dias úteis)
2. ✅ Responder perguntas se a Meta solicitar
3. ✅ Após aprovação, app vai para modo Live
4. ✅ Gerar System User Token definitivo
5. ✅ Atualizar token no Vercel

Boa sorte! 🎬🚀
