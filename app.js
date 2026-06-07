// Contact form
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactStatus.textContent = 'Thanks! We will get back to you shortly.';
    });
  }

  // Pass generator
  const passForm = document.getElementById('passForm');
  const passResult = document.getElementById('passResult');
  const passMeta = document.getElementById('passMeta');
  const qrCanvas = document.getElementById('qrCanvas');

  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("Submit triggered");
      const data = new FormData(passForm);
      const name = data.get('fullName');
      const email = data.get('email');
      const purpose = data.get('purpose');
      const entryTime = data.get('entryTime');

      // Simulate adaptive slot adjustment
      const adjusted = adjustTimeSlot(entryTime);
      const passId ="SF-" +Math.random().toString(36).substring(2, 8).toUpperCase();
      passMeta.innerHTML = `
        <strong>Pass ID:</strong> ${passId}<br>
        <strong>Name:</strong> ${name}<br>
        <strong>Purpose:</strong> ${purpose}<br>
        <strong>Entry Slot:</strong> ${adjusted}
      `;
      generateQR(`Pass ID: ${passId}\nName: ${name}\nEvent: ${purpose}\nEntry Time: ${adjusted}`);
      passResult.classList.remove('hidden');

      emailjs.send(
        "service_lesmz7v",
        "template_baoypb9",
        {
          passId: passId,
          name: name,
          email: email,
          purpose: purpose,
          time: adjusted
        }
      )
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error("Email failed:", error);
      });
    });
  }

  // Heatmap simulation
  const heatmapCanvas = document.getElementById('heatmapCanvas');
  const refreshHeatmap = document.getElementById('refreshHeatmap');
  const toggleEvac = document.getElementById('toggleEvac');
  const evacStatus = document.getElementById('evacStatus');
  let evacMode = false;

  if (heatmapCanvas) {
    drawHeatmap(heatmapCanvas, evacMode);
    refreshHeatmap?.addEventListener('click', () => drawHeatmap(heatmapCanvas, evacMode));
    toggleEvac?.addEventListener('click', () => {
      evacMode = !evacMode;
      evacStatus.textContent = evacMode ? 'Evacuation mode ON — guiding to nearest safe exits.' : 'Evacuation mode OFF.';
      drawHeatmap(heatmapCanvas, evacMode);
    });
  }

  // AR overlay prototype
  const startAR = document.getElementById('startAR');
  const rerouteAR = document.getElementById('rerouteAR');
  const cameraFeed = document.getElementById('cameraFeed');
  const arCanvas = document.getElementById('arCanvas');

  if (startAR && cameraFeed && arCanvas) {
    startAR.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraFeed.srcObject = stream;
        drawArrows(arCanvas);
      } catch (err) {
        alert('Camera access denied or unavailable.');
      }
    });
    rerouteAR.addEventListener('click', () => drawArrows(arCanvas, true));
  }

  // Alerts simulation
  const simulateAlert = document.getElementById('simulateAlert');
  const surgeTime = document.getElementById('surgeTime');
  const surgeAction = document.getElementById('surgeAction');
  if (simulateAlert) {
    simulateAlert.addEventListener('click', () => {
      const t = randomSurgeTime();
      surgeTime.textContent = t;
      surgeAction.textContent = Math.random() > 0.5
        ? 'Stagger exits: direct visitors to Gates B & D.'
        : 'Delay entry slots by 10 minutes; open auxiliary Gate F.';
    });
  }

  // Admin dashboard
  const gateChart = document.getElementById('gateChart');
  if (gateChart) drawGateChart(gateChart);

  const saveThresholds = document.getElementById('saveThresholds');
  const thresholdStatus = document.getElementById('thresholdStatus');
  const maxZone = document.getElementById('maxZone');
  if (saveThresholds) {
    saveThresholds.addEventListener('click', () => {
      thresholdStatus.textContent = `Saved: Max per zone set to ${maxZone.value}.`;
    });
  }

  const sendBroadcast = document.getElementById('sendBroadcast');
  const broadcastMsg = document.getElementById('broadcastMsg');
  const broadcastStatus = document.getElementById('broadcastStatus');
  if (sendBroadcast) {
    sendBroadcast.addEventListener('click', () => {
      const msg = broadcastMsg.value.trim();
      if (!msg) return (broadcastStatus.textContent = 'Message cannot be empty.');
      broadcastStatus.textContent = 'Broadcast sent to visitor devices.';
      broadcastMsg.value = '';
    });
  }
});

// Helpers

function adjustTimeSlot(timeStr) {
  // Simple adaptive logic: if minutes < 30, push by +5; else keep
  const [h, m] = timeStr.split(':').map(Number);
  const minutes = h * 60 + m + (m < 30 ? 5 : 0);
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function generateQR(text) {

  const qrContainer = document.getElementById("qrCanvas");

  qrContainer.innerHTML = "";

  new QRCode(qrContainer, {
      text: text,
      width: 180,
      height: 180
  });
}

function drawHeatmap(canvas, evacMode) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw zones
  const zones = 16;
  const w = canvas.width / 4;
  const h = canvas.height / 4;
  for (let i = 0; i < zones; i++) {
    const r = Math.floor(i / 4), c = i % 4;
    const density = Math.random(); // simulate
    const color = densityToColor(density, evacMode);
    ctx.fillStyle = color;
    ctx.fillRect(c * w + 4, r * h + 4, w - 8, h - 8);
  }

  // Legend
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Low', 10, canvas.height - 20);
  ctx.fillStyle = '#e50914';
  ctx.fillText('High', 60, canvas.height - 20);
  if (evacMode) {
    ctx.fillStyle = '#e50914';
    ctx.fillText('Evacuation routes prioritized', canvas.width - 220, canvas.height - 20);
  }
}

function densityToColor(d, evac) {
  // Gradient from dark gray to red; evac mode intensifies red
  const base = evac ? 180 : 120;
  const r = Math.min(255, base + Math.floor(d * 75));
  const g = Math.floor(20 + (1 - d) * 40);
  const b = Math.floor(20 + (1 - d) * 40);
  return `rgb(${r},${g},${b})`;
}

function drawArrows(canvas, reroute = false) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Semi‑transparent overlay
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw path arrows
  ctx.strokeStyle = '#e50914';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  const path = reroute
    ? [ [50, canvas.height - 80], [canvas.width/2, canvas.height/2], [canvas.width - 60, 80] ]
    : [ [60, canvas.height - 60], [canvas.width/3, canvas.height/2], [canvas.width - 80, 120] ];

  ctx.beginPath();
  ctx.moveTo(path[0][0], path[0][1]);
  for (let i = 1; i < path.length; i++) ctx.lineTo(path[i][0], path[i][1]);
  ctx.stroke();

  // Arrowhead
  const [x2, y2] = path[path.length - 1];
  ctx.fillStyle = '#e50914';
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 14, y2 - 8);
  ctx.lineTo(x2 - 14, y2 + 8);
  ctx.closePath();
  ctx.fill();

  // Safe zone markers
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '14px sans-serif';
  ctx.fillText('Safe Exit', x2 - 60, y2 + 24);
}

function randomSurgeTime() {
  const now = new Date();
  const add = Math.floor(Math.random() * 40) + 5; // 5–45 minutes
  const t = new Date(now.getTime() + add * 60000);
  return `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
}

function drawGateChart(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gates = ['A','B','C','D','E'];
  const vals = gates.map(() => Math.floor(Math.random() * 100));
  const max = Math.max(...vals);
  const barW = (canvas.width - 40) / gates.length;

  gates.forEach((g, i) => {
    const h = Math.floor((vals[i] / max) * (canvas.height - 40));
    ctx.fillStyle = '#e50914';
    ctx.fillRect(20 + i * barW, canvas.height - 20 - h, barW - 10, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Gate ${g}`, 20 + i * barW, canvas.height - 6);
  });
}