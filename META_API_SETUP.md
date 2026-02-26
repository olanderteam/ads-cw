# Configuração da Meta Marketing API

## Passo a Passo para Configurar

### 1. Obter Access Token

#### Opção A: Token de Usuário (para testes)

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu app no dropdown
3. Clique em "Generate Access Token"
4. Selecione as permissões necessárias:
   - `ads_read`
   - `ads_management`
   - `business_management`
   - `pages_read_engagement` (opcional)
5. Clique em "Generate Access Token"
6. Copie o token gerado

**Importante:** Tokens de usuário expiram em 60 dias.

#### Opção B: System User Token (recomendado para produção)

1. Acesse: https://business.facebook.com/settings/system-users
2. Clique em "Add" para criar um System User
3. Dê um nome (ex: "Dashboard API User")
4. Selecione role: "Admin"
5. Clique em "Create System User"
6. Clique em "Add Assets" > "Ad Accounts"
7. Selecione sua conta de anúncios
8. Marque "Manage Ad Account"
9. Clique em "Generate New Token"
10. Selecione as permissões:
    - `ads_read`
    - `ads_management`
    - `business_management`
    - `pages_read_engagement` (opcional)
11. Copie o token gerado

**Vantagem:** System User Tokens nunca expiram!

---

### 2. Obter App ID e App Secret

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app
3. Vá em "Settings" > "Basic"
4. Copie:
   - **App ID**
   - **App Secret** (clique em "Show" para revelar)

---

### 3. Obter Ad Account ID

1. Acesse: https://business.facebook.com/settings/ad-accounts
2. Clique na sua conta de anúncios
3. O ID está na URL: `act_XXXXXXXXXX`
4. Ou copie diretamente da página

---

### 4. Configurar Variáveis de Ambiente

#### Desenvolvimento Local

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite `.env` e adicione suas credenciais:
   ```env
   META_ACCESS_TOKEN=seu_token_aqui
   META_AD_ACCOUNT_ID=act_648451459117938
   META_APP_ID=seu_app_id_aqui
   META_APP_SECRET=seu_app_secret_aqui
   META_API_VERSION=v21.0
   ```

#### Produção (Vercel)

1. Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables
2. Adicione cada variável:
   - `META_ACCESS_TOKEN` = seu token
   - `META_AD_ACCOUNT_ID` = act_648451459117938
   - `META_APP_ID` = seu app id
   - `META_APP_SECRET` = seu app secret
   - `META_API_VERSION` = v21.0
3. Selecione os ambientes: Production, Preview, Development
4. Clique em "Save"
5. Faça redeploy do projeto

---

### 5. Testar a Configuração

#### Teste Local

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse o health check:
   ```
   http://localhost:5173/api/health
   ```

3. Você deve ver uma resposta JSON com:
   ```json
   {
     "status": "ok",
     "message": "Integração Meta API funcionando corretamente",
     "token": {
       "valid": true,
       "type": "SYSTEM_USER",
       "expiresIn": "Nunca (System User Token)",
       "scopes": ["ads_read", "ads_management", "business_management"]
     },
     "account": {
       "id": "act_648451459117938",
       "name": "Nome da Conta",
       "status": "ACTIVE",
       "currency": "BRL",
       "timezone": "America/Sao_Paulo"
     }
   }
   ```

#### Teste em Produção

1. Acesse:
   ```
   https://ads-cw.vercel.app/api/health
   ```

2. Verifique se o status é "ok"

---

### 6. Testar o Dashboard

1. Acesse o dashboard:
   - Local: http://localhost:5173
   - Produção: https://ads-cw.vercel.app

2. Você deve ver:
   - Lista de anúncios da sua conta
   - Métricas (impressões, cliques, CTR, gasto, leads)
   - Filtros funcionando (status, data)

---

## Troubleshooting

### Erro: "Token inválido ou expirado"

**Causa:** Token não é válido ou expirou

**Solução:**
1. Gere um novo token no Graph API Explorer
2. Atualize a variável `META_ACCESS_TOKEN`
3. Para produção, use System User Token que não expira

---

### Erro: "Sem acesso à conta de anúncios"

**Causa:** Token não tem permissão para acessar a conta

**Solução:**
1. Verifique se o Ad Account ID está correto
2. Verifique se o token tem as permissões necessárias
3. Se usar System User, adicione a conta de anúncios aos assets do System User

---

### Erro: "META_ACCESS_TOKEN must be configured"

**Causa:** Variáveis de ambiente não estão configuradas

**Solução:**
1. Verifique se o arquivo `.env` existe (local)
2. Verifique se as variáveis estão configuradas no Vercel (produção)
3. Faça redeploy após adicionar variáveis

---

### Erro: "#200 Ad account owner has NOT granted authorization"

**Causa:** App está em modo Development

**Solução:**
1. Publique o app na Meta (siga o guia META_APP_PUBLICATION_GUIDE.md)
2. Ou adicione seu usuário como Admin/Developer/Tester do app

---

### Nenhum anúncio aparece

**Causa:** Conta não tem anúncios ou filtros muito restritivos

**Solução:**
1. Verifique se a conta tem anúncios ativos
2. Remova filtros (selecione "Todos" no status)
3. Verifique o período de data selecionado

---

## Verificação de Permissões

Para verificar se o token tem todas as permissões necessárias:

1. Acesse: https://developers.facebook.com/tools/debug/accesstoken/
2. Cole seu token
3. Clique em "Debug"
4. Verifique se tem as permissões:
   - `ads_read`
   - `ads_management`
   - `business_management`

Se faltar alguma permissão, gere um novo token com todas as permissões.

---

## Monitoramento

### Health Check Endpoint

Use o endpoint `/api/health` para monitorar a saúde da integração:

```bash
curl https://ads-cw.vercel.app/api/health
```

Você pode configurar um serviço de monitoramento (como UptimeRobot, Pingdom, etc.) para verificar este endpoint periodicamente.

### Logs

Para ver logs de erro:

1. **Local:** Verifique o console do navegador e terminal
2. **Produção:** Acesse Vercel Dashboard > seu projeto > Logs

---

## Próximos Passos

Após configurar e testar:

1. ✅ Verifique que o health check retorna "ok"
2. ✅ Verifique que anúncios aparecem no dashboard
3. ✅ Teste os filtros (status, data)
4. ✅ Teste o modal de detalhes
5. ✅ Grave o vídeo de demonstração (use META_VIDEO_RECORDING_SCRIPT.md)
6. ✅ Submeta o app para revisão da Meta (use META_APP_PUBLICATION_GUIDE.md)
