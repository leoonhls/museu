// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2[cite: 10]
import { buscarDestaques } from '../api.js';
import { mostrarCarregando, mostrarErro } from '../components/estado.js';

async function carregarHome() {
  const areaDestaques = document.querySelector('#destaques');

  if (!areaDestaques) return;

  // 1. Mostra o spinner de carregamento global criado no M2
  mostrarCarregando(areaDestaques, 'Carregando destaques do museu...');

  try {
    // 2. Busca todos os dados de uma só vez do servidor com await
    const { exposicao_atual, obras, eventos } = await buscarDestaques();

    // Limpa a área de carregamento para desenhar o conteúdo real
    areaDestaques.replaceChildren();

    // 3. Renderiza a exposição atual (se houver)
    if (exposicao_atual) {
      const banner = document.createElement('div');
      banner.className = 'banner-exposicao';
      banner.innerHTML = `
                <h2>Exposição em Destaque: ${exposicao_atual.titulo}</h2>
                <p>${exposicao_atual.descricao}</p>
            `;
      areaDestaques.appendChild(banner);
    }

    // 4. Renderiza a grade de obras em destaque
    const gradeObras = document.createElement('div');
    gradeObras.className = 'grid';

    obras.forEach((obra) => {
      const card = document.createElement('article');
      card.className = 'card card-obra';
      card.innerHTML = `
                <a class="card-obra__link" href="/obra.html?id=${obra.id}">
                    <img class="card-obra__imagem" src="${obra.imagem_url}" alt="${obra.titulo}">
                    <h3 class="card-obra__titulo">${obra.titulo}</h3>
                    <p class="card-obra__detalhes">${obra.artista_nome}</p>
                </a>
            `;
      gradeObras.appendChild(card);
    });
    areaDestaques.appendChild(gradeObras);

    // (Opcional) Aqui você também pode adicionar a renderização dos eventos se desejar
  } catch (erro) {
    // 4. Se o servidor cair ou der erro, exibe o estado de erro com botão de recarregar[cite: 11]
    mostrarErro(areaDestaques, erro.message || 'Erro ao carregar os dados do servidor.', () =>
      location.reload(),
    );
  }
}

// Executa a função ao carregar a página
carregarHome();
