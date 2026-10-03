// ORBE 3D (Three.js). Usa "atual" e "alvo", que vêm do script.js
if (typeof THREE === "undefined") {
  document.querySelector(".topo").textContent = "J.A.R.V.I.S. · 3D INDISPONIVEL";
} else {
  iniciarOrbe3D();
}

function iniciarOrbe3D() {
  const canvas = document.getElementById("orbe");

  // 1. Renderizador, cena e câmera
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 5.2;

  function ajustar() {
    const t = canvas.clientWidth;
    renderer.setSize(t, t, false);
  }
  window.addEventListener("resize", ajustar);
  ajustar();

  const ADITIVO = THREE.AdditiveBlending; // luz somando luz

  // 2. Os fios de luz
  const R = 1.5;
  const PONTOS = 160;
  const grupo = new THREE.Group();
  cena.add(grupo);

  const fios = [];
  for (let i = 0; i < 16; i++) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PONTOS * 3), 3));
    const mat = new THREE.LineBasicMaterial({ transparent: true, blending: ADITIVO, depthWrite: false });
    const linha = new THREE.LineLoop(geo, mat);
    linha.rotation.x = (Math.random() - 0.5) * 0.9;
    linha.rotation.y = (Math.random() - 0.5) * 0.9;
    grupo.add(linha);

    fios.push({
      linha: linha,
      f1: 2 + Math.floor(Math.random() * 3),
      f2: 3 + Math.floor(Math.random() * 4),
      fz: 2 + Math.floor(Math.random() * 3),
      p1: Math.random() * 6.28,
      p2: Math.random() * 6.28,
      pz: Math.random() * 6.28,
      v1: (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
      v2: (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
      vz: (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
      a1: 0.03 + Math.random() * 0.05,
      a2: 0.02 + Math.random() * 0.04,
      az: 0.12 + Math.random() * 0.15,
      raio: 0.9 + Math.random() * 0.12
    });
  }

  // 3. O núcleo de energia
  function texturaBrilho() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.5)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texturaBrilho(), transparent: true, blending: ADITIVO, depthWrite: false
  }));
  cena.add(halo);

  const miolo = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  cena.add(miolo);

  const anelA = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.012, 8, 64),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85, blending: ADITIVO })
  );
  const anelB = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.008, 8, 64),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.6, blending: ADITIVO })
  );
  cena.add(anelA);
  cena.add(anelB);

  // Partículas orbitando o núcleo
  const NP = 140;
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  const partMat = new THREE.PointsMaterial({
    size: 0.035, transparent: true, blending: ADITIVO, depthWrite: false
  });
  cena.add(new THREE.Points(partGeo, partMat));

  const parts = [];
  for (let i = 0; i < NP; i++) {
    parts.push({
      th: Math.random() * 6.28,
      ph: Math.acos(2 * Math.random() - 1),
      r: 0.25 + Math.random() * 0.5,
      v: (0.3 + Math.random() * 0.9) * (Math.random() < 0.5 ? -1 : 1)
    });
  }

  // 4. Animação (roda a cada quadro)
  let t = 0;
  let ultimo = performance.now();

  function desenhar(agora) {
    const dt = Math.min((agora - ultimo) / 1000, 0.1);
    ultimo = agora;

    // transição suave até o perfil do estado
    const k = Math.min(1, dt * 3);
    atual.vel += (alvo.vel - atual.vel) * k;
    atual.amp += (alvo.amp - atual.amp) * k;
    atual.brilho += (alvo.brilho - atual.brilho) * k;
    atual.nucleo += (alvo.nucleo - atual.nucleo) * k;
    for (let i = 0; i < 3; i++) {
      atual.cor[i] += (alvo.cor[i] - atual.cor[i]) * k;
    }

    t += dt * atual.vel;

    const cr = atual.cor[0] / 255;
    const cg = atual.cor[1] / 255;
    const cb = atual.cor[2] / 255;

    // fios
    fios.forEach(function (f) {
      const pos = f.linha.geometry.attributes.position.array;
      for (let j = 0; j < PONTOS; j++) {
        const a = (j / PONTOS) * Math.PI * 2;
        const onda =
          f.a1 * Math.sin(f.f1 * a + f.p1 + t * f.v1) +
          f.a2 * Math.sin(f.f2 * a + f.p2 + t * f.v2);
        const r = R * f.raio * (1 + onda * atual.amp);
        pos[j * 3]     = r * Math.cos(a);
        pos[j * 3 + 1] = r * Math.sin(a);
        pos[j * 3 + 2] = f.az * Math.sin(f.fz * a + f.pz + t * f.vz) * atual.amp;
      }
      f.linha.geometry.attributes.position.needsUpdate = true;
      f.linha.material.color.setRGB(cr, cg, cb);
      f.linha.material.opacity = atual.brilho * 0.55;
    });

    // o conjunto gira devagar no espaço
    grupo.rotation.y = Math.sin(t * 0.3) * 0.6;
    grupo.rotation.x = 0.35 + Math.sin(t * 0.2) * 0.2;
    grupo.rotation.z = t * 0.05;

    // núcleo pulsando
    const pulso = 1 + 0.12 * Math.sin(t * 2.2);
    halo.material.color.setRGB(cr, cg, cb);
    halo.material.opacity = Math.min(1, 0.55 * atual.nucleo);
    halo.scale.setScalar(1.3 * atual.nucleo * pulso);
    miolo.scale.setScalar(pulso);
    anelA.material.color.setRGB(cr, cg, cb);
    anelB.material.color.setRGB(cr, cg, cb);
    anelA.rotation.x = t * 0.9;
    anelA.rotation.y = t * 0.5;
    anelB.rotation.y = -t * 0.7;
    anelB.rotation.z = t * 0.4;

    // partículas
    partMat.color.setRGB(cr, cg, cb);
    const ppos = partGeo.attributes.position.array;
    const espalha = 0.9 + 0.15 * atual.nucleo;
    for (let i = 0; i < NP; i++) {
      const p = parts[i];
      p.th += dt * p.v * atual.vel;
      const rr = p.r * espalha;
      ppos[i * 3]     = rr * Math.sin(p.ph) * Math.cos(p.th);
      ppos[i * 3 + 1] = rr * Math.cos(p.ph);
      ppos[i * 3 + 2] = rr * Math.sin(p.ph) * Math.sin(p.th);
    }
    partGeo.attributes.position.needsUpdate = true;

    renderer.render(cena, camera);
    requestAnimationFrame(desenhar);
  }

  requestAnimationFrame(desenhar);
}