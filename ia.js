// IA: conversa com a inteligência artificial (Google Gemini, plano grátis).
// A chave fica só neste aparelho (localStorage).
// NUNCA coloque a chave dentro do código nem no GitHub.
const IA = (function () {
  const CHAVE_STORAGE = "jarvis_chave_ia";
  const SERIO_STORAGE = "jarvis_modo_serio";

  // Se o primeiro nome der "não encontrado", ele tenta o próximo da lista
  const MODELOS = ["gemini-flash-latest", "gemini-2.5-flash"];

  const TRATAMENTO = "senhor"; // como o JARVIS te chama (pode trocar)
  const MAX_HISTORICO = 8;     // quantas mensagens ele lembra da conversa atual
  const historico = [];

  function lerChave() {
    try { return localStorage.getItem(CHAVE_STORAGE) || ""; } catch (e) { return ""; }
  }

  // Pede a chave por uma janelinha e guarda neste aparelho
  function configurarChave() {
    const nova = window.prompt("Cole aqui a sua chave do Google AI Studio. Ela fica só neste aparelho.");
    if (nova === null) return "Configuração cancelada.";
    const limpa = nova.trim();
    if (!limpa) return "Nenhuma chave foi informada.";
    try {
      localStorage.setItem(CHAVE_STORAGE, limpa);
    } catch (e) {
      return "Não consegui salvar a chave neste navegador.";
    }
    return "Chave salva. Já posso conversar com você.";
  }

  // Modo sério: sem piadas (a menos que você peça)
  function modoSerio() {
    try { return localStorage.getItem(SERIO_STORAGE) === "1"; } catch (e) { return false; }
  }
  function definirModoSerio(ligado) {
    try { localStorage.setItem(SERIO_STORAGE, ligado ? "1" : "0"); } catch (e) { /* sem problema */ }
  }

  // A "personalidade" e as regras do JARVIS
  function instrucao() {
    const agora = new Date().toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" });

    let texto =
      "Você é o J.A.R.V.I.S., assistente pessoal de voz inspirado no do filme Homem de Ferro. " +
      "Fale sempre em português do Brasil, tratando o usuário por " + TRATAMENTO + ". " +
      "Suas respostas serão FALADAS em voz alta: use no máximo três frases curtas, " +
      "sem listas, sem markdown, sem emojis e sem símbolos. " +
      "Seja honesto: se não souber algo, diga que não sabe. " +
      "Você NÃO controla dispositivos nem executa ações por conta própria, " +
      "e nunca deve dizer que fez algo que não fez. " +
      "Quem executa ações são as rotinas cadastradas no sistema. " +
      "Se o usuário pedir uma ação que você não consegue fazer, diga isso com clareza. ";

    if (modoSerio()) {
      texto +=
        "Personalidade: calma, séria e eficiente. O usuário pediu modo sério, " +
        "então não faça piadas, a menos que ele peça uma. ";
    } else {
      texto +=
        "Personalidade: séria, calma e eficiente, como um mordomo muito competente, " +
        "mas com humor seco e sutil. De vez em quando, mais ou menos uma resposta a cada quatro ou cinco, " +
        "inclua uma tirada curta e espirituosa, com ironia leve. " +
        "Nunca faça piada quando o assunto for sério, delicado ou triste, " +
        "quando algo deu errado, quando o usuário precisa entender algo com clareza, " +
        "nem às custas de outras pessoas. Se o usuário pedir uma piada, conte uma. ";
    }

    // O que você pediu para ele lembrar
    if (typeof Memoria !== "undefined") {
      const memorias = Memoria.paraPrompt();
      if (memorias) {
        texto +=
          "Coisas que você sabe sobre o usuário, guardadas por pedido dele " +
          "(use apenas quando for relevante e sem anunciar que está consultando memória):\n" +
          memorias + "\n";
      }
    }

    return texto + "Data e hora atuais: " + agora + ".";
  }

  // Tira símbolos que ficam estranhos quando falados
  function limparParaFala(texto) {
    return texto
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/[*#_`>~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function mensagemDeErro(status) {
    if (status === 400) return "A chave parece inválida. Diga configurar chave para trocar.";
    if (status === 401 || status === 403) return "A chave não tem permissão. Gere uma nova e diga configurar chave.";
    if (status === 404) return "Não encontrei o modelo de inteligência. Preciso atualizar o nome do modelo no arquivo ia ponto js.";
    if (status === 429) return "Atingi o limite gratuito de uso da inteligência. Tente de novo daqui a pouco.";
    return "A inteligência retornou o erro " + status + ".";
  }

  function guardar(pergunta, resposta) {
    historico.push({ role: "user", parts: [{ text: pergunta }] });
    historico.push({ role: "model", parts: [{ text: resposta }] });
    while (historico.length > MAX_HISTORICO) historico.splice(0, 2);
  }

  async function responder(pergunta) {
    const chave = lerChave();
    if (!chave) {
      return "Ainda não tenho uma chave de inteligência. Diga configurar chave para ativar.";
    }

    const corpo = JSON.stringify({
      systemInstruction: { parts: [{ text: instrucao() }] },
      contents: historico.concat([{ role: "user", parts: [{ text: pergunta }] }]),
      generationConfig: { maxOutputTokens: 800, temperature: 0.8 }
    });

    const controle = new AbortController();
    const limite = setTimeout(function () { controle.abort(); }, 25000);

    try {
      let resp = null;
      for (let i = 0; i < MODELOS.length; i++) {
        const url =
          "https://generativelanguage.googleapis.com/v1beta/models/" + MODELOS[i] +
          ":generateContent?key=" + encodeURIComponent(chave);
        resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: corpo,
          signal: controle.signal
        });
        if (resp.status !== 404) break; // só tenta o próximo se o modelo não existir
      }

      if (!resp.ok) return mensagemDeErro(resp.status);

      const dados = await resp.json();
      const c = dados.candidates && dados.candidates[0];
      const partes = c && c.content && c.content.parts;
      const texto = partes
        ? partes.map(function (p) { return p.text || ""; }).join(" ").trim()
        : "";

      if (!texto) return "Não recebi uma resposta válida da inteligência. Tente perguntar de outro jeito.";

      guardar(pergunta, texto);
      return limparParaFala(texto);
    } catch (e) {
      if (e && e.name === "AbortError") return "A inteligência demorou demais para responder.";
      return "Não consegui falar com a inteligência. Verifique a conexão.";
    } finally {
      clearTimeout(limite);
    }
  }

  return {
    responder: responder,
    configurarChave: configurarChave,
    definirModoSerio: definirModoSerio
  };
})();