"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
  Mail,
  Globe,
  ArrowRight,
  Truck,
  Building2,
  Star,
  Menu,
  X,
  ChevronDown,
  MapPin,
  Phone,
  TrendingUp,
  Award,
  HeadphonesIcon,
  Clock,
  Users,
  Package,
  CheckCircle2,
  Quote,
} from "lucide-react";

const faqs = [
  {
    question: "Como funciona o processo de verificação dos caminhoneiros?",
    answer:
      "Todo caminhoneiro passa por verificação manual de documentos: CNH válida, ANTT ativa e dados do veículo. Nossa equipe valida cada cadastro em até 48 horas. Apenas caminhoneiros verificados podem se candidatar a fretes.",
  },
  {
    question: "Qual o custo para cadastrar minha empresa ou caminhoneiro?",
    answer:
      "O cadastro é 100% gratuito para empresas e caminhoneiros. Não cobramos mensalidade nem taxa de cadastro. Você só paga quando fecha um frete — e mesmo assim, a negociação é direta entre as partes.",
  },
  {
    question: "Como a empresa escolhe o caminhoneiro certo?",
    answer:
      "Ao publicar um frete, você recebe candidaturas de caminhoneiros verificados que atendem aos requisitos de capacidade. Você vê o nome, tipo de caminhão, tonelagem ofertada e a mensagem do motorista, e escolhe quem melhor se encaixa.",
  },
  {
    question: "O que acontece se um caminhoneiro não tiver capacidade suficiente?",
    answer:
      "O sistema bloqueia automaticamente candidaturas de caminhoneiros que não atendem à tonelagem mínima exigida pelo frete. Isso garante que você só receba propostas relevantes, sem precisar filtrar manualmente.",
  },
  {
    question: "Quanto tempo leva para encontrar um caminhoneiro?",
    answer:
      "A maioria das empresas recebe candidaturas em menos de 24 horas após publicar um frete. Em rotas populares (ex: SP → MT), é comum receber 5 a 15 candidaturas no mesmo dia.",
  },
  {
    question: "Posso publicar fretes para qualquer estado do Brasil?",
    answer:
      "Sim! A plataforma tem cobertura nacional. Você pode publicar fretes de e para qualquer estado brasileiro, e filtrar candidatos por origem e destino.",
  },
];

const testimonials = [
  {
    name: "Ricardo Mendonça",
    role: "Diretor de Logística",
    company: "AgroTransp Soluções",
    avatar: "RM",
    avatarColor: "from-blue-900 to-blue-700",
    text: "Antes levávamos 3 a 5 dias para fechar um caminhoneiro por telefone. Com o FreteHub, publicamos o frete e em menos de 6 horas tínhamos 8 propostas de caminhoneiros verificados. Reduziu nosso custo operacional em quase 30%.",
    stars: 5,
  },
  {
    name: "Carlos Eduardo Silva",
    role: "Caminhoneiro Autônomo",
    company: "Truck: Bitrem · 48 toneladas",
    avatar: "CE",
    avatarColor: "from-amber-600 to-amber-400",
    text: "Fiquei 2 semanas parado esperando carga. Me cadastrei no FreteHub numa sexta, e na segunda já estava carregado para o Mato Grosso. A plataforma é fácil, e o pagamento foi certinho. Indico para todos os colegas.",
    stars: 5,
  },
  {
    name: "Fernanda Rocha",
    role: "Gerente de Operações",
    company: "Celtex Distribuidora",
    avatar: "FR",
    avatarColor: "from-teal-700 to-teal-500",
    text: "O diferencial do FreteHub é a verificação. A gente sabe que o motorista é real, tem documentação em dia. Já tivemos experiências ruins com outros aplicativos. Aqui, o processo é sério e transparente.",
    stars: 5,
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
        >
          <button
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50/50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-gray-900 text-base">{faq.question}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-blue-900 tracking-tight">
              Frete<span className="text-amber-500">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="px-3 py-2 rounded-lg hover:text-blue-900 hover:bg-gray-50 transition-colors">
              Como funciona
            </a>
            <a href="#recursos" className="px-3 py-2 rounded-lg hover:text-blue-900 hover:bg-gray-50 transition-colors">
              Recursos
            </a>
            <a href="#depoimentos" className="px-3 py-2 rounded-lg hover:text-blue-900 hover:bg-gray-50 transition-colors">
              Depoimentos
            </a>
            <a href="#faq" className="px-3 py-2 rounded-lg hover:text-blue-900 hover:bg-gray-50 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-900 font-medium">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro/empresa">
              <Button className="bg-blue-900 hover:bg-blue-800 shadow-sm font-semibold">
                Começar grátis
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            {["Como funciona", "Recursos", "Depoimentos", "FAQ"].map((item, i) => (
              <a
                key={i}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {item}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-700">Entrar</Button>
              </Link>
              <Link href="/cadastro/empresa" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-blue-900 hover:bg-blue-800">Cadastrar empresa</Button>
              </Link>
              <Link href="/cadastro/caminhoneiro" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                  <Truck className="w-4 h-4 mr-2" />
                  Cadastrar caminhoneiro
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        {/* Background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/5 rounded-full" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-400/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-700/20 rounded-full" />
        </div>

        <div className="relative container mx-auto px-4 pt-24 pb-28 text-center">
          {/* Trust pill */}
          <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-600/40 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-8 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Plataforma #1 de logística de grande porte no Brasil</span>
            <span className="w-px h-4 bg-blue-600/50 mx-0.5" />
            <span className="text-amber-400 font-semibold">+10.000 fretes/mês</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight">
            A plataforma que conecta
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300">
              carga e caminhão
            </span>
            <br />
            em minutos
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Empresas publicam fretes. Caminhoneiros verificados se candidatam.
            Você escolhe o melhor. Simples, seguro e 100% gratuito para começar.
          </p>

          {/* Dual CTA cards */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-14">
            <Link href="/cadastro/empresa">
              <div className="bg-white rounded-2xl p-6 w-72 text-left shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)] hover:-translate-y-1.5 transition-all cursor-pointer group border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-blue-900 font-bold text-lg mb-1">Sou Empresa</h3>
                <p className="text-gray-500 text-sm mb-4 leading-snug">
                  Publique fretes e encontre os melhores caminhoneiros verificados do Brasil
                </p>
                <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-sm px-4 py-2.5 rounded-xl group-hover:bg-blue-800 transition-colors font-semibold">
                  Cadastrar empresa grátis
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            <Link href="/cadastro/caminhoneiro">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 w-72 text-left shadow-2xl hover:shadow-[0_25px_60px_rgba(245,158,11,0.35)] hover:-translate-y-1.5 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-blue-900 font-bold text-lg mb-1">Sou Caminhoneiro</h3>
                <p className="text-blue-900/70 text-sm mb-4 leading-snug">
                  Encontre fretes perto de você e aumente seu faturamento mensal
                </p>
                <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-sm px-4 py-2.5 rounded-xl group-hover:bg-blue-800 transition-colors font-semibold">
                  Cadastrar grátis
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Social trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Cadastro 100% gratuito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Sem mensalidade
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Verificação de documentos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Cobertura nacional
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <section className="py-14 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10k+", label: "Fretes publicados", icon: Package, color: "text-blue-900" },
              { value: "5k+", label: "Caminhoneiros ativos", icon: Truck, color: "text-amber-500" },
              { value: "2k+", label: "Empresas cadastradas", icon: Building2, color: "text-blue-900" },
              { value: "R$ 50M+", label: "Em cargas movimentadas", icon: TrendingUp, color: "text-amber-500" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className={`text-4xl font-extrabold ${stat.color} mb-1.5 transition-transform group-hover:scale-110`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm font-medium">
                    <Icon className="w-3.5 h-3.5" />
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ──────────────────────────────────── */}
      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-7">
            Por que confiar no FreteHub?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: "Motoristas verificados", desc: "CNH, ANTT e documentos validados manualmente" },
              { icon: Award, title: "Plataforma certificada", desc: "Segurança de dados com criptografia end-to-end" },
              { icon: HeadphonesIcon, title: "Suporte dedicado", desc: "Atendimento via e-mail e WhatsApp" },
              { icon: Clock, title: "Resposta em < 24h", desc: "Candidaturas chegam no mesmo dia do frete" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-4 border border-gray-100 shadow-sm">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="como-funciona" className="py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">Processo simples</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Como funciona</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Do cadastro ao frete fechado em poucos passos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Para Empresas */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/40 rounded-2xl p-8 border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-8 translate-x-8" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 bg-blue-900 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Para Empresas</h3>
                  <p className="text-xs text-blue-600 font-medium">Publique e receba propostas</p>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { step: "01", text: "Cadastre sua empresa com CNPJ e dados" },
                  { step: "02", text: "Publique o frete com origem, destino e requisitos" },
                  { step: "03", text: "Receba candidaturas de caminhoneiros verificados" },
                  { step: "04", text: "Aceite o melhor e acompanhe o andamento" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <p className="text-gray-700 font-medium leading-snug pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/cadastro/empresa" className="mt-8 inline-block">
                <Button className="bg-blue-900 hover:bg-blue-800 shadow-sm font-semibold">
                  Criar conta de empresa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Para Caminhoneiros */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/40 rounded-2xl p-8 border border-amber-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-8 translate-x-8" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Truck className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-800">Para Caminhoneiros</h3>
                  <p className="text-xs text-amber-600 font-medium">Encontre carga e ganhe mais</p>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { step: "01", text: "Cadastre-se com CNH, ANTT e dados do caminhão" },
                  { step: "02", text: "Busque fretes por estado, destino ou tipo de carga" },
                  { step: "03", text: "Candidate-se informando sua capacidade em toneladas" },
                  { step: "04", text: "Aguarde a aceitação e realize o transporte" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <p className="text-gray-700 font-medium leading-snug pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/cadastro/caminhoneiro" className="mt-8 inline-block">
                <Button className="bg-amber-500 hover:bg-amber-400 text-white shadow-sm font-semibold">
                  Criar conta de caminhoneiro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="recursos" className="py-24 bg-gray-50 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">Funcionalidades</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Por que escolher o FreteHub?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Tudo que você precisa para conectar carga e transporte em um só lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Verificação completa",
                description: "Todos os caminhoneiros passam por verificação de CNH, ANTT e documentação antes de se candidatarem.",
                color: "bg-green-50 text-green-600",
                border: "hover:border-green-200",
              },
              {
                icon: Zap,
                title: "Candidatura instantânea",
                description: "Empresas recebem candidaturas em tempo real e podem aceitar ou recusar com um clique.",
                color: "bg-blue-50 text-blue-600",
                border: "hover:border-blue-200",
              },
              {
                icon: Shield,
                title: "Regras inteligentes",
                description: "O sistema bloqueia automaticamente candidaturas de caminhoneiros sem capacidade mínima exigida.",
                color: "bg-purple-50 text-purple-600",
                border: "hover:border-purple-200",
              },
              {
                icon: BarChart3,
                title: "Dashboard completo",
                description: "Acompanhe todos os seus fretes, candidaturas e status em um único painel de controle.",
                color: "bg-amber-50 text-amber-600",
                border: "hover:border-amber-200",
              },
              {
                icon: Mail,
                title: "Notificações automáticas",
                description: "Receba e-mails automáticos sobre candidaturas aceitas, recusadas e novidades na plataforma.",
                color: "bg-rose-50 text-rose-600",
                border: "hover:border-rose-200",
              },
              {
                icon: Globe,
                title: "Cobertura nacional",
                description: "Fretes para todos os estados do Brasil. Filtre por origem, destino e tipo de carga.",
                color: "bg-teal-50 text-teal-600",
                border: "hover:border-teal-200",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 ${feature.border} group hover:-translate-y-0.5`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROVA SOCIAL / NÚMEROS ─────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300 mb-3">Nossos números</p>
          <h2 className="text-4xl font-extrabold mb-14">
            FreteHub em{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
              números reais
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: "10.000+", label: "Fretes publicados", sub: "desde o lançamento" },
              { value: "5.000+", label: "Caminhoneiros", sub: "verificados e ativos" },
              { value: "2.000+", label: "Empresas", sub: "em todo o Brasil" },
              { value: "98%", label: "Satisfação", sub: "avaliações positivas" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl md:text-5xl font-extrabold text-amber-400 mb-1.5">{s.value}</div>
                <div className="font-semibold text-white">{s.label}</div>
                <div className="text-blue-400 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section id="depoimentos" className="py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">Depoimentos</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Quem usa, recomenda
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Veja o que empresas e caminhoneiros falam sobre a plataforma.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative flex-1 mb-6">
                  <Quote className="w-8 h-8 text-blue-100 absolute -top-1 -left-1" />
                  <p className="text-gray-700 text-sm leading-relaxed relative z-10 pl-4">
                    {t.text}
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING / VALUE ──────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">Preço justo</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Sem custo para começar</h2>
            <p className="text-gray-500 text-lg">
              Cadastro gratuito. Publicação de fretes gratuita. Candidaturas gratuitas.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Empresa */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-100 shadow-md text-center">
              <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Para Empresas</h3>
              <div className="text-4xl font-extrabold text-blue-900 my-4">
                Grátis
              </div>
              <p className="text-gray-500 text-sm mb-6">Sem mensalidade. Sem taxa por frete.</p>
              <ul className="space-y-2.5 text-sm text-gray-600 text-left mb-8">
                {[
                  "Publicação ilimitada de fretes",
                  "Receba candidaturas em tempo real",
                  "Dashboard completo de gestão",
                  "Aceite/recuse com 1 clique",
                  "Notificações por e-mail",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro/empresa">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 font-semibold shadow-sm">
                  Criar conta de empresa
                </Button>
              </Link>
            </div>

            {/* Caminhoneiro */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-8 border-2 border-amber-400 shadow-md text-center">
              <div className="w-14 h-14 bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Truck className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-1">Para Caminhoneiros</h3>
              <div className="text-4xl font-extrabold text-blue-900 my-4">
                Grátis
              </div>
              <p className="text-blue-900/60 text-sm mb-6">Sem taxa de cadastro. Sem comissão.</p>
              <ul className="space-y-2.5 text-sm text-blue-900/80 text-left mb-8">
                {[
                  "Busca avançada por estado e tipo de carga",
                  "Candidaturas ilimitadas",
                  "Acompanhe suas candidaturas",
                  "Receba propostas aceitas por e-mail",
                  "Perfil verificado com badge",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro/caminhoneiro">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm">
                  Cadastrar como caminhoneiro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-3">Dúvidas</p>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Perguntas frequentes</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Tire suas dúvidas sobre a plataforma antes de se cadastrar.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQ />
            <div className="text-center mt-10">
              <p className="text-gray-500 text-sm mb-3">Ainda tem dúvidas?</p>
              <a href="mailto:contato@fretehub.com.br">
                <Button variant="outline" className="border-gray-200 hover:border-blue-300 hover:text-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Fale com nosso suporte
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="py-28 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full translate-y-1/2" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-600/40 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-8">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            Mais de 7.000 pessoas já se cadastraram
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
            Pronto para transformar
            <br />
            sua logística?
          </h2>
          <p className="text-blue-300 mb-12 text-lg max-w-xl mx-auto">
            Cadastro gratuito. Sem mensalidade. Comece hoje e veja resultados em minutos.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/cadastro/empresa">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-xl px-8">
                <Building2 className="w-4 h-4 mr-2" />
                Cadastrar minha empresa
              </Button>
            </Link>
            <Link href="/cadastro/caminhoneiro">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-xl border-0 px-8">
                <Truck className="w-4 h-4 mr-2" />
                Cadastrar como caminhoneiro
              </Button>
            </Link>
          </div>
          <p className="text-blue-500 text-xs mt-8">
            Nenhum cartão de crédito necessário · Ativação imediata
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="container mx-auto px-4 pt-16 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-blue-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-4.5 h-4.5 text-white" />
                </div>
                <span className="text-white font-extrabold text-lg tracking-tight">
                  Frete<span className="text-amber-500">Hub</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 mb-4">
                Marketplace logístico para fretes de grande porte. Conectando empresas e caminhoneiros com segurança e transparência desde 2024.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Plataforma online e funcionando
              </div>
            </div>

            {/* Plataforma */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Plataforma</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/cadastro/empresa" className="hover:text-white transition-colors flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    Cadastrar empresa
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro/caminhoneiro" className="hover:text-white transition-colors flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    Cadastrar caminhoneiro
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    Entrar na conta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links úteis */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Links úteis</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
                </li>
                <li>
                  <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
                </li>
                <li>
                  <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">Perguntas frequentes</a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Contato</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  contato@fretehub.com.br
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  (11) 9 9999-9999
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  São Paulo, SP – Brasil
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  Seg–Sex, 8h–18h
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} FreteHub. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">Termos de uso</a>
              <span>·</span>
              <a href="#" className="hover:text-gray-400 transition-colors">Política de privacidade</a>
              <span>·</span>
              <a href="#" className="hover:text-gray-400 transition-colors">LGPD</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
