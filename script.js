const rotulos = {
      idle: "CALMO",
        ouvindo: "OUVINDO",
          processando: "PROCESSANDO",
            respondendo: "RESPONDENDO",
              erro: "ERRO"
              };

              // Muda o estado do JARVIS. Toda a interface reage a isso.
              function mudarEstado(estado) {
                document.body.dataset.estado = estado;
                  document.getElementById("rotulo").textContent = rotulos[estado];
                  }

                  // Cada botão chama a função com o estado dele
                  document.querySelectorAll(".botoes button").forEach(function (botao) {
                    botao.addEventListener("click", function () {
                        mudarEstado(botao.dataset.estado);
                          });
                          });

                          mudarEstado("idle");
