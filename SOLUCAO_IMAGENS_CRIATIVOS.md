# Investigação: Qualidade das Imagens dos Criativos

## Resumo da Investigação

Após análise detalhada do histórico do código e comparação entre versões, **NÃO foi encontrada nenhuma mudança no código** que explique a perda de qualidade das imagens.

## O Que Foi Verificado

### 1. Comparação de Código (Commit 689f2ea1 vs Atual)

A lógica de extração de thumbnails é **IDÊNTICA** entre a versão "que funcionava bem" (689f2ea1) e a versão atual:

```typescript
// Extract thumbnail with better fallbacks
let thumbnail = '';
if (creative.thumbnail_url) {
  thumbnail = creative.thumbnail_url;
} else if (creative.image_url) {
  thumbnail = creative.image_url;
} else if (creative.video_thumbnail_url) {
  thumbnail = creative.video_thumbnail_url;
} else if (creative.object_story_spec?.link_data?.picture) {
  thumbnail = creative.object_story_spec.link_data.picture;
}
```

**Conclusão**: O código não mudou. A lógica é a mesma.

### 2. Versão da API

- Versão configurada: `v21.0` (Meta Marketing API)
- Campos solicitados: `creative{id,name,title,body,image_url,video_id,thumbnail_url,object_url,link_url,call_to_action_type,object_story_spec,asset_feed_spec}`

**Conclusão**: A versão da API e os campos solicitados estão corretos e não mudaram.

### 3. Histórico de Commits Relacionados

- `4559a85a` - "feat: improve creative image quality using image_hash" (tentativa de melhorar qualidade)
- `bd9640aa` - "fix: improve creative image quality by removing size restrictions" (outra tentativa)
- `69ff12f2` - "fix: revert to original thumbnail extraction logic that worked" (reverteu para lógica original)
- `92392506` - "correcao dashboard4" (commit atual)

**Conclusão**: Houve tentativas de "melhorar" a qualidade nos commits 4559a85a e bd9640aa, mas essas mudanças foram revertidas no commit 69ff12f2, voltando para a lógica original.

## Possíveis Causas da Perda de Qualidade

Como o código não mudou, as possíveis causas são:

### 1. Mudança na Meta Marketing API (Mais Provável)

A Meta pode ter alterado o comportamento da API:
- Redução automática de qualidade das imagens retornadas
- Mudança nos campos `thumbnail_url` e `image_url` para retornar URLs de menor resolução
- Atualização silenciosa da API que afeta a qualidade das imagens

### 2. Mudança nos Criativos Originais

- Os criativos mais recentes podem ter sido criados com imagens de menor resolução
- Mudança no formato de upload dos criativos no Meta Ads Manager

### 3. Mudança nas Configurações da Conta Meta

- Configurações de otimização de imagens na conta Meta Ads
- Configurações de compressão automática

## Limitações da Meta Marketing API

A Meta Marketing API **NÃO fornece acesso às imagens originais em alta resolução**. Os campos disponíveis são:

- `thumbnail_url` - URL de thumbnail (geralmente 200-400px)
- `image_url` - URL da imagem (geralmente 400-600px)
- `image_hash` - Hash da imagem (não pode ser usado para construir URLs de alta resolução)

**As imagens originais (1080px+) NÃO estão disponíveis via API.**

## Próximos Passos Recomendados

### Opção 1: Verificar Mudanças na Meta API (Recomendado)

1. Consultar o changelog da Meta Marketing API para verificar mudanças recentes
2. Testar com diferentes versões da API (v20.0, v19.0) para ver se há diferença
3. Contatar o suporte da Meta para confirmar se houve mudanças

### Opção 2: Usar Graph API Explorer para Comparar

1. Acessar https://developers.facebook.com/tools/explorer/
2. Fazer uma requisição manual para um criativo específico
3. Comparar as URLs retornadas com as URLs antigas (se disponíveis)
4. Verificar se as URLs retornadas pela API mudaram

### Opção 3: Investigar Criativos Específicos

1. Selecionar um criativo que "funcionava bem antes"
2. Verificar se esse mesmo criativo ainda retorna imagens de boa qualidade
3. Comparar com criativos mais recentes

### Opção 4: Aceitar Limitação da API

Se a Meta realmente mudou o comportamento da API:
- Documentar a limitação para a equipe de marketing
- Ajustar expectativas sobre a qualidade das imagens no dashboard
- Considerar soluções alternativas (ex: armazenar imagens localmente ao criar criativos)

## Conclusão

**O código do dashboard NÃO causou a perda de qualidade.** A lógica de extração de thumbnails está correta e não mudou desde a versão "que funcionava bem".

A causa mais provável é uma **mudança no comportamento da Meta Marketing API** que está retornando imagens de menor resolução nos campos `thumbnail_url` e `image_url`.

Para confirmar, é necessário:
1. Testar manualmente a API usando Graph API Explorer
2. Comparar as URLs retornadas hoje com URLs antigas (se disponíveis)
3. Consultar o changelog da Meta ou contatar o suporte

---

**Data da Investigação**: 20 de março de 2026
**Commits Analisados**: 689f2ea1 (última versão "funcionando bem") até 92392506 (atual)
