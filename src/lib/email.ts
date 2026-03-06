import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@fretehub.com.br";

export async function sendWelcomeEmail(
  to: string,
  name: string,
  role: "empresa" | "caminhoneiro"
) {
  const roleLabel = role === "empresa" ? "empresa" : "caminhoneiro";
  const subject = "Bem-vindo ao FreteHub!";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚛 FreteHub</h1>
        <p>Plataforma de Logística para Fretes de Grande Porte</p>
      </div>
      <div class="content">
        <h2>Bem-vindo, ${name}!</h2>
        <p>Sua conta como <strong>${roleLabel}</strong> foi criada com sucesso no FreteHub.</p>
        <p>Nosso time irá verificar seu cadastro em breve. Você receberá um e-mail assim que sua conta for ativada.</p>
        <p>Enquanto isso, você já pode explorar a plataforma.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Acessar plataforma</a>
        <p>Se você tiver qualquer dúvida, entre em contato conosco.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} FreteHub. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Erro ao enviar email de boas-vindas:", error);
  }
}

export async function sendCandidaturaAceitaEmail(
  to: string,
  nomeCaminhoneiro: string,
  tituloFrete: string,
  origemCidade: string,
  origemEstado: string,
  destinoCidade: string,
  destinoEstado: string
) {
  const subject = "🎉 Sua candidatura foi aceita!";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 16px 0; }
        .button { background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Candidatura Aceita!</h1>
      </div>
      <div class="content">
        <h2>Parabéns, ${nomeCaminhoneiro}!</h2>
        <p>Sua candidatura para o frete abaixo foi <strong>aceita</strong>:</p>
        <div class="info-box">
          <h3>${tituloFrete}</h3>
          <p><strong>Rota:</strong> ${origemCidade}/${origemEstado} → ${destinoCidade}/${destinoEstado}</p>
        </div>
        <p>Entre em contato com a empresa para combinar os próximos passos.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/caminhoneiro/candidaturas" class="button">Ver minhas candidaturas</a>
        <!-- TODO: Stripe - quando pagamento for implementado, incluir aqui informações sobre pagamento -->
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} FreteHub. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Erro ao enviar email de candidatura aceita:", error);
  }
}

export async function sendCandidaturaRecusadaEmail(
  to: string,
  nomeCaminhoneiro: string,
  tituloFrete: string
) {
  const subject = "Atualização sobre sua candidatura";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Candidatura não selecionada</h1>
      </div>
      <div class="content">
        <h2>Olá, ${nomeCaminhoneiro}</h2>
        <p>Infelizmente sua candidatura para o frete <strong>"${tituloFrete}"</strong> não foi selecionada desta vez.</p>
        <p>Não desanime! Existem muitos fretes disponíveis na plataforma. Continue buscando oportunidades.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/caminhoneiro/dashboard" class="button">Buscar novos fretes</a>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} FreteHub. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error("Erro ao enviar email de candidatura recusada:", error);
  }
}
