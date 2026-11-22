const BASE = 'http://localhost:3000/api';

const EMAIL = 'visitante.m6@teste.com';
const SENHA = 'Museu123';
const EVENTO_ID = 2;

// Faz login e captura o cookie da sessão.
async function obterCookie() {
  const resposta = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: EMAIL,
      senha: SENHA,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha no login: HTTP ${resposta.status} - ${await resposta.text()}`);
  }

  const cookie = resposta.headers.get('set-cookie');

  if (!cookie) {
    throw new Error('O servidor não retornou o cookie da sessão.');
  }

  return cookie.split(';')[0];
}

// Envia dez reservas simultaneamente.
async function testarLotacao() {
  const cookie = await obterCookie();

  const resultados = await Promise.all(
    Array.from({ length: 10 }, async (_, indice) => {
      const resposta = await fetch(`${BASE}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          evento_id: EVENTO_ID,
          qtd_inteira: 1,
          qtd_meia: 0,
        }),
      });

      return {
        tentativa: indice + 1,
        status: resposta.status,
        resposta: await resposta.text(),
      };
    }),
  );

  const aprovadas = resultados.filter((r) => r.status === 201).length;
  const recusadas = resultados.filter((r) => r.status === 400).length;

  console.table(resultados.map(({ tentativa, status }) => ({ tentativa, status })));

  console.log(`Reservas aprovadas: ${aprovadas}`);
  console.log(`Reservas recusadas: ${recusadas}`);

  if (resultados.length === 10 && aprovadas === 5 && recusadas === 5) {
    console.log('SUCESSO: limite de vagas respeitado!');
  } else {
    console.error('RESULTADO DIFERENTE DO ESPERADO.');
    console.log(resultados);
    process.exitCode = 1;
  }
}

testarLotacao().catch((erro) => {
  console.error('Erro no teste:', erro);
  process.exitCode = 1;
});
