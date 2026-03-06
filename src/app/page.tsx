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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-blue-900 tracking-tight">
              Frete<span className="text-amber-500">Hub</span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-blue-900">Entrar</Button>
            </Link>
            <Link href="/cadastro/empresa">
              <Button className="bg-blue-900 hover:bg-blue-800 shadow-sm">
                Cadastrar empresa
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative container mx-auto px-4 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-600/50 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-8 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Plataforma #1 de logística de grande porte no Brasil
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight">
            Conectamos empresas e
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-300">
              caminhoneiros
            </span>{" "}
            em todo o Brasil
          </h1>
          <p className="text-lg text-blue-200 mb-12 max-w-2xl mx-auto leading-relaxed">
            Publique ou encontre fretes de grande porte com segurança, agilidade e transparência.
            Mais de 10.000 cargas movimentadas por mês.
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/cadastro/empresa">
              <div className="bg-white rounded-2xl p-6 w-68 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group border border-gray-100">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-800 transition-colors">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-blue-900 font-bold text-lg mb-1">Sou Empresa</h3>
                <p className="text-gray-500 text-sm mb-4 leading-snug">
                  Publique fretes e encontre os melhores caminhoneiros verificados
                </p>
                <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-sm px-4 py-2 rounded-lg group-hover:bg-blue-800 transition-colors font-medium">
                  Cadastrar empresa
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            <Link href="/cadastro/caminhoneiro">
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 w-68 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-blue-900 font-bold text-lg mb-1">Sou Caminhoneiro</h3>
                <p className="text-blue-900/70 text-sm mb-4 leading-snug">
                  Encontre fretes perto de você e aumente sua renda
                </p>
                <span className="inline-flex items-center gap-1.5 bg-blue-900 text-white text-sm px-4 py-2 rounded-lg group-hover:bg-blue-800 transition-colors font-medium">
                  Cadastrar grátis
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10k+", label: "Fretes publicados", color: "text-blue-900" },
              { value: "5k+", label: "Caminhoneiros ativos", color: "text-amber-500" },
              { value: "2k+", label: "Empresas cadastradas", color: "text-blue-900" },
              { value: "R$ 50M+", label: "Em cargas movimentadas", color: "text-amber-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className={`text-4xl font-extrabold ${stat.color} transition-transform group-hover:scale-110`}>
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm mt-1.5 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
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
              },
              {
                icon: Zap,
                title: "Candidatura instantânea",
                description: "Empresas recebem candidaturas em tempo real e podem aceitar ou recusar com um clique.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Shield,
                title: "Regras inteligentes",
                description: "O sistema impede candidaturas de caminhoneiros sem capacidade mínima exigida pelo frete.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: BarChart3,
                title: "Dashboard completo",
                description: "Acompanhe todos os seus fretes, candidaturas e status em um único painel de controle.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Mail,
                title: "Notificações automáticas",
                description: "Receba e-mails automáticos sobre candidaturas aceitas, recusadas e novidades na plataforma.",
                color: "bg-rose-50 text-rose-600",
              },
              {
                icon: Globe,
                title: "Cobertura nacional",
                description: "Fretes para todos os estados do Brasil. Filtre por origem, destino e tipo de carga.",
                color: "bg-teal-50 text-teal-600",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group hover:-translate-y-0.5"
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

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Como funciona</h2>
            <p className="text-gray-500 text-lg">Simples, rápido e transparente</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Para Empresas */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Para Empresas</h3>
              </div>
              <div className="space-y-5">
                {[
                  "Cadastre sua empresa com CNPJ e dados",
                  "Publique o frete com origem, destino e requisitos",
                  "Receba candidaturas de caminhoneiros verificados",
                  "Aceite o melhor e acompanhe o andamento",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 font-medium leading-snug">{text}</p>
                  </div>
                ))}
              </div>
              <Link href="/cadastro/empresa" className="mt-8 inline-block">
                <Button className="bg-blue-900 hover:bg-blue-800 shadow-sm">
                  Criar conta de empresa
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Para Caminhoneiros */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-8 border border-amber-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-amber-800">Para Caminhoneiros</h3>
              </div>
              <div className="space-y-5">
                {[
                  "Cadastre-se com CNH, ANTT e dados do caminhão",
                  "Busque fretes por estado, destino ou tipo de carga",
                  "Candidate-se informando sua capacidade em toneladas",
                  "Aguarde a aceitação e realize o transporte",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-gray-700 font-medium leading-snug">{text}</p>
                  </div>
                ))}
              </div>
              <Link href="/cadastro/caminhoneiro" className="mt-8 inline-block">
                <Button className="bg-amber-500 hover:bg-amber-400 text-white shadow-sm">
                  Criar conta de caminhoneiro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 bg-gradient-to-br from-blue-950 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold mb-4">Pronto para começar?</h2>
          <p className="text-blue-300 mb-10 text-lg">
            Cadastro gratuito. Sem mensalidade. Sem surpresas.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/cadastro/empresa">
              <Button
                size="lg"
                className="bg-white text-blue-900 hover:bg-blue-50 font-bold shadow-lg"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Cadastrar empresa
              </Button>
            </Link>
            <Link href="/cadastro/caminhoneiro">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-white font-bold shadow-lg border-0"
              >
                <Truck className="w-4 h-4 mr-2" />
                Cadastrar como caminhoneiro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-500 rounded-lg flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Frete<span className="text-amber-500">Hub</span>
            </span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} FreteHub. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2 text-gray-600">
            Plataforma de marketplace logístico para fretes de grande porte no Brasil.
          </p>
        </div>
      </footer>
    </div>
  );
}
