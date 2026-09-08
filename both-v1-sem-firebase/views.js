// HTML views for Both.AI.
// These are plain functions that RETURN HTML strings. They are never
// "imported as JS/HTML modules", which avoids the SyntaxError: Unexpected token '<'.

const BASE_URL = "https://both-ai-alpha.vercel.app";

function layout({ title, body }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      background: #0b0f14;
      color: #e6edf3;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 460px;
      background: #11161d;
      border: 1px solid #1f2732;
      border-radius: 16px;
      padding: 32px;
    }
    h1 { font-size: 1.5rem; margin: 0 0 8px; }
    p { line-height: 1.6; color: #9fb0c0; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; background: #25d366; }
    .btn {
      display: inline-block;
      background: #1877f2;
      color: #fff;
      text-decoration: none;
      padding: 12px 18px;
      border-radius: 10px;
      font-weight: 600;
      margin-top: 16px;
    }
    .status { margin-top: 20px; font-size: .85rem; color: #6b7c8f; }
    a { color: #58a6ff; }
    code { background:#0b0f14; padding:2px 6px; border-radius:6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand"><span class="dot"></span><strong>Both.AI</strong></div>
    ${body}
  </div>
</body>
</html>`;
}

// GET / -> landing page with Facebook JS SDK + <fb:login-button>
function landingPage({ fbAppId, whatsappConfigured }) {
  const body = `
    <h1>Both.AI</h1>
    <p>Bot de WhatsApp + Login com Facebook. Ajudando do bem, de casa.</p>

    <div id="fb-root"></div>
    <fb:login-button
      scope="public_profile,email"
      onlogin="checkLoginState();"
      data-size="large"
      data-button-type="continue_with"
      data-use-continue-as="true">
    </fb:login-button>

    <p style="margin-top:16px">
      Ou <a href="/auth/facebook">entrar via OAuth (server-side)</a>
    </p>

    <div class="status">
      <div>WhatsApp webhook: <strong>${whatsappConfigured ? "configurado" : "pendente"}</strong></div>
      <div>Facebook App: <strong>${fbAppId ? "configurado" : "pendente"}</strong></div>
      <div><a href="/privacy">Política de Privacidade</a> · <a href="/debug">Debug</a></div>
    </div>

    <script>
      window.fbAsyncInit = function () {
        FB.init({
          appId: ${JSON.stringify(fbAppId || "")},
          cookie: true,
          xfbml: true,
          version: 'v21.0'
        });
        FB.getLoginStatus(function (response) {
          statusChangeCallback(response);
        });
      };

      // Called by <fb:login-button onlogin="checkLoginState();">
      function checkLoginState() {
        FB.getLoginStatus(function (response) {
          statusChangeCallback(response);
        });
      }

      // When the user is connected on the client, hand the access token to the
      // server so it can create the session cookie, then open the dashboard.
      function statusChangeCallback(response) {
        if (response.status === 'connected' && response.authResponse) {
          var accessToken = response.authResponse.accessToken;
          fetch('/auth/facebook/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: accessToken })
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              if (data && data.ok) {
                window.location.href = '/dashboard';
              } else {
                console.error('[both-ai] server session failed', data);
              }
            })
            .catch(function (err) {
              console.error('[both-ai] token exchange error', err);
            });
        }
      }
    </script>
    <script async defer crossorigin="anonymous"
      src="https://connect.facebook.net/pt_BR/sdk.js"></script>
  `;
  return layout({ title: "Both.AI", body });
}

// GET /dashboard -> protected page
function dashboardPage({ user }) {
  const name = user && user.name ? user.name : "";
  const body = `
    <h1>Logado com Facebook</h1>
    <p>Bem-vindo${name ? ", <strong>" + name + "</strong>" : ""}! Você está autenticado no painel do Both.AI.</p>
    ${user && user.email ? `<p>Email: <code>${user.email}</code></p>` : ""}
    <a class="btn" href="/logout" style="background:#30363d">Sair</a>
  `;
  return layout({ title: "Dashboard · Both.AI", body });
}

// GET /privacy -> privacy policy for Facebook app review
function privacyPage() {
  const body = `
    <h1>Política de Privacidade</h1>
    <p>O Both.AI utiliza o Login do Facebook apenas para autenticar o acesso ao
    painel e identificar o usuário (nome, foto e email públicos).</p>
    <p>Não compartilhamos, vendemos ou divulgamos seus dados a terceiros. Os dados
    são usados exclusivamente para a operação do serviço.</p>
    <p>As mensagens recebidas via WhatsApp são processadas para responder às
    solicitações e não são utilizadas para outros fins.</p>
    <p>Para solicitar a exclusão dos seus dados, entre em contato pelo mesmo canal
    de atendimento. Removeremos as informações associadas à sua conta.</p>
    <p style="margin-top:16px"><a href="/">Voltar</a></p>
  `;
  return layout({ title: "Privacidade · Both.AI", body });
}

module.exports = { BASE_URL, landingPage, dashboardPage, privacyPage };
