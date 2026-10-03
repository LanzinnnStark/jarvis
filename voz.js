// MÓDULO DE VOZ: só cuida de ouvir e falar.
const Voz = (function () {
  const CONFIG = {
      idiomaOuvir: "pt-BR",
          idiomaFalar: "pt-BR",
              velocidade: 0.95,
                  tom: 0.85 // mais grave
                    };

                      const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
                        const suportaOuvir = !!Reconhecimento;
                          const suportaFalar = "speechSynthesis" in window;
                            let vozEscolhida = null;

                              // As vozes do aparelho carregam um pouco depois da página
                                function escolherVoz() {
                                    if (!suportaFalar) return;
                                        const vozes = speechSynthesis.getVoices();
                                            vozEscolhida = vozes.find(function (v) { return v.lang === CONFIG.idiomaFalar; }) || null;
                                              }
                                                if (suportaFalar) {
                                                    speechSynthesis.onvoiceschanged = escolherVoz;
                                                        escolherVoz();
                                                          }

                                                            // Fala um texto em voz alta e avisa quando terminar
                                                              function falar(texto, aoTerminar) {
                                                                  if (!suportaFalar) {
                                                                        if (aoTerminar) aoTerminar();
                                                                              return;
                                                                                  }
                                                                                      speechSynthesis.cancel();
                                                                                          const fala = new SpeechSynthesisUtterance(texto);
                                                                                              fala.lang = CONFIG.idiomaFalar;
                                                                                                  if (vozEscolhida) fala.voice = vozEscolhida;
                                                                                                      fala.rate = CONFIG.velocidade;
                                                                                                          fala.pitch = CONFIG.tom;
                                                                                                              fala.onend = function () { if (aoTerminar) aoTerminar(); };
                                                                                                                  fala.onerror = function () { if (aoTerminar) aoTerminar(); };
                                                                                                                      speechSynthesis.speak(fala);
                                                                                                                        }

                                                                                                                          // Ouve o microfone. cb pode ter: parcial(texto), erro(codigo), fim(textoFinal)
                                                                                                                            function ouvir(cb) {
                                                                                                                                if (!suportaOuvir) {
                                                                                                                                      if (cb.erro) cb.erro("sem-suporte");
                                                                                                                                            return;
                                                                                                                                                }
                                                                                                                                                    const reconhecedor = new Reconhecimento();
                                                                                                                                                        reconhecedor.lang = CONFIG.idiomaOuvir;
                                                                                                                                                            reconhecedor.interimResults = true;
                                                                                                                                                                reconhecedor.maxAlternatives = 1;

                                                                                                                                                                    let textoFinal = "";
                                                                                                                                                                        let deuErro = false;

                                                                                                                                                                            reconhecedor.onresult = function (e) {
                                                                                                                                                                                  let parcial = "";
                                                                                                                                                                                        for (let i = e.resultIndex; i < e.results.length; i++) {
                                                                                                                                                                                                const trecho = e.results[i][0].transcript;
                                                                                                                                                                                                        if (e.results[i].isFinal) textoFinal += trecho;
                                                                                                                                                                                                                else parcial += trecho;
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                            if (cb.parcial) cb.parcial(textoFinal + parcial);
                                                                                                                                                                                                                                };

                                                                                                                                                                                                                                    reconhecedor.onerror = function (e) {
                                                                                                                                                                                                                                          deuErro = true;
                                                                                                                                                                                                                                                if (cb.erro) cb.erro(e.error);
                                                                                                                                                                                                                                                    };

                                                                                                                                                                                                                                                        reconhecedor.onend = function () {
                                                                                                                                                                                                                                                              if (!deuErro && cb.fim) cb.fim(textoFinal.trim());
                                                                                                                                                                                                                                                                  };

                                                                                                                                                                                                                                                                      reconhecedor.start();
                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                          return { ouvir: ouvir, falar: falar };
                                                                                                                                                                                                                                                                          })();