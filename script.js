const rotulos = {
    idle: "CALMO",
      ouvindo: "OUVINDO",
        processando: "PROCESSANDO",
          respondendo: "RESPONDENDO",
            erro: "ERRO"
            };

            // Como cada estado "se comporta" no orbe
            const perfis = {
              idle:        { vel: 1,   amp: 1,   brilho: 0.55, cor: [53, 200, 255] },
                ouvindo:     { vel: 1.8, amp: 1.5, brilho: 0.8,  cor: [53, 200, 255] },
                  processando: { vel: 4,   amp: 0.8, brilho: 0.9,  cor: [90, 170, 255] },
                    respondendo: { vel: 2.5, amp: 2,   brilho: 1,    cor: [90, 230, 255] },
                      erro:        { vel: 0.4, amp: 0.5, brilho: 0.7,  cor: [255, 77, 94] }
                      };

                      let atual = { ...perfis.idle, cor: [...perfis.idle.cor] };
                      let alvo = perfis.idle;

                      // Muda o estado do JARVIS. Toda a interface reage a isso.
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

                                    // ---------- ORBE (Canvas) ----------
                                    const canvas = document.getElementById("orbe");
                                    const ctx = canvas.getContext("2d");

                                    function ajustar() {
                                      const d = window.devicePixelRatio || 1;
                                        const t = canvas.clientWidth;
                                          canvas.width = t * d;
                                            canvas.height = t * d;
                                              ctx.setTransform(d, 0, 0, d, 0, 0);
                                              }
                                              window.addEventListener("resize", ajustar);
                                              ajustar();

                                              // Cada fio tem números aleatórios próprios
                                              const fios = [];
                                              for (let i = 0; i < 16; i++) {
                                                fios.push({
                                                    f1: 2 + Math.floor(Math.random() * 3),
                                                        f2: 3 + Math.floor(Math.random() * 4),
                                                            p1: Math.random() * 6.28,
                                                                p2: Math.random() * 6.28,
                                                                    v1: (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
                                                                        v2: (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
                                                                            a1: 0.03 + Math.random() * 0.05,
                                                                                a2: 0.02 + Math.random() * 0.04,
                                                                                    raio: 0.9 + Math.random() * 0.12
                                                                                      });
                                                                                      }

                                                                                      let t = 0;
                                                                                      let ultimo = performance.now();

                                                                                      function desenhar(agora) {
                                                                                        const dt = Math.min((agora - ultimo) / 1000, 0.1);
                                                                                          ultimo = agora;

                                                                                            // Aproxima aos poucos do perfil do estado (transição suave)
                                                                                              const k = Math.min(1, dt * 3);
                                                                                                atual.vel += (alvo.vel - atual.vel) * k;
                                                                                                  atual.amp += (alvo.amp - atual.amp) * k;
                                                                                                    atual.brilho += (alvo.brilho - atual.brilho) * k;
                                                                                                      for (let i = 0; i < 3; i++) {
                                                                                                          atual.cor[i] += (alvo.cor[i] - atual.cor[i]) * k;
                                                                                                            }

                                                                                                              t += dt * atual.vel;

                                                                                                                const T = canvas.clientWidth;
                                                                                                                  const c = T / 2;
                                                                                                                    const R = T * 0.36;
                                                                                                                      const cor = atual.cor.map(Math.round).join(",");

                                                                                                                        ctx.clearRect(0, 0, T, T);
                                                                                                                          ctx.globalCompositeOperation = "lighter"; // luz somando luz
                                                                                                                            ctx.shadowBlur = 12;
                                                                                                                              ctx.shadowColor = "rgb(" + cor + ")";
                                                                                                                                ctx.strokeStyle = "rgba(" + cor + "," + atual.brilho * 0.5 + ")";
                                                                                                                                  ctx.lineWidth = 1;

                                                                                                                                    fios.forEach(function (f) {
                                                                                                                                        ctx.beginPath();
                                                                                                                                            for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.04) {
                                                                                                                                                  const onda =
                                                                                                                                                          f.a1 * Math.sin(f.f1 * a + f.p1 + t * f.v1) +
                                                                                                                                                                  f.a2 * Math.sin(f.f2 * a + f.p2 + t * f.v2);
                                                                                                                                                                        const r = R * f.raio * (1 + onda * atual.amp);
                                                                                                                                                                              const x = c + r * Math.cos(a);
                                                                                                                                                                                    const y = c + r * Math.sin(a);
                                                                                                                                                                                          if (a === 0) ctx.moveTo(x, y);
                                                                                                                                                                                                else ctx.lineTo(x, y);
                                                                                                                                                                                                    }
                                                                                                                                                                                                        ctx.stroke();
                                                                                                                                                                                                          });

                                                                                                                                                                                                            requestAnimationFrame(desenhar);
                                                                                                                                                                                                            }

                                                                                                                                                                                                            mudarEstado("idle");
                                                                                                                                                                                                            requestAnimationFrame(desenhar);
