// CÉREBRO: recebe o que você disse e devolve uma resposta.
// Por enquanto são regras simples. Na Fase 3 trocamos por uma IA.
const Cerebro = (function () {
  // tira acentos e põe em minúsculas, para comparar mais fácil
    function limpar(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          }

            async function responder(pergunta) {
                const t = limpar(pergunta);

                    if (t.includes("bom dia")) {
                          return "Bom dia. Todos os sistemas estão operando normalmente.";
                              }
                                  if (t.includes("boa tarde")) {
                                        return "Boa tarde. Como posso ajudar?";
                                            }
                                                if (t.includes("boa noite")) {
                                                      return "Boa noite. Estou à disposição.";
                                                          }
                                                              if (t.includes("hora")) {
                                                                    const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                                                                          return "Agora são " + hora + ".";
                                                                              }
                                                                                  if (t.includes("data") || t.includes("dia e hoje") || t.includes("que dia")) {
                                                                                        const data = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
                                                                                              return "Hoje é " + data + ".";
                                                                                                  }
                                                                                                      if (t.includes("quem e voce") || t.includes("seu nome")) {
                                                                                                            return "Sou o J.A.R.V.I.S., seu assistente pessoal. Ainda estou em construção.";
                                                                                                                }
                                                                                                                    if (t.includes("obrigado") || t.includes("obrigada")) {
                                                                                                                          return "Disponha.";
                                                                                                                              }

                                                                                                                                  return "Ainda não sei responder isso. Em breve terei um cérebro de verdade.";
                                                                                                                                    }

                                                                                                                                      return { responder: responder };
                                                                                                                                      })();