# Bugfix Requirements Document

## Introduction

O dashboard Meta Ads está retornando dados incompletos e não está funcionando corretamente. A investigação inicial indica que o token de acesso Meta (META_ACCESS_TOKEN) expirou, impedindo que a aplicação faça chamadas bem-sucedidas à Meta Marketing API. O usuário já gerou um novo token de acesso com validade estendida que precisa ser configurado nos arquivos de ambiente.

**Impacto:** O dashboard não consegue buscar dados atualizados dos anúncios, resultando em falhas de API ou dados desatualizados para os usuários.

**Token Atual (Expirado):**
```
EAAS7gYaF3mgBQxDEU5FH59JHkpMhZAC75MZCDuRy8gtZA7j5dtq1b3WDIpj6WGDIRfuzkZBVcgtkrZCjKHnj3t6s6EpDrO40XeyIuk8evD805TyYjnwZALYJxYuZCZAInuXWIgzE0bo6pS7vCRBl70ZAhVsFKSRKXwtNH9e53kz6xZA2sFMXzZA12qMklL4xvXWRZB5c4QZDZD
```

**Novo Token (Válido):**
```
EAAS7gYaF3mgBRKT5QeVGr3OZBuYPaXyA6Ew103tKfytH4C4lr32e6DZARicfTDAGLBemHdyXPWK2Vv5XujDkTt14rdZCmJjBozWKstaImdNZB3mNfuBRoSOy7TR1V1EZC0fkSKiKRQ4lKFZB4t3hSkjnxa5AjRWojJ9NwBTbETKNyw7deRcsbBA1G13sfkcwZDZD
```

**Account ID:** act_648451459117938

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o dashboard tenta buscar dados de anúncios da Meta API THEN o sistema retorna erro de autenticação ou dados vazios devido ao token expirado

1.2 WHEN o usuário acessa o dashboard THEN o sistema não consegue carregar os anúncios ou mostra dados desatualizados

1.3 WHEN a aplicação faz chamadas à Meta Marketing API com o token expirado THEN a API retorna erro 190 (OAuthException - Access token has expired) ou erro 401 (Unauthorized)

### Expected Behavior (Correct)

2.1 WHEN o dashboard tenta buscar dados de anúncios da Meta API com o novo token válido THEN o sistema SHALL retornar dados atualizados dos anúncios com sucesso

2.2 WHEN o usuário acessa o dashboard com o token atualizado THEN o sistema SHALL carregar e exibir os anúncios corretamente

2.3 WHEN a aplicação faz chamadas à Meta Marketing API com o novo token válido THEN a API SHALL retornar status 200 (OK) com os dados solicitados

### Unchanged Behavior (Regression Prevention)

3.1 WHEN o token é atualizado nos arquivos de ambiente THEN o sistema SHALL CONTINUE TO usar as mesmas configurações de META_AD_ACCOUNT_ID, META_API_VERSION, META_APP_ID e META_APP_SECRET

3.2 WHEN o token é atualizado THEN o sistema SHALL CONTINUE TO fazer as mesmas chamadas à API com os mesmos parâmetros (limit, fields, date_preset)

3.3 WHEN o token é atualizado THEN o sistema SHALL CONTINUE TO processar e exibir os dados dos anúncios da mesma forma no frontend

3.4 WHEN o token é atualizado THEN o sistema SHALL CONTINUE TO usar o cache Redis com o mesmo TTL (30 minutos)

## Bug Condition

### Bug Condition Function

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type APIRequest
  OUTPUT: boolean
  
  // Returns true when the access token is expired
  RETURN X.accessToken = "EAAS7gYaF3mgBQxDEU5FH59JHkpMhZAC75MZCDuRy8gtZA7j5dtq1b3WDIpj6WGDIRfuzkZBVcgtkrZCjKHnj3t6s6EpDrO40XeyIuk8evD805TyYjnwZALYJxYuZCZAInuXWIgzE0bo6pS7vCRBl70ZAhVsFKSRKXwtNH9e53kz6xZA2sFMXzZA12qMklL4xvXWRZB5c4QZDZD"
END FUNCTION
```

### Property Specification

```pascal
// Property: Fix Checking - Token Update
FOR ALL X WHERE isBugCondition(X) DO
  result ← fetchMetaAds'(X)
  ASSERT result.status = 200 AND result.data.length > 0 AND no_auth_error(result)
END FOR
```

**Key Definitions:**
- **F**: fetchMetaAds com token expirado - retorna erro de autenticação
- **F'**: fetchMetaAds com novo token válido - retorna dados com sucesso

### Preservation Goal

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT F(X) = F'(X)
END FOR
```

Isso garante que para todas as requisições que não usam o token expirado (ou seja, requisições com outros tokens válidos ou configurações diferentes), o comportamento permanece idêntico.

## Counterexample

**Exemplo concreto demonstrando o bug:**

```javascript
// Requisição atual (com token expirado)
const response = await fetch(
  'https://graph.facebook.com/v25.0/act_648451459117938/ads',
  {
    headers: {
      'Authorization': 'Bearer EAAS7gYaF3mgBQxDEU5FH59JHkpMhZAC75MZCDuRy8gtZA7j5dtq1b3WDIpj6WGDIRfuzkZBVcgtkrZCjKHnj3t6s6EpDrO40XeyIuk8evD805TyYjnwZALYJxYuZCZAInuXWIgzE0bo6pS7vCRBl70ZAhVsFKSRKXwtNH9e53kz6xZA2sFMXzZA12qMklL4xvXWRZB5c4QZDZD'
    }
  }
);

// Resultado: 
// Status: 401 ou 190
// Error: "OAuthException: Access token has expired"
// Data: null ou []
```

**Comportamento esperado após o fix:**

```javascript
// Requisição com novo token válido
const response = await fetch(
  'https://graph.facebook.com/v25.0/act_648451459117938/ads',
  {
    headers: {
      'Authorization': 'Bearer EAAS7gYaF3mgBRKT5QeVGr3OZBuYPaXyA6Ew103tKfytH4C4lr32e6DZARicfTDAGLBemHdyXPWK2Vv5XujDkTt14rdZCmJjBozWKstaImdNZB3mNfuBRoSOy7TR1V1EZC0fkSKiKRQ4lKFZB4t3hSkjnxa5AjRWojJ9NwBTbETKNyw7deRcsbBA1G13sfkcwZDZD'
    }
  }
);

// Resultado esperado:
// Status: 200
// Data: Array com anúncios [{id: "...", name: "...", ...}, ...]
// No errors
```

## Arquivos Afetados

Os seguintes arquivos de configuração precisam ser atualizados:

1. `.env` - Arquivo de configuração principal
2. `.env.development.local` - Arquivo de configuração para desenvolvimento local
3. `.env.local` - Arquivo de configuração local (se usado)

**Nota:** Para produção no Vercel, as variáveis de ambiente também precisam ser atualizadas no dashboard do Vercel.
