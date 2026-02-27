export interface Ad {
  id: string;
  adId: string;
  headline: string;
  body: string;
  ctaText: string;
  destinationUrl: string;
  thumbnail: string;
  status: "active" | "inactive";
  platform: "Facebook" | "Instagram";
  startDate: string;
  lastSeen: string;
  pageName: string;
  tags: string[];
  notes: string;
  // Performance metrics
  impressions?: number;
  clicks?: number;
  reach?: number;
  ctr?: number;
  spend?: number;
  leads?: number;
  costPerLead?: number;
  currency?: string;
}

export const mockAds: Ad[] = [
  {
    id: "1",
    adId: "AD-2024-001",
    headline: "Monte seu cardápio digital em minutos",
    body: "Crie um cardápio digital profissional para seu restaurante com o Cardápio Web. Fácil de usar, bonito e funcional. Comece grátis hoje mesmo!",
    ctaText: "Comece Grátis",
    destinationUrl: "https://cardapioweb.com.br/criar",
    thumbnail: "",
    status: "active",
    platform: "Facebook",
    startDate: "2024-12-01",
    lastSeen: "2025-02-15",
    pageName: "Cardápio Web",
    tags: ["Always-on", "Aquisição"],
    notes: "",
  },
  {
    id: "2",
    adId: "AD-2024-002",
    headline: "Seu restaurante precisa de um cardápio digital",
    body: "Mais de 5.000 restaurantes já usam o Cardápio Web. Aumente suas vendas com um cardápio online profissional.",
    ctaText: "Saiba Mais",
    destinationUrl: "https://cardapioweb.com.br",
    thumbnail: "",
    status: "active",
    platform: "Instagram",
    startDate: "2025-01-10",
    lastSeen: "2025-02-16",
    pageName: "Cardápio Web",
    tags: ["Promo"],
    notes: "Nova versão do criativo lançada em Jan/25",
  },
  {
    id: "3",
    adId: "AD-2024-003",
    headline: "Cardápio Web – O melhor para delivery",
    body: "Integração com iFood, Rappi e muito mais. Seu cardápio digital conectado aos principais apps de delivery.",
    ctaText: "Teste Grátis",
    destinationUrl: "https://cardapioweb.com.br/delivery",
    thumbnail: "",
    status: "active",
    platform: "Facebook",
    startDate: "2025-01-20",
    lastSeen: "2025-02-14",
    pageName: "Cardápio Web",
    tags: ["Institucional"],
    notes: "",
  },
  {
    id: "4",
    adId: "AD-2024-004",
    headline: "Promoção de Verão – 30% OFF",
    body: "Aproveite a promoção de verão do Cardápio Web! 30% de desconto nos planos anuais. Oferta limitada.",
    ctaText: "Aproveitar Oferta",
    destinationUrl: "https://cardapioweb.com.br/promo",
    thumbnail: "",
    status: "inactive",
    platform: "Facebook",
    startDate: "2024-11-15",
    lastSeen: "2024-12-31",
    pageName: "Cardápio Web",
    tags: ["Promo", "Sazonal"],
    notes: "Campanha encerrada",
  },
  {
    id: "5",
    adId: "AD-2024-005",
    headline: "QR Code para seu cardápio",
    body: "Gere QR Codes personalizados para seu cardápio digital. Seus clientes escaneiam e pedem direto da mesa.",
    ctaText: "Criar QR Code",
    destinationUrl: "https://cardapioweb.com.br/qrcode",
    thumbnail: "",
    status: "active",
    platform: "Instagram",
    startDate: "2025-02-01",
    lastSeen: "2025-02-16",
    pageName: "Cardápio Web",
    tags: ["Always-on"],
    notes: "",
  },
  {
    id: "6",
    adId: "AD-2024-006",
    headline: "Cardápio Web para bares e pubs",
    body: "Cardápio digital especializado para bares. Com categorias para drinks, petiscos e happy hour.",
    ctaText: "Saiba Mais",
    destinationUrl: "https://cardapioweb.com.br/bares",
    thumbnail: "",
    status: "inactive",
    platform: "Facebook",
    startDate: "2024-10-01",
    lastSeen: "2024-11-30",
    pageName: "Cardápio Web",
    tags: ["Institucional"],
    notes: "Pausado para reformulação do criativo",
  },
  {
    id: "7",
    adId: "AD-2025-007",
    headline: "Novo: Pedidos online integrados",
    body: "Agora o Cardápio Web tem sistema de pedidos online integrado! Receba pedidos diretamente no seu WhatsApp.",
    ctaText: "Conhecer Recurso",
    destinationUrl: "https://cardapioweb.com.br/pedidos",
    thumbnail: "",
    status: "active",
    platform: "Facebook",
    startDate: "2025-02-10",
    lastSeen: "2025-02-16",
    pageName: "Cardápio Web",
    tags: ["Lançamento"],
    notes: "Feature launch campaign",
  },
  {
    id: "8",
    adId: "AD-2025-008",
    headline: "Case de sucesso: Restaurante Sabor & Arte",
    body: "Veja como o Restaurante Sabor & Arte aumentou 40% das vendas com o Cardápio Web. Leia o case completo.",
    ctaText: "Ler Case",
    destinationUrl: "https://cardapioweb.com.br/cases",
    thumbnail: "",
    status: "active",
    platform: "Instagram",
    startDate: "2025-02-05",
    lastSeen: "2025-02-15",
    pageName: "Cardápio Web",
    tags: ["Institucional", "Social Proof"],
    notes: "",
  },
];

export const adActivityData = [
  { date: "Jan 1", count: 3 },
  { date: "Jan 8", count: 4 },
  { date: "Jan 15", count: 4 },
  { date: "Jan 22", count: 5 },
  { date: "Jan 29", count: 5 },
  { date: "Feb 5", count: 6 },
  { date: "Feb 12", count: 6 },
  { date: "Feb 16", count: 6 },
];

export const adsByStatusData = [
  { status: "Active", count: 6 },
  { status: "Inactive", count: 2 },
];
