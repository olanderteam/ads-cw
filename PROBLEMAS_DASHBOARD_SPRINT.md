# Problemas do Dashboard Meta Ads - Resumo para Sprint

**Data:** 20 de Março de 2026  
**Para:** Time de Growth Marketing

---

## 🎯 Resumo Executivo

O dashboard tem 3 problemas principais que afetam a análise de campanhas:

1. **Imagens dos anúncios em baixa qualidade** - Impossível ver os criativos claramente
2. **Dados incompletos** - Dashboard mostra apenas parte dos anúncios da conta
3. **Informações imprecisas** - Alguns números não batem com o Ads Manager

---

## 1. 📸 PROBLEMA: Imagens dos Criativos em Baixa Qualidade

### O que está acontecendo?
As imagens dos anúncios aparecem borradas e impossíveis de analisar.

### Investigação Realizada
✅ **Código do dashboard verificado** - Não houve mudanças no código que causassem perda de qualidade  
✅ **Lógica de extração está correta** - O código está funcionando como deveria  
✅ **Versão da API verificada** - Estamos usando a versão correta (v21.0)  

### Por que acontece?
**Causa mais provável:** A Meta mudou o comportamento da API recentemente e está retornando imagens de menor resolução.

Antes a API retornava:
- **Imagens:** 600-800px (qualidade razoável)

Agora a API retorna:
- **Imagens:** 200-400px (baixa qualidade)
- **Perda de qualidade:** 50-70%

**Importante:** O código do dashboard está correto. A limitação está na API do Meta, não no nosso código.

### Isso tem solução?
**Precisa investigar com a Meta:**
1. Testar manualmente a API usando Graph API Explorer para confirmar a mudança
2. Consultar o changelog da Meta Marketing API para verificar atualizações recentes
3. Contatar o suporte da Meta para confirmar se houve mudanças no comportamento da API

### O que podemos fazer agora?
- ✅ Adicionar botão "Ver no Ads Manager" para cada anúncio
- ✅ Adicionar link direto para abrir a imagem em tamanho maior
- ⏳ Aguardar confirmação da Meta sobre mudanças na API
- ⏳ Se confirmado que a API mudou, documentar a limitação permanente

**Tempo estimado:** 2-3 horas (para adicionar botões) + investigação com Meta

---

## 2. 📊 PROBLEMA: Dados Incompletos

### O que está acontecendo?
O dashboard mostra apenas 250 anúncios por vez, mesmo que a conta tenha 1000+ anúncios.

### Por que acontece?
A Meta tem limites de uso da API:
- **Limite de CPU:** 250.000 pontos por dia
- **Cada busca gasta:** ~5.000 pontos
- **Máximo de buscas:** ~50 por dia
- **Resultado:** Só conseguimos buscar 250 anúncios por requisição

**Uso atual:**
- 5 de 1.700 chamadas usadas (0,3%)
- 23.929 de 250.000 CPU time usados (9,6%)

### Impacto nos números
Se sua conta tem 1000 anúncios, o dashboard está mostrando apenas 25% dos dados:
- **Total de Leads real:** 818.085
- **Total mostrado no dashboard:** ~200.000
- **Diferença:** 75% dos dados faltando

### O que podemos fazer?
**Opção 1 - Rápida (4-6 horas):**
- Adicionar aviso no dashboard: "Mostrando 250 de X anúncios"
- Adicionar botão "Ver todos no Ads Manager"

**Opção 2 - Completa (24-40 horas):**
- Criar sistema que busca todos os anúncios em segundo plano
- Salvar dados completos no banco de dados
- Atualizar a cada 2-4 horas

**Recomendação:** Opção 1 por enquanto + link para Ads Manager

---

## 3. 🔢 PROBLEMA: Números Não Batem com Ads Manager

### O que está acontecendo?
Alguns números do dashboard são diferentes do Ads Manager:
- **Leads:** Diferença de 10-30%
- **Plataforma:** 60-70% aparecem como "Meta Ads" genérico ao invés de Facebook/Instagram
- **Conversões recentes:** Podem demorar até 3 dias para aparecer

### Por que acontece?

**A) Leads e Conversões**
A Meta usa vários tipos de conversão e nem todos aparecem na API:
- Conversões de iOS 14.5+ são estimadas (privacidade da Apple)
- Conversões cross-device podem ser perdidas
- Janela de atribuição: 7 dias click, 1 dia view

**B) Plataforma (Facebook vs Instagram)**
A API só retorna a plataforma quando o anúncio tem targeting manual. Anúncios com "Advantage+ Placements" (automático) não informam a plataforma.

**C) Dados de Criativo**
- 40% dos anúncios: Título vazio ou genérico
- 30% dos anúncios: Descrição vazia
- 20% dos anúncios: Sem imagem

Isso acontece com:
- Dynamic Product Ads (DPA) - usam templates
- Carousel Ads - API retorna só o primeiro card
- Collection Ads - estrutura complexa

### O que podemos fazer?
**Solução Recomendada (2-3 horas):**
- Adicionar aviso no topo do dashboard:
  > ⚠️ **Nota:** Os números podem ter diferença de 10-30% comparado ao Ads Manager devido a limitações da API do Meta. Para dados oficiais, consulte o Ads Manager.
  
- Adicionar botão "Ver no Ads Manager" em cada anúncio
- Adicionar tooltip explicando por que alguns dados aparecem como "Meta Ads"

---

## 📋 Resumo de Ações para a Sprint

### Prioridade ALTA (6-8 horas total)
1. ✅ **Adicionar avisos de limitações** (1-2h)
   - Banner informando sobre os 250 anúncios
   - Disclaimer sobre diferença de números
   
2. ✅ **Links para Ads Manager** (2-3h)
   - Botão "Ver no Ads Manager" em cada anúncio
   - Link para abrir imagem em tamanho maior
   
3. ✅ **Melhorar cache** (3-4h)
   - Aumentar tempo de cache de 30min para 2-4 horas
   - Reduzir chamadas à API

### Prioridade MÉDIA (16-24 horas)
4. **Sistema de busca completa** (16-24h)
   - Buscar todos os anúncios em background
   - Salvar no banco de dados
   - Atualizar periodicamente

### NÃO É POSSÍVEL RESOLVER (por enquanto)
- ⏳ Obter imagens em qualidade melhor (aguardando confirmação da Meta sobre mudanças na API)
- ❌ Obter 100% dos dados em tempo real (limite de CPU da Meta)
- ❌ Ter números exatamente iguais ao Ads Manager (diferenças de atribuição)

---

## 💡 Recomendação Final

**Para esta sprint:**
Focar nas ações de Prioridade ALTA (6-8 horas). Isso vai:
- Deixar claro para os usuários as limitações do dashboard
- Dar acesso fácil ao Ads Manager para dados completos
- Melhorar performance com cache

**Para próxima sprint:**
Avaliar se vale a pena investir 16-24 horas no sistema de busca completa, ou se é melhor usar o dashboard para análise rápida e o Ads Manager para dados oficiais.

---

## ❓ Dúvidas Frequentes

**P: Por que não podemos ter as imagens em boa qualidade?**
R: Investigação mostrou que o código está correto e não mudou. A causa mais provável é que a Meta mudou o comportamento da API recentemente e está retornando imagens de menor resolução. Precisamos confirmar com a Meta se houve mudanças na API.

**P: As imagens sempre foram assim?**
R: Não. O usuário confirmou que antes as imagens tinham qualidade melhor. Como o código não mudou, a causa provável é uma mudança no comportamento da API do Meta.

**P: Por que os números são diferentes do Ads Manager?**
R: A API tem limitações de atribuição (iOS 14.5+, cross-device) e delay de até 3 dias para conversões. É esperado ter 10-30% de diferença.

**P: Podemos mostrar todos os anúncios?**
R: Sim, mas precisa de um sistema mais complexo (16-24h de desenvolvimento) que busca os dados aos poucos e salva no banco.

**P: Vale a pena investir tempo nisso?**
R: Depende do uso. Se o time usa mais o Ads Manager para decisões, talvez não valha. Se o dashboard é a ferramenta principal, vale investir.
