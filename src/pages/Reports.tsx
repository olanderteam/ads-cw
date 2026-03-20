import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAds } from "@/hooks/use-ads";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Target, DollarSign } from "lucide-react";

const Reports = () => {
    const { data: ads = [] } = useAds();

    // Calcular métricas agregadas
    const metrics = useMemo(() => {
        const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
        const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
        const totalSpend = ads.reduce((sum, ad) => sum + ad.spend, 0);
        const totalLeads = ads.reduce((sum, ad) => sum + ad.leads, 0);
        const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        const avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;

        return {
            totalImpressions,
            totalClicks,
            totalSpend,
            totalLeads,
            avgCTR,
            avgCostPerLead
        };
    }, [ads]);

    // Top performers por CTR
    const topPerformersByCTR = useMemo(() => {
        return [...ads]
            .filter(ad => ad.impressions > 100) // Mínimo de impressões
            .sort((a, b) => b.ctr - a.ctr)
            .slice(0, 5);
    }, [ads]);

    // Top performers por conversões
    const topPerformersByLeads = useMemo(() => {
        return [...ads]
            .filter(ad => ad.leads > 0)
            .sort((a, b) => b.leads - a.leads)
            .slice(0, 5);
    }, [ads]);

    // Top performers por ROI (leads / spend)
    const topPerformersByROI = useMemo(() => {
        return ads
            .filter(ad => ad.spend > 0 && ad.leads > 0)
            .map(ad => ({
                id: ad.id,
                headline: ad.headline,
                leads: ad.leads,
                spend: ad.spend,
                roi: ad.leads / ad.spend
            }))
            .sort((a, b) => b.roi - a.roi)
            .slice(0, 5);
    }, [ads]);

    // Dados para gráfico de desempenho (simulado - em produção viria da API com breakdown por data)
    const performanceData = useMemo(() => {
        // Agrupa por plataforma para simular dados ao longo do tempo
        const platformData = ads.reduce((acc, ad) => {
            const platform = ad.platform || 'Meta Ads';
            if (!acc[platform]) {
                acc[platform] = {
                    impressions: 0,
                    clicks: 0,
                    spend: 0
                };
            }
            acc[platform].impressions += ad.impressions;
            acc[platform].clicks += ad.clicks;
            acc[platform].spend += ad.spend;
            return acc;
        }, {} as Record<string, any>);

        return Object.entries(platformData).map(([name, data]) => ({
            name,
            ...data
        }));
    }, [ads]);

    return (
        <div className="flex min-h-screen w-full bg-background">
            <AppSidebar />
            <MobileNav />

            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Análise de desempenho e insights dos seus anúncios
                        </p>
                    </div>

                    {/* Métricas Resumidas */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total de Impressões</CardTitle>
                                <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Alcance total dos anúncios
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metrics.avgCTR.toFixed(2)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Taxa de cliques média
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Custo por Lead</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">R$ {metrics.avgCostPerLead.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Custo médio por conversão
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráficos de Desempenho */}
                    <Tabs defaultValue="performance" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="performance">Desempenho</TabsTrigger>
                            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
                        </TabsList>

                        <TabsContent value="performance" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Impressões por Plataforma</CardTitle>
                                        <CardDescription>Distribuição de impressões</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={performanceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="impressions" fill="#8b5cf6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Gastos por Plataforma</CardTitle>
                                        <CardDescription>Distribuição de investimento</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={performanceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="spend" fill="#10b981" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="top-performers" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {/* Top por CTR */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-yellow-500" />
                                            Top 5 por CTR
                                        </CardTitle>
                                        <CardDescription>Anúncios com melhor taxa de cliques</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {topPerformersByCTR.map((ad, index) => (
                                                <div key={ad.id} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-sm font-semibold text-yellow-600">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{ad.headline}</p>
                                                        <p className="text-xs text-muted-foreground">CTR: {ad.ctr.toFixed(2)}%</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top por Conversões */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-green-500" />
                                            Top 5 por Conversões
                                        </CardTitle>
                                        <CardDescription>Anúncios com mais leads</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {topPerformersByLeads.map((ad, index) => (
                                                <div key={ad.id} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-sm font-semibold text-green-600">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{ad.headline}</p>
                                                        <p className="text-xs text-muted-foreground">{ad.leads} leads</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Top por ROI */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-blue-500" />
                                            Top 5 por ROI
                                        </CardTitle>
                                        <CardDescription>Melhor retorno sobre investimento</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {topPerformersByROI.map((ad, index) => (
                                                <div key={ad.id} className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-sm font-semibold text-blue-600">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{ad.headline}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {ad.roi.toFixed(2)} leads/R$
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Reports;
