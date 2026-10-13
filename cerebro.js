// CÉREBRO: recebe o que você disse e decide quem responde.
// Ordem: 1) rotinas  2) memória  3) configurações  4) respostas locais  5) IA
const Cerebro = (function () {

  // tira acentos e põe em minúsculas, para comparar mais fácil
  function limpar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function contem(t, frases) {
    return frases.some(function (f) { return t.includes(f); });
  }

  // Se a frase COMEÇA com um dos gatilhos, devolve o que vem depois (com a escrita original).
  // Aceita "JARVIS, lembre que ..." também.
  function depoisDe(pergunta, t, gatilhos) {
    const base = t.replace(/^jarvis[,\s]+/, "");
    const corte = t.length - base.length;
    for (let i = 0; i < gatilhos.length; i++) {
      if (base.startsWith(gatilhos[i])) {
        return pergunta.slice(corte + gatilhos[i].length).trim();
      }
    }
    return null;
  }

  async function responder(pergunta) {
    // 1) Rotinas: ações reais, grátis e instantâneas (se o arquivo existir)
    if (typeof Rotinas !== "undefined") {
      const daRotina = await Rotinas.tentar(pergunta);
      if (daRotina) return daRotina;
    }

    const t = limpar(pergunta);
    const palavras = t.split(/\s+/).filter(Boolean).length;

    // 2) Memória: lembrar, listar e esquecer (tudo local, sem internet)
    if (typeof Memoria !== "undefined") {
      const fato = depoisDe(pergunta, t, [
        "lembre-se que", "lembre se que", "lembre que", "lembra que",
        "anote que", "anota que", "guarde que", "memorize que"
      ]);
      if (fato !== null) return Memoria.lembrar(fato).mensagem;

      if (contem(t, [
        "o que voce sabe sobre mim", "quais sao as suas memorias", "quais memorias",
        "liste suas memorias", "o que voce lembra de mim"
      ])) {
        const itens = Memoria.listar();
        if (itens.length === 0) return "Ainda não guardei nenhuma memória sobre você.";
        const recentes = itens.slice(-6).map(Memoria.paraVoce).join("; ");
        const extra = itens.length > 6 ? " E mais " + (itens.length - 6) + " memórias antigas." : "";
        return "Eu sei que: " + recentes + "." + extra;
      }

      if (contem(t, ["esqueca a ultima", "apague a ultima memoria"])) {
        return Memoria.esquecerUltima()
          ? "Pronto, esqueci a última memória."
          : "Não tenho nenhuma memória para esquecer.";
      }

      if (contem(t, [
        "esqueca tudo", "apague suas memorias", "apague todas as memorias",
        "limpar memoria", "limpe sua memoria"
      ])) {
        if (!window.confirm("Apagar TODAS as memórias do JARVIS?")) {
          return "Certo, mantive as suas memórias.";
        }
        return Memoria.limpar() ? "Memórias apagadas." : "Não consegui apagar as memórias.";
      }
    }

    // 3) Configurações: chave da IA e modo sério
    if (typeof IA !== "undefined") {
      if (contem(t, ["configurar chave", "trocar chave", "configurar inteligencia"])) {
        return IA.configurarChave();
      }
      if (contem(t, ["modo serio", "sem piadas", "para de piada", "pare de piada"])) {
        IA.definirModoSerio(true);
        return "Entendido. Modo sério ativado. Sem piadas, a menos que você peça.";
      }
      if (contem(t, ["modo humor", "pode brincar", "pode fazer piada", "volte a fazer piada"])) {
        IA.definirModoSerio(false);
        return "Humor reativado. Vou tentar ser engraçado com moderação.";
      }
    }

    // 4) Respostas locais: instantâneas, grátis e sem internet
    if (palavras <= 3) {
      if (t.includes("bom dia")) return "Bom dia. Todos os sistemas estão operando normalmente.";
      if (t.includes("boa tarde")) return "Boa tarde. Como posso ajudar?";
      if (t.includes("boa noite")) return "Boa noite. Estou à disposição.";
      if (t.includes("obrigado") || t.includes("obrigada")) return "Disponha.";
    }
    if (contem(t, ["que horas", "qual a hora", "qual e a hora", "me diga a hora", "me diz a hora", "horas sao"])) {
      const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      return "Agora são " + hora + ".";
    }
    if (contem(t, ["que dia e hoje", "dia de hoje", "qual a data", "qual e a data", "data de hoje"])) {
      const data = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
      return "Hoje é " + data + ".";
    }

    // 5) Todo o resto vai para a inteligência artificial
    if (typeof IA === "undefined") return "O módulo de inteligência não foi carregado.";
    return await IA.responder(pergunta);
  }

  return { responder: responder };
})();