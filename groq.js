// PROVEDOR GROQ: rápido, grátis e sem cartão. Precisa do ia.js carregado antes.
// Pergunta difícil? (longa ou com palavras de explicar, planejar, criar)
function dificil(pergunta) {
  return pergunta.length > 90 ||
      /(como|por ?que|explic|ideia|projeto|cri[ae]|planej|compar|melhor|ajud|monta|desenh)/i.test(pergunta);
      }

      IA.registrar("groq", {
        nome: "Groq",
          site: "console.groq.com",
            chaveStorage: "jarvis_chave_groq",
              // Do mais inteligente para o mais simples. Cada modelo tem limite próprio:
                // se um estiver no limite ou recusar o pedido, a IA tenta o próximo da lista.
                  modelos: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"],

                    chamar: async function (chave, modelo, sistema, msgs, sinal) {
                        const mensagens = [{ role: "system", content: sistema }].concat(
                              msgs.map(function (m) { return { role: m.papel, content: m.texto }; })
                                  );

                                      // O gpt-oss "pensa" antes de responder. Pergunta simples: pensa pouco e responde rápido.
                                          // Pergunta difícil (explicar, planejar, criar ideias): pensa mais.
                                              const pensa = modelo.indexOf("gpt-oss") !== -1;
                                                  const corpo = { model: modelo, messages: mensagens, temperature: 0.8, max_tokens: pensa ? 1500 : 450 };
                                                      if (pensa) corpo.reasoning_effort = dificil(msgs[msgs.length - 1].texto) ? "medium" : "low";

                                                          const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                                                                method: "POST",
                                                                      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + chave },
                                                                            body: JSON.stringify(corpo),
                                                                                  signal: sinal
                                                                                      });
                                                                                          if (!resp.ok) return { status: resp.status, texto: "" };
                                                                                              const dados = await resp.json();
                                                                                                  const msg = dados.choices && dados.choices[0] && dados.choices[0].message;
                                                                                                      return { status: 200, texto: (msg && msg.content) || "" };
                                                                                                        }
                                                                                                        });