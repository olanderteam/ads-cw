import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2, Info } from "lucide-react";

interface HealthData {
  status: 'ok' | 'error';
  message: string;
  token?: {
    valid: boolean;
    type?: string;
    expiresIn?: string;
    expirationWarning?: string | null;
    scopes?: string[];
  };
  account?: {
    id: string;
    name: string;
    status: string;
    currency: string;
    timezone: string;
  };
  timestamp?: string;
}

const ENV_VARS = [
  { name: 'META_ACCESS_TOKEN', description: 'Token de acesso à Meta Graph API' },
  { name: 'META_AD_ACCOUNT_ID', description: 'ID da conta de anúncios (ex: act_123456)' },
  { name: 'META_APP_ID', description: 'App ID da Meta para validação do token' },
  { name: 'META_APP_SECRET', description: 'App Secret para construir o app_access_token' },
  { name: 'ALLOWED_ORIGINS', description: 'Origens permitidas separadas por vírgula (ex: https://seu-dominio.vercel.app)' },
  { name: 'META_API_VERSION', description: 'Versão da API (opcional, padrão: v21.0)' },
];

const Settings = () => {
  const { data: health, isLoading, error } = useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: () => fetch('/api/health').then((r) => r.json()),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isOk = health?.status === 'ok';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <MobileNav />

      <div className="flex-1 flex flex-col min-w-0 p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configurações e status da integração
          </p>
        </div>

        {/* Configuration info card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Configuração da Integração Meta API</CardTitle>
            </div>
            <CardDescription>
              O token de acesso e as credenciais da Meta API são configurados via variáveis de
              ambiente no servidor Vercel — não é possível alterá-los por esta interface.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Configure as seguintes variáveis de ambiente no painel do Vercel
              (Settings → Environment Variables):
            </p>
            <div className="space-y-2">
              {ENV_VARS.map((v) => (
                <div key={v.name} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground whitespace-nowrap">
                    {v.name}
                  </code>
                  <span className="text-xs text-muted-foreground">{v.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration status card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : isOk ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <CardTitle>Status da Integração</CardTitle>
            </div>
            <CardDescription>
              Verificação em tempo real da conexão com a Meta API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <p className="text-sm text-muted-foreground">Verificando integração…</p>
            )}

            {!isLoading && (error || !isOk) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">Erro</Badge>
                  <span className="text-sm text-destructive">
                    {health?.message || (error instanceof Error ? error.message : 'Erro ao verificar integração')}
                  </span>
                </div>
                {health?.token && !health.token.valid && (
                  <p className="text-xs text-muted-foreground">
                    Token inválido ou expirado. Atualize a variável META_ACCESS_TOKEN no Vercel.
                  </p>
                )}
              </div>
            )}

            {!isLoading && isOk && health && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/10 text-success border-0 text-xs">Conectado</Badge>
                  <span className="text-sm text-muted-foreground">{health.message}</span>
                </div>

                {health.account && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Conta</span>
                      <p className="font-medium text-foreground">{health.account.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Status da Conta</span>
                      <p className="font-medium text-foreground">{health.account.status}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Moeda</span>
                      <p className="font-medium text-foreground">{health.account.currency}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Fuso Horário</span>
                      <p className="font-medium text-foreground">{health.account.timezone}</p>
                    </div>
                  </div>
                )}

                {health.token && (
                  <div className="grid grid-cols-2 gap-3 text-sm border-t border-border pt-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Tipo de Token</span>
                      <p className="font-medium text-foreground">{health.token.type || '—'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Expira em</span>
                      <p className="font-medium text-foreground">{health.token.expiresIn || '—'}</p>
                    </div>
                    {health.token.expirationWarning && (
                      <div className="col-span-2">
                        <p className="text-xs text-warning">{health.token.expirationWarning}</p>
                      </div>
                    )}
                  </div>
                )}

                {health.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    Verificado em: {new Date(health.timestamp).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
