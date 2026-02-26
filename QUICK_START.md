# Quick Start - Meta API em 5 Passos

## ⚡ Configuração Rápida (15 minutos)

### 1️⃣ Gerar Token (3 min)

1. Acesse: https://developers.facebook.com/tools/explorer/
2. Selecione seu app
3. Clique "Generate Access Token"
4. Selecione permissões:
   - ✅ ads_read
   - ✅ ads_management
   - ✅ business_management
   - ✅ pages_read_engagement
5. Copie o token
6. Clique no "i" → "Open in Access Token Tool" → "Extend Access Token"
7. Copie o token estendido

### 2️⃣ Obter App ID e Secret (2 min)

1. Acesse: https://developers.facebook.com/apps/
2. Selecione seu app
3. Settings > Basic
4. Copie "App ID"
5. Clique "Show" em "App Secret" e copie

### 3️⃣ Configurar .env (1 min)

Edite o arquivo `.env` na raiz do projeto:

```env
META_ACCESS_TOKEN=EAAA... (cole aqui)
META_AD_ACCOUNT_ID=act_648451459117938
META_APP_ID=1234567890 (cole aqui)
META_APP_SECRET=abc123... (cole aqui)
META_API_VERSION=v25.0
```

Salve o arquivo.

### 4️⃣ Testar Localmente (2 min)

```bash
npm run dev
```

Abra no navegador:
- http://localhost:5173/api/health ← Deve retornar `"status": "ok"`
- http://localhost:5173 ← Deve mostrar seus anúncios

### 5️⃣ Configurar Vercel (5 min)

1. Acesse: https://vercel.com/dashboard
2. Selecione projeto: **ads-cw**
3. Settings > Environment Variables
4. Adicione as 5 variáveis do `.env`
5. Deployments > Redeploy

Teste em produção:
- https://ads-cw.vercel.app/api/health
- https://ads-cw.vercel.app

---

## ✅ Checklist de Verificação

Antes de gravar o vídeo:

- [ ] `/api/health` retorna status "ok"
- [ ] Dashboard mostra lista de anúncios
- [ ] Modal abre ao clicar em anúncio
- [ ] Filtro de status funciona
- [ ] Filtro de data funciona
- [ ] Botão refresh funciona
- [ ] Métricas aparecem (impressões, cliques, leads)
- [ ] Produção funciona: https://ads-cw.vercel.app

---

## 🎥 Próximos Passos

1. Gravar vídeo → Use `META_VIDEO_RECORDING_SCRIPT.md`
2. Copiar respostas → Use `META_APP_PUBLICATION_GUIDE.md`
3. Submeter para revisão → https://developers.facebook.com/apps/

---

## 🆘 Problemas?

### Dashboard vazio
→ Verifique `/api/health` e console do navegador (F12)

### Erro 401
→ Token inválido, gere um novo

### Erro 403
→ Sem acesso à conta, adicione System User

### Erro 200
→ App em Development, adicione-se como Admin

---

## 📚 Documentação Completa

- **`SETUP_META_API.md`** - Guia detalhado passo a passo
- **`META_APP_PUBLICATION_GUIDE.md`** - Respostas para Meta
- **`META_VIDEO_RECORDING_SCRIPT.md`** - Roteiro do vídeo
- **`MIGRATION_SUMMARY.md`** - Resumo técnico completo

---

## 🚀 Tudo Pronto!

Código 100% implementado. Só falta configurar credenciais e testar! 

Boa sorte com a aprovação! 🎉
