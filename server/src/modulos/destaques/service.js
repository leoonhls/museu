// Responsável: M2 — veja a seção "M2" no Guia da Entrega 2[cite: 10]
import * as obrasRepo from '../../repositorios/obras.repo.js';
import * as artistasRepo from '../../repositorios/artistas.repo.js';
import * as exposicoesRepo from '../../repositorios/exposicoes.repo.js';
import * as eventosRepo from '../../repositorios/eventos.repo.js';
import * as reservasRepo from '../../repositorios/reservas.repo.js';

export async function listarDestaques() {
  const [obras, artistas, exposicoes, eventos] = await Promise.all([
    obrasRepo.listarTodas(),
    artistasRepo.listarTodos(),
    exposicoesRepo.listarTodas(),
    eventosRepo.listarTodos(),
  ]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // 1. Regra para exposicao_atual
  const exposicoesAtuais = exposicoes.filter((exp) => {
    const inicio = new Date(`${exp.data_inicio}T00:00:00`);
    const fim = new Date(`${exp.data_fim}T23:59:59`);
    return hoje >= inicio && hoje <= fim;
  });

  // Se houver mais de uma, pega a que termina primeiro (menor data_fim)
  exposicoesAtuais.sort((a, b) => new Date(a.data_fim) - new Date(b.data_fim));
  const exposicao_atual = exposicoesAtuais[0] ?? null;

  // 2. Regra para obras (6 obras com em_exibicao: true, completando com as outras se necessário)
  const emExibicao = obras.filter((o) => o.em_exibicao);
  const outrasObras = obras.filter((o) => !o.em_exibicao);
  const obrasSelecionadas = [...emExibicao, ...outrasObras].slice(0, 6);

  const obrasComArtista = obrasSelecionadas.map((obra) => ({
    ...obra,
    artista_nome: artistas.find((a) => a.id === obra.artista_id)?.nome ?? 'Artista desconhecido',
  }));

  // 3. Regra para eventos (3 próximos eventos futuros, com vagas restantes)
  const agora = new Date();
  const eventosFuturos = eventos.filter((e) => new Date(e.data_hora) > agora);
  eventosFuturos.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));

  const eventosComVagas = await Promise.all(
    eventosFuturos.slice(0, 3).map(async (evento) => {
      const ingressosVendidos = await reservasRepo.somarIngressosPorEvento(evento.id);
      const vagas_restantes = Math.max(0, evento.capacidade - ingressosVendidos);
      return {
        ...evento,
        vagas_restantes,
      };
    }),
  );

  return {
    exposicao_atual,
    obras: obrasComArtista,
    eventos: eventosComVagas,
  };
}
