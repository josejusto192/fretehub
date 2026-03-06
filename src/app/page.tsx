import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚛</span>
            <span className="text-xl font-bold text-blue-900">FreteHub</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro/empresa">
              <Button className="bg-blue-900 hover:bg-blue-800">Cadastrar empresa</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-blue-600 text-white border-0">
            Plataforma #1 de logística de grande porte no Brasil
          </Badge>
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Conectamos empresas e<br />
            <span className="text-yellow-400">caminhoneiros</span> em todo o Brasil
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Publique ou encontre fretes de grande porte com segurança, agilidade e transparência.
            Mais de 10.000 cargas movimentadas por mês.
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/cadastro/empresa">
              <div className="bg-white rounded-2xl p-6 w-64 text-left shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                <div className="text-3xl mb-3">🏢</div>
                <h3 className="text-blue-900 font-bold text-lg mb-1">Sou Empresa</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Publique fretes e encontre os melhores caminhoneiros verificados
                </p>
                <span className="inline-block bg-blue-900 text-white text-sm px-4 py-2 rounded-lg group-hover:bg-blue-800 transition-colors">
                  Cadastrar empresa →
                </span>
              </div>
            </Link>

            <Link href="/cadastro/caminhoneiro">
              <div className="bg-yellow-400 rounded-2xl p-6 w-64 text-left shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                <div className="text-3xl mb-3">🚛</div>
                <h3 className="text-blue-900 font-bold text-lg mb-1">Sou Caminhoneiro</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Encontre fretes perto de você e aumente sua renda
                </p>
                <span className="inline-block bg-blue-900 text-white text-sm px-4 py-2 rounded-lg group-hover:bg-blue-800 transition-colors">
                  Cadastrar grátis →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10k+", label: "Fretes publicados" },
              { value: "5k+", label: "Caminhoneiros ativos" },
              { value: "2k+", label: "Empresas cadastradas" },
              { value: "R$ 50M+", label: "Em cargas movimentadas" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-blue-900">{stat.value}</div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher o FreteHub?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "✅",
                title: "Verificação completa",
                description:
                  "Todos os caminhoneiros passam por verificação de CNH, ANTT e documentação antes de se candidatarem.",
              },
              {
                icon: "⚡",
                title: "Candidatura instantânea",
                description:
                  "Empresas recebem candidaturas em tempo real e podem aceitar ou recusar com um clique.",
              },
              {
                icon: "🛡️",
                title: "Regras inteligentes",
                description:
                  "O sistema impede candidaturas de caminhoneiros sem capacidade mínima exigida pelo frete.",
              },
              {
                icon: "📊",
                title: "Dashboard completo",
                description:
                  "Acompanhe todos os seus fretes, candidaturas e status em um único painel de controle.",
              },
              {
                icon: "📧",
                title: "Notificações automáticas",
                description:
                  "Receba e-mails automáticos sobre candidaturas aceitas, recusadas e novidades na plataforma.",
              },
              {
                icon: "🌍",
                title: "Cobertura nacional",
                description:
                  "Fretes para todos os estados do Brasil. Filtre por origem, destino e tipo de carga.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Para Empresas */}
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                🏢 Para Empresas
              </h3>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Cadastre sua empresa com CNPJ e dados" },
                  { step: "2", text: "Publique o frete com origem, destino e requisitos" },
                  { step: "3", text: "Receba candidaturas de caminhoneiros verificados" },
                  { step: "4", text: "Aceite o melhor e acompanhe o andamento" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/cadastro/empresa" className="mt-6 inline-block">
                <Button className="bg-blue-900 hover:bg-blue-800">
                  Criar conta de empresa
                </Button>
              </Link>
            </div>

            {/* Para Caminhoneiros */}
            <div>
              <h3 className="text-xl font-bold text-yellow-600 mb-6 flex items-center gap-2">
                🚛 Para Caminhoneiros
              </h3>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Cadastre-se com CNH, ANTT e dados do caminhão" },
                  { step: "2", text: "Busque fretes por estado, destino ou tipo de carga" },
                  { step: "3", text: "Candidate-se informando sua capacidade em toneladas" },
                  { step: "4", text: "Aguarde a aceitação e realize o transporte" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link href="/cadastro/caminhoneiro" className="mt-6 inline-block">
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-white">
                  Criar conta de caminhoneiro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Cadastro gratuito. Sem mensalidade. Sem surpresas.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/cadastro/empresa">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Cadastrar empresa
              </Button>
            </Link>
            <Link href="/cadastro/caminhoneiro">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-blue-800"
              >
                Cadastrar como caminhoneiro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🚛</span>
            <span className="text-white font-bold text-lg">FreteHub</span>
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
