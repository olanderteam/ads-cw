# Guia de Configuração - Meta Marketing API

## Status Atual

✅ Código da Meta API já está implementado  
✅ Endpoints `/api/meta-ads` e `/api/health` prontos  
✅ Frontend já usa `meta-api-client.ts`  
⚠️ Falta apenas configurar as credenciais no `.env`

---

## Passo 1: Obter Access Token

### Opção A: Token de Usuário (para testes - expira em 60 dias)

1. Acesse: https://developers.facebook.com/tools/explorer/

2. No topo da página:
   - **Meta App**: Selecione seu app no dropdown
   - **User or Page**: Deixe em "User Token"

3. Clique no botão **"Generate Access Token"**

4. Na janela de permissões, selecione:
   - ✅ `ads_read`
   - ✅ `ads_management`
   - ✅ `business_management`
   - ✅ `pages_read_engagement`

5. Clique em **"Generate Access Token"**

6. Copie o token gerado (começa com `EAAA...`)

7. **IMPORTANTE**: Clique no botão **"i"** ao lado do token e depois em **"Open in Access Token Tool"**

8. Na página do Access Token Tool, clique em **"Extend Access Token"** para estender a validade para 60 dias

9. Copie o novo token estendido

### Opção B: System User Token (para produção - nunca expira)

1. Acesse: https://business.facebook.com/settings/system-users

2. Clique em **"Add"** para criar um novo System User

3. Dê um nome (ex: "Dashboard Ads API")

4. Selecione role: **"Admin"**

5. Clique em **"Create System User"**

6. Na lista de System Users, clique no nome do usuário criado

7. Clique em **"Generate New Token"**

8. Selecione seu app

9. Selecione as permissões:
   - ✅ `ads_read`
   - ✅ `ads_management`
   - ✅ `business_management`
   - ✅ `pages_read_engagement`

10. Clique em **"Generate Token"**

11. **COPIE E SALVE O TOKEN IMEDIATAMENTE** (você não poderá vê-lo novamente)

12. Adicione o System User à conta de anúncios:
    - Vá em: https://business.facebook.com/settings/ad-accounts
    - Selecione sua conta de anúncios
    - Clique em **"Add People"**
    - Selecione o System User criado
    - Dê permissão de **"Admin"** ou **"Advertiser"**

---

## Passo 2: Obter App ID e App Secret

1. Acesse: https://developers.facebook.com/apps/

2. Selecione seu app

3. No menu lateral, clique em **"Settings"** > **"Basic"**

4. Copie o **"App ID"** (número longo)

5. Clique em **"Show"** ao lado de **"App Secret"**

6. Digite sua senha do Facebook para confirmar

7. Copie o **"App Secret"**

---

## Passo 3: Configurar .env

Abra o arquivo `.env` na raiz do projeto e substitua os valores:

```env
META_ACCESS_TOKEN=EAAA... (cole o token aqui)
META_AD_ACCOUNT_ID=act_648451459117938
META_APP_ID=1234567890 (cole o App ID aqui)
META_APP_SECRET=abc123... (cole o App Secret aqui)
META_API_VERSION=v25.0
```

**Exemplo com valores reais:**
```env
META_ACCESS_TOKEN=EAABsbCS1iHgBO7ZC8qL9ZBvwxyz...
META_AD_ACCOUNT_ID=act_648451459117938
META_APP_ID=1332064888938088
META_APP_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
META_API_VERSION=v25.0
```

Salve o arquivo.

---

## Passo 4: Testar Localmente

### 4.1 Instalar dependências (se ainda não instalou)

```bash
npm install
```

### 4.2 Iniciar servidor de desenvolvimento

```bash
npm run dev
```

### 4.3 Testar Health Check

Abra o navegador e acesse:

```
http://localhost:5173/api/health
```

**Resposta esperada (sucesso):**
```json
{
  "status": "ok",
  "message": "Integração Meta API funcionando corretamente",
  "token": {
    "valid": true,
    "type": "USER" ou "SYSTEM",
    "expiresIn": "60 dias" ou "Nunca (System User Token)",
    "scopes": ["ads_read", "ads_management", "business_management", "pages_read_engagement"],
    "appId": "1332064888938088"
  },
  "account": {
    "id": "act_648451459117938",
    "name": "Nome da sua conta",
    "status": "ACTIVE",
    "currency": "BRL",
    "timezone": "America/Sao_Paulo"
  }
}
```

**Se der erro:**
- ❌ Token inválido → Gere um novo token
- ❌ Sem acesso à conta → Adicione o System User à conta de anúncios
- ❌ Permissões insuficientes → Gere token com todas as permissões

### 4.4 Testar Dashboard

Acesse:
```
http://localhost:5173
```

Você deve ver a lista de anúncios da sua conta!

---

## Passo 5: Configurar no Vercel (Produção)

### 5.1 Acessar Dashboard do Vercel

1. Acesse: https://vercel.com/dashboard

2. Selecione seu projeto: **ads-cw**

3. Clique em **"Settings"**

4. No menu lateral, clique em **"Environment Variables"**

### 5.2 Adicionar Variáveis

Adicione cada variável clicando em **"Add New"**:

| Name | Value | Environment |
|------|-------|-------------|
| `META_ACCESS_TOKEN` | (cole o token) | Production, Preview, Development |
| `META_AD_ACCOUNT_ID` | `act_648451459117938` | Production, Preview, Development |
| `META_APP_ID` | (cole o App ID) | Production, Preview, Development |
| `META_APP_SECRET` | (cole o App Secret) | Production, Preview, Development |
| `META_API_VERSION` | `v25.0` | Production, Preview, Development |

### 5.3 Fazer Redeploy

1. Vá para a aba **"Deployments"**

2. Clique nos 3 pontinhos do último deployment

3. Clique em **"Redeploy"**

4. Aguarde o deploy finalizar

### 5.4 Testar em Produção

Acesse:
```
https://ads-cw.vercel.app/api/health
```

Deve retornar o mesmo JSON de sucesso!

Depois acesse:
```
https://ads-cw.vercel.app
```

Dashboard deve funcionar com dados reais!

---

## Troubleshooting

### Erro: "Token inválido ou expirado"

**Causa:** Token não é válido ou expirou

**Solução:**
1. Gere um novo token no Graph API Explorer
2. Se for token de usuário, estenda a validade
3. Atualize o `.env` com o novo token
4. Reinicie o servidor: `npm run dev`

### Erro: "Sem permissão para acessar esta conta de anúncios"

**Causa:** Token não tem acesso à conta `act_648451459117938`

**Solução:**
1. Verifique se você é Admin da conta de anúncios
2. Se usar System User Token:
   - Vá em Business Settings > Ad Accounts
   - Adicione o System User à conta
   - Dê permissão de Admin ou Advertiser
3. Gere um novo token após adicionar acesso

### Erro: "#200 Ad account owner has NOT granted authorization"

**Causa:** App está em modo Development e você não é Admin/Developer/Tester

**Solução:**
1. Adicione-se como Admin do app:
   - https://developers.facebook.com/apps/
   - Seu app > Roles > Administrators
2. OU publique o app (após aprovação da Meta)

### Erro: "CONFIGURATION_ERROR"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique se o `.env` existe e tem todos os valores
2. Reinicie o servidor após editar `.env`
3. No Vercel, verifique se todas as variáveis estão configuradas

### Dashboard mostra lista vazia

**Causa:** Conta não tem anúncios ou filtros muito restritivos

**Solução:**
1. Verifique se a conta tem anúncios no Meta Ads Manager
2. Remova filtros de status e data
3. Verifique o console do navegador para erros

---

## Checklist Final

Antes de gravar o vídeo de demonstração:

- [ ] Token configurado e válido
- [ ] Health check retorna status "ok"
- [ ] Dashboard mostra lista de anúncios
- [ ] Modal de detalhes abre ao clicar em anúncio
- [ ] Filtros de status funcionam
- [ ] Filtros de data funcionam
- [ ] Botão refresh funciona
- [ ] Métricas aparecem corretamente (impressões, cliques, leads, etc.)
- [ ] Variáveis configuradas no Vercel
- [ ] App em produção funciona: https://ads-cw.vercel.app

---

## Próximos Passos

Após configurar e testar:

1. ✅ Gravar vídeo de demonstração (use o roteiro em `META_VIDEO_RECORDING_SCRIPT.md`)
2. ✅ Copiar respostas das permissões (use `META_APP_PUBLICATION_GUIDE.md`)
3. ✅ Submeter app para revisão da Meta
4. ⏳ Aguardar aprovação (geralmente 1-3 dias úteis)
5. ✅ Após aprovação, gerar System User Token definitivo
6. ✅ Atualizar variáveis no Vercel com o novo token

---

## Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique logs do Vercel (se em produção)
3. Teste o endpoint `/api/health` para diagnóstico
4. Verifique se todas as permissões foram concedidas no token
