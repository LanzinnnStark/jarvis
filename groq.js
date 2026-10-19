// PROVEDOR GROQ: rápido, grátis e sem cartão. Precisa do ia.js carregado antes.
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

                                // O gpt-oss "pensa" antes de responder: precisa de mais espaço
                                    // e, com esforço baixo, responde rápido.
                                        const pensa = modelo.indexOf("gpt-oss") !== -1;
                                            const corpo = { model: modelo, messages: mensagens, temperature: 0.8, max_tokens: pensa ? 1024 : 300 };
                                                if (pensa) corpo.reasoning_effort = "low";

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