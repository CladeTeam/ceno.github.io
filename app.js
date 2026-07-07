const canvas = document.querySelector("#genomeCanvas");
const ctx = canvas.getContext("2d");

let tick = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * scale));
  canvas.height = Math.max(360, Math.floor(rect.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function drawGenomeStage() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  tick += 0.01;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillRect(0, 0, width, height);

  const left = width * 0.08;
  const right = width * 0.92;
  const trackTop = height * 0.18;
  const rowGap = height * 0.13;
  const colors = ["#1fbf7a", "#0c8a9a", "#355c9a", "#d95f73"];

  for (let row = 0; row < 4; row += 1) {
    const y = trackTop + row * rowGap;
    ctx.strokeStyle = "rgba(94,111,104,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();

    for (let i = 0; i < 26; i += 1) {
      const x = left + ((right - left) / 25) * i;
      const phase = Math.sin(tick * (row + 1) + i * 0.7);
      const h = 10 + Math.abs(phase) * 32;
      ctx.fillStyle = colors[(i + row) % colors.length];
      ctx.globalAlpha = 0.28 + Math.abs(phase) * 0.45;
      ctx.fillRect(x - 3, y - h / 2, 6, h);
    }
  }
  ctx.globalAlpha = 1;

  const matrixSize = Math.min(width, height) * 0.34;
  const mx = width * 0.52;
  const my = height * 0.58;
  const cells = 13;
  const cell = matrixSize / cells;

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const diagonal = 1 - Math.min(1, Math.abs(x - y) / cells);
      const boundary = x > 5 && y < 6 ? 0.28 : 1;
      const pulse = 0.08 * Math.sin(tick * 5 + x + y);
      const alpha = Math.max(0.05, (diagonal * boundary + pulse) * 0.72);
      ctx.fillStyle = `rgba(12, 138, 154, ${alpha})`;
      ctx.fillRect(mx + x * cell, my + y * cell, cell - 1, cell - 1);
    }
  }

  const needleX = left + (right - left) * (0.28 + Math.sin(tick) * 0.04);
  const queryX = left + (right - left) * 0.82;
  ctx.strokeStyle = "rgba(217,95,115,0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(needleX, trackTop - 38);
  ctx.bezierCurveTo(width * 0.36, height * 0.08, width * 0.64, height * 0.08, queryX, trackTop - 12);
  ctx.stroke();

  ctx.fillStyle = "#d95f73";
  [needleX, queryX].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, trackTop - 38, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawGenomeStage);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
drawGenomeStage();
