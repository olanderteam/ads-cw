# Como Testar a API do Meta Manualmente

## Objetivo

Confirmar se a Meta mudou o comportamento da API e está retornando imagens de menor resolução.

## Passo a Passo

### 1. Acessar o Graph API Explorer

1. Abra o navegador e acesse: https://developers.facebook.com/tools/explorer/
2. Faça login com sua conta Meta/Facebook
3. Selecione seu aplicativo no dropdown "Meta App"

### 2. Configurar a Requisição

1. No campo "Add a Permission", adicione as permissões:
   - `ads_read`
   - `ads_management`
   
2. Clique em "Generate Access Token"

3. No campo de URL (onde está escrito "me?fields=id,name"), cole:

```
act_648451459117938/ads?fields=id,name,creative{id,name,image_url,thumbnail_url,object_story_spec}&limit=5
```

**Nota:** Substitua `act_648451459117938` pelo seu Ad Account ID se for diferente.

### 3. Executar a Requisição

1. Clique no botão "Submit" (ou pressione Enter)
2. Aguarde a resposta aparecer no painel direito

### 4. Analisar os Resultados

Procure pelos campos de imagem na resposta:

```json
{
  "data": [
    {
      "id": "123456789",
      "name": "Nome do Anúncio",
      "creative": {
        "id": "987654321",
        "name": "Nome do Criativo",
        "image_url": "https://scontent.xx.fbcdn.net/v/t45.1600-4/...",
        "thumbnail_url": "https://scontent.xx.fbcdn.net/v/t45.1600-4/..."
      }
    }
  ]
}
```

### 5. Verificar a Qualidade das URLs

Copie as URLs de `image_url` e `thumbnail_url` e cole no navegador para ver as imagens.

**O que verificar:**
- Qual é o tamanho (largura x altura) das imagens?
- A qualidade está boa ou está borrada?
- Compare com as imagens que você vê no Ads Manager

### 6. Testar com Versões Antigas da API

Para confirmar se houve mudança, teste com versões antigas da API:

**Versão atual (v21.0):**
```
v21.0/act_648451459117938/ads?fields=creative{image_url,thumbnail_url}&limit=5
```

**Versão anterior (v20.0):**
```
v20.0/act_648451459117938/ads?fields=creative{image_url,thumbnail_url}&limit=5
```

**Versão mais antiga (v19.0):**
```
v19.0/act_648451459117938/ads?fields=creative{image_url,thumbnail_url}&limit=5
```

Compare as URLs retornadas por cada versão. Se as URLs forem diferentes, isso confirma que a Meta mudou o comportamento.

## O Que Fazer com os Resultados

### Se as imagens estiverem em BAIXA qualidade:

✅ **Confirmado:** A Meta está retornando imagens de baixa qualidade via API.

**Próximos passos:**
1. Consultar o changelog da Meta: https://developers.facebook.com/docs/graph-api/changelog
2. Procurar por mudanças relacionadas a `image_url`, `thumbnail_url`, ou `creative`
3. Contatar o suporte da Meta para confirmar se é uma mudança permanente

### Se as imagens estiverem em BOA qualidade:

❓ **Investigar mais:** Se a API retorna imagens boas, mas o dashboard mostra imagens ruins, pode ser:
- Problema de cache (imagens antigas em cache)
- Problema de proxy/CDN
- Problema de compressão no frontend

**Próximos passos:**
1. Limpar cache do navegador
2. Verificar se há proxy/CDN entre o dashboard e a Meta
3. Verificar se o frontend está comprimindo as imagens

### Se versões antigas retornam imagens MELHORES:

✅ **Confirmado:** A Meta mudou o comportamento na versão mais recente.

**Solução:**
- Usar uma versão antiga da API (ex: v20.0 ou v19.0)
- Atualizar a variável de ambiente `META_API_VERSION` no Vercel

## Contato com Suporte da Meta

Se confirmar que a API mudou, você pode:

1. **Abrir um bug report:**
   - Acesse: https://developers.facebook.com/support/bugs/
   - Descreva o problema: "image_url and thumbnail_url returning lower resolution images in v21.0"
   - Inclua exemplos de URLs antigas vs novas

2. **Postar no fórum de desenvolvedores:**
   - Acesse: https://developers.facebook.com/community/
   - Procure por tópicos relacionados ou crie um novo

3. **Verificar status da API:**
   - Acesse: https://developers.facebook.com/status/
   - Veja se há incidentes reportados

## Informações Úteis

**Documentação da API:**
- Creative Object: https://developers.facebook.com/docs/marketing-api/reference/ad-creative/
- Image Fields: https://developers.facebook.com/docs/marketing-api/reference/ad-image/

**Changelog da API:**
- https://developers.facebook.com/docs/graph-api/changelog

**Seu Ad Account ID:**
- `act_648451459117938`

**Versão atual da API no dashboard:**
- `v21.0`

---

**Data:** 20 de março de 2026  
**Criado para:** Investigação de qualidade de imagens dos criativos
