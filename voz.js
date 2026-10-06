// MÓDULO DE VOZ: só cuida de ouvir e falar.
// Leve de propósito: usa só as vozes que já existem no navegador.
const Voz = (function () {
  const CONFIG = {
      idiomaOuvir: "pt-BR",
          idiomaFalar: "pt-BR",
              velocidade: 0.95,
                  tom: 0.9 // mais grave (algumas vozes "Natural" ignoram o tom)
                    };

                      const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
                        const suportaOuvir = !!Reconhecimento;
                          const suportaFalar = "speechSynthesis" in window;
                            let vozEscolhida = null;

                              // Dá nota para cada voz pt-BR e fica com a melhor.
                                // Prefere vozes "Natural"/"Online" (mais humanas) e masculinas.
                                  function nota(v) {
                                      const n = v.name.toLowerCase();
                                          let p = 0;
                                              if (/natural|online/.test(n)) p += 10;
                                                  if (/antonio|antônio|donato|daniel|ricardo|jorge|felipe|thiago|masculin|male/.test(n)) p += 5;
                                                      if (/francisca|thalita|maria|luciana|brenda|yara|leila|elza|giovanna|manuela|fernanda|camila|vitoria|feminin|female/.test(n)) p -= 10;
                                                          if (!v.localService) p += 1;
                                                              return p;
                                                                }

                                                                  // As vozes do aparelho carregam um pouco depois da página
                                                                    function escolherVoz() {
                                                                        if (!suportaFalar) return;
                                                                            const vozes = speechSynthesis.getVoices().filter(function (v) {
                                                                                  return /^pt[-_]br$/i.test(v.lang); // aceita "pt-BR" e "pt_BR"
                                                                                      });
                                                                                          vozes.sort(function (a, b) { return nota(b) - nota(a); });
                                                                                              vozEscolhida = vozes[0] || null;
                                                                                                }
                                                                                                  if (suportaFalar) {
                                                                                                      speechSynthesis.onvoiceschanged = escolherVoz;
                                                                                                          escolherVoz();
                                                                                                            }

                                                                                                              // Nome da voz em uso (só para você conferir na tela)
                                                                                                                function nomeVoz() {
                                                                                                                    if (!suportaFalar) return "sem suporte a fala";
                                                                                                                        return vozEscolhida ? vozEscolhida.name : "padrão do aparelho";
                                                                                                                          }

                                                                                                                            // Fala um texto em voz alta e avisa quando terminar
                                                                                                                              function falar(texto, aoTerminar) {
                                                                                                                                  if (!suportaFalar) {
                                                                                                                                        if (aoTerminar) aoTerminar();
                                                                                                                                              return;
                                                                                                                                                  }

                                                                                                                                                      // Garante que "aoTerminar" roda uma vez só
                                                                                                                                                          let acabou = false;
                                                                                                                                                              function terminar() {
                                                                                                                                                                    if (acabou) return;
                                                                                                                                                                          acabou = true;
                                                                                                                                                                                clearTimeout(limite);
                                                                                                                                                                                      if (aoTerminar) aoTerminar();
                                                                                                                                                                                          }
                                                                                                                                                                                              // Segurança: se o navegador esquecer de avisar o fim, não trava o JARVIS
                                                                                                                                                                                                  const limite = setTimeout(terminar, 4000 + texto.length * 110);

                                                                                                                                                                                                      speechSynthesis.cancel();
                                                                                                                                                                                                          const fala = new SpeechSynthesisUtterance(texto);
                                                                                                                                                                                                              fala.lang = CONFIG.idiomaFalar;
                                                                                                                                                                                                                  if (vozEscolhida) fala.voice = vozEscolhida;
                                                                                                                                                                                                                      fala.rate = CONFIG.velocidade;
                                                                                                                                                                                                                          fala.pitch = CONFIG.tom;
                                                                                                                                                                                                                              fala.onend = terminar;
                                                                                                                                                                                                                                  fala.onerror = terminar;
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

                                                                                                                                                                                                                                                                                                                                                                                          return { ouvir: ouvir, falar: falar, nomeVoz: nomeVoz };
                                                                                                                                                                                                                                                                                                                                                                                          })();
                                                                                                                                                                                                                                                                                                                                                                                          