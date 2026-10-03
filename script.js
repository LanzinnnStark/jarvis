const rotulos = {
  idle: "CALMO",
  ouvindo: "OUVINDO",
  processando: "PROCESSANDO",
  respondendo: "RESPONDENDO",
  erro: "ERRO"
};

// Como cada estado "se comporta"
const perfis = {
  idle:        { vel: 1,   amp: 1,   brilho: 0.55, nucleo: 1,   cor: [53, 200, 255] },
  ouvindo:     { vel: 1.8, amp: 1.5, brilho: 0.8,  nucleo: 1.4, cor: [53, 200, 255] },
  processando: { vel: 4,   amp: 0.8, brilho: 0.9,  nucleo: 1.2, cor: [90, 170, 255] },
  respondendo: { vel: 2.5, amp: 2,   brilho: 1,    nucleo: 1.8, cor: [90, 230, 255] },
  erro:        { vel: 0.4, amp: 0.5, brilho: 0.7,  nucleo: 0.6, cor: [255, 77, 94] }
};

let atual = { ...perfis.idle, cor: [...perfis.idle.cor] };
let alvo = perfis.idle;

function mudarEstado(estado) {
  document.body.dataset.estado = estado;
  document.getElementById("rotulo").textContent = rotulos[estado];
  alvo = perfis[estado];
}

document.querySelectorAll(".botoes button").forEach(function (botao) {
  botao.addEventListener("click", function () {
    mudarEstado(botao.dataset.estado);
  });
});

mudarEstado("idle");