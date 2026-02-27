# Configurar Variáveis de Ambiente no Vercel

## ⚠️ IMPORTANTE: Faça isso AGORA!

O código já foi enviado para o GitHub e o Vercel está fazendo o deploy automaticamente. Mas o deploy vai FALHAR se você não configurar as variáveis de ambiente primeiro!

---

## Passo a Passo (5 minutos)

### 1. Acessar Dashboard do Vercel

Acesse: https://vercel.com/gabes-projects-97f403fa/ads-cw/settings/environment-variables

OU

1. Vá para: https://vercel.com/dashboard
2. Clique no projeto: **ads-cw**
3. Clique em **"Settings"** (no topo)
4. No menu lateral, clique em **"Environment Variables"**

### 2. Adicionar Cada Variável

Para cada variável abaixo, clique em **"Add New"** e preencha:

#### Variável 1: META_ACCESS_TOKEN

- **Name**: `META_ACCESS_TOKEN`
- **Value**: `EAAS7gYaF3mgBQxDEU5FH59JHkpMhZAC75MZCDuRy8gtZA7j5dtq1b3WDIpj6WGDIRfuzkZBVcgtkrZCjKHnj3t6s6EpDrO40XeyIuk8evD805TyYjnwZALYJxYuZCZAInuXWIgzE0bo6pS7vCRBl70ZAhVsFKSRKXwtNH9e53kz6xZA2sFMXzZA12qMklL4xvXWRZB5c4QZDZD`
- **Environments**: Marque ✅ Production, ✅ Preview, ✅ Development
- Clique em **"Save"**

#### Variável 2: META_AD_ACCOUNT_ID

- **Name**: `META_AD_ACCOUNT_ID`
- **Value**: `act_648451459117938`
- **Environments**: Marque ✅ Production, ✅ Preview, ✅ Development
- Clique em **"Save"**

#### Variável 3: META_APP_ID

- **Name**: `META_APP_ID`
- **Value**: `1332064888938088`
- **Environments**: Marque ✅ Production, ✅ Preview, ✅ Development
- Clique em **"Save"**

#### Variável 4: META_APP_SECRET

- **Name**: `META_APP_SECRET`
- **Value**: `5c36d7b2efe9ac959cd05e0cca2f9c95`
- **Environments**: Marque ✅ Production, ✅ Preview, ✅ Development
- Clique em **"Save"**

#### Variável 5: META_API_VERSION

- **Name**: `META_API_VERSION`
- **Value**: `v25.0`
- **Environments**: Marque ✅ Production, ✅ Preview, ✅ Development
- Clique em **"Save"**

### 3. Verificar Variáveis Configuradas

Você deve ver 5 variáveis na lista:

- ✅ META_ACCESS_TOKEN
- ✅ META_AD_ACCOUNT_ID
- ✅ META_APP_ID
- ✅ META_APP_SECRET
- ✅ META_API_VERSION

### 4. Fazer Redeploy

1. Clique em **"Deployments"** (no topo)
2. Encontre o deployment mais recente (deve estar "Building" ou "Ready")
3. Clique nos **3 pontinhos** (⋮) ao lado do deployment
4. Clique em **"Redeploy"**
5. Confirme clicando em **"Redeploy"** novamente
6. Aguarde o deploy finalizar (1-2 minutos)

### 5. Testar em Produção

Após o deploy finalizar, teste:

#### Health Check
Acesse: https://ads-cw.vercel.app/api/health

**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Integração Meta API funcionando corretamente",
  "token": {
    "valid": true,
    "type": "SYSTEM_USER",
    "expiresIn": "Nunca (System User Token)",
    "scopes": ["ads_read", "business_management", ...]
  },
  "account": {
    "id": "act_648451459117938",
    "name": "...",
    "status": "ACTIVE",
    "currency": "BRL"
  }
}
```

#### Dashboard
Acesse: https://ads-cw.vercel.app

Você deve ver a lista de anúncios da sua conta!

---

## ✅ Checklist Final

Após configurar:

- [ ] 5 variáveis adicionadas no Vercel
- [ ] Redeploy feito
- [ ] `/api/health` retorna status "ok"
- [ ] Dashboard mostra anúncios
- [ ] Modal abre ao clicar em anúncio
- [ ] Filtros funcionam

---

## 🎥 Próximo Passo

Quando tudo estiver funcionando:

1. Grave o vídeo de demonstração usando: `META_VIDEO_RECORDING_SCRIPT.md`
2. Use as respostas em: `META_APP_PUBLICATION_GUIDE.md`
3. Submeta para revisão da Meta!

---

## 🆘 Problemas?

### Deploy falha com erro de variáveis

→ Verifique se todas as 5 variáveis foram adicionadas corretamente

### /api/health retorna erro 401

→ Token inválido. Gere um novo token e atualize a variável META_ACCESS_TOKEN

### /api/health retorna erro 403

→ Token não tem acesso à conta. Verifique se você é Admin da conta de anúncios

### Dashboard não mostra anúncios

→ Abra o console do navegador (F12) e veja os erros. Teste `/api/health` primeiro.

---

## 📞 Link Direto

Configurar variáveis agora:
https://vercel.com/gabes-projects-97f403fa/ads-cw/settings/environment-variables
