// IA: núcleo da conversa. Os provedores (groq.js etc.) se registram aqui.
// A chave fica só neste aparelho. NUNCA coloque a chave no código nem no GitHub.
const IA = (function () {
  const ESCOLHA = "jarvis_provedor";
    const MAX_HISTORICO = 8;
      const historico = [];
        const provedores = {};

          function registrar(nome, provedor) {
              provedores[nome] = provedor;
                }

                  function nomeAtual() {
                      let nome = "groq";
                          try { nome = localStorage.getItem(ESCOLHA) || "groq"; } catch (e) { /* usa o padrão */ }
                              return provedores[nome] ? nome : Object.keys(provedores)[0];
                                }

                                  function lerChave(prov) {
                                      try { return localStorage.getItem(prov.chaveStorage) || ""; } catch (e) { return ""; }
                                        }

                                          function escolherProvedor(nome) {
                                              const prov = provedores[nome];
                                                  if (!prov) return "Esse provedor não está instalado.";
                                                      try { localStorage.setItem(ESCOLHA, nome); } catch (e) { return "Não consegui salvar a escolha."; }
                                                          if (!lerChave(prov)) return "Troquei para o " + prov.nome + ". Diga configurar chave para colocar a chave dele.";
                                                              return "Certo. Agora estou usando o " + prov.nome + ".";
                                                                }

                                                                  function configurarChave() {
                                                                      const prov = provedores[nomeAtual()];
                                                                          if (!prov) return "Nenhum provedor de inteligência foi carregado.";
                                                                              const nova = window.prompt("Cole aqui a chave do " + prov.nome + " (" + prov.site + "). Ela fica só neste aparelho.");
                                                                                  if (nova === null) return "Configuração cancelada.";
                                                                                      if (!nova.trim()) return "Nenhuma chave foi informada.";
                                                                                          try { localStorage.setItem(prov.chaveStorage, nova.trim()); } catch (e) { return "Não consegui salvar a chave."; }
                                                                                              return "Chave do " + prov.nome + " salva. Já posso conversar com você.";
                                                                                                }

                                                                                                  function definirModoSerio(ligado) {
                                                                                                      if (typeof Personalidade !== "undefined") Personalidade.definirModoSerio(ligado);
                                                                                                        }

                                                                                                          function mensagemDeErro(status) {
                                                                                                              if (status === 400) return "A inteligência recusou o pedido. Se continuar, diga configurar chave para conferir a chave.";
                                                                                                                  if (status === 401 || status === 403) return "A chave não tem permissão. Gere uma nova e diga configurar chave.";
                                                                                                                      if (status === 404) return "Não encontrei o modelo de inteligência. Preciso atualizar o nome do modelo.";
                                                                                                                          if (status === 429) return "Atingi o limite gratuito de uso da inteligência. Tente de novo daqui a pouco.";
                                                                                                                              return "A inteligência retornou o erro " + status + ".";
                                                                                                                                }

                                                                                                                                  // Tira símbolos que ficam estranhos quando falados
                                                                                                                                    function limparParaFala(texto) {
                                                                                                                                        return texto
                                                                                                                                              .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
                                                                                                                                                    .replace(/[*#_`>~]/g, "")
                                                                                                                                                          .replace(/\s+/g, " ")
                                                                                                                                                                .trim();
                                                                                                                                                                  }

                                                                                                                                                                    async function responder(pergunta) {
                                                                                                                                                                        const prov = provedores[nomeAtual()];
                                                                                                                                                                            if (!prov) return "Nenhum provedor de inteligência foi carregado.";
                                                                                                                                                                                const chave = lerChave(prov);
                                                                                                                                                                                    if (!chave) return "Ainda não tenho uma chave do " + prov.nome + ". Diga configurar chave para ativar.";

                                                                                                                                                                                        const sistema = typeof Personalidade !== "undefined"
                                                                                                                                                                                              ? Personalidade.instrucao()
                                                                                                                                                                                                    : "Você é o J.A.R.V.I.S. Responda em português, em até três frases curtas.";
                                                                                                                                                                                                        const msgs = historico.concat([{ papel: "user", texto: pergunta }]);

                                                                                                                                                                                                            const controle = new AbortController();
                                                                                                                                                                                                                const limite = setTimeout(function () { controle.abort(); }, 25000);

                                                                                                                                                                                                                    try {
                                                                                                                                                                                                                          let r = { status: 0, texto: "" };
                                                                                                                                                                                                                                for (let i = 0; i < prov.modelos.length; i++) {
                                                                                                                                                                                                                                        r = await prov.chamar(chave, prov.modelos[i], sistema, msgs, controle.signal);
                                                                                                                                                                                                                                                // Só tenta o próximo modelo se este recusar, não existir ou estiver no limite
                                                                                                                                                                                                                                                        if (r.status !== 400 && r.status !== 404 && r.status !== 429) break;
                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                    if (r.status !== 200) return mensagemDeErro(r.status);

                                                                                                                                                                                                                                                                          const texto = (r.texto || "").trim();
                                                                                                                                                                                                                                                                                if (!texto) return "Não recebi uma resposta válida da inteligência. Tente perguntar de outro jeito.";

                                                                                                                                                                                                                                                                                      historico.push({ papel: "user", texto: pergunta }, { papel: "assistant", texto: texto });
                                                                                                                                                                                                                                                                                            while (historico.length > MAX_HISTORICO) historico.splice(0, 2);
                                                                                                                                                                                                                                                                                                  return limparParaFala(texto);
                                                                                                                                                                                                                                                                                                      } catch (e) {
                                                                                                                                                                                                                                                                                                            if (e && e.name === "AbortError") return "A inteligência demorou demais para responder.";
                                                                                                                                                                                                                                                                                                                  return "Não consegui falar com a inteligência. Verifique a conexão.";
                                                                                                                                                                                                                                                                                                                      } finally {
                                                                                                                                                                                                                                                                                                                            clearTimeout(limite);
                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                                                                                        registrar: registrar,
                                                                                                                                                                                                                                                                                                                                            responder: responder,
                                                                                                                                                                                                                                                                                                                                                configurarChave: configurarChave,
                                                                                                                                                                                                                                                                                                                                                    definirModoSerio: definirModoSerio,
                                                                                                                                                                                                                                                                                                                                                        escolherProvedor: escolherProvedor
                                                                                                                                                                                                                                                                                                                                                          };
                                                                                                                                                                                                                                                                                                                                                          })();