const obrasExemplo = [
    { id: 1, titulo: "Código Limpo (Clean Code)", autor: "Robert C. Martin", ano: 2008 },
    { id: 2, titulo: "Entendendo Algoritmos", autor: "Aditya Y. Bhargava", ano: 2017 },
    { id: 3, titulo: "Redes de Computadores", autor: "Andrew S. Tanenbaum", ano: 2021 },
    { id: 4, titulo: "Engenharia de Software", autor: "Ian Sommerville", ano: 2019 }
];

function renderizarObras() {
    const container = document.getElementById('containerObras');
    if (!container) return;

    const usuarioLogado = getUsuarioLogado();
    const favoritos = usuarioLogado ? usuarioLogado.favoritos ||