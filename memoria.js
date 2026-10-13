// MEMÓRIA: fatos que o JARVIS guarda sobre você.
// Ficam só neste aparelho (localStorage). Se você limpar os dados do navegador, somem.
// NÃO peça para ele guardar senhas, números de cartão ou documentos.
const Memoria = (function () {
  const CHAVE = "jarvis_memorias";
  const MAX_ITENS = 40;   // quantas memórias cabem
  const MAX_TEXTO = 200;  // tamanho máximo de cada uma

  function ler() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      const lista = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function salvar(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Guarda uma memória nova
  function lembrar(texto) {
    const limpo = texto.trim().replace(/[.!?\s]+$/, "").slice(0, MAX_TEXTO);
    if (!limpo) return { ok: false, mensagem: "Não entendi o que devo lembrar." };

    const lista = ler();
    if (lista.length >= MAX_ITENS) {
      return { ok: false, mensagem: "Minha memória está cheia. Peça para eu esquecer algo antes." };
    }
    lista.push({ t: limpo, d: new Date().toISOString().slice(0, 10) });
    if (!salvar(lista)) {
      return { ok: false, mensagem: "Não consegui gravar a memória neste navegador." };
    }
    return { ok: true, mensagem: "Anotado. Vou me lembrar disso." };
  }

  // Lista só os textos
  function listar() {
    return ler().map(function (item) { return item.t; });
  }

  function esquecerUltima() {
    const lista = ler();
    if (lista.length === 0) return false;
    lista.pop();
    return salvar(lista);
  }

  function limpar() {
    try {
      localStorage.removeItem(CHAVE);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Texto pronto para entregar à IA, uma memória por linha
  function paraPrompt() {
    const itens = listar();
    if (itens.length === 0) return "";
    return itens.map(function (t) { return "- " + t; }).join("\n");
  }

  return {
    lembrar: lembrar,
    listar: listar,
    esquecerUltima: esquecerUltima,
    limpar: limpar,
    paraPrompt: paraPrompt
  };
})();