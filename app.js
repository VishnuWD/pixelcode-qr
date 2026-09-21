/**
 * ============================================================================
 * PIXELCODE QR GENERATOR V2 — CORE APPLICATION ENGINE
 * Clean, Fast, Bug-Free, and Built to Convert
 * ============================================================================
 */

// Application State
const state = {
  mode: 'basic', // 'basic' | 'advanced'
  contentType: 'url',
  template: 'scan-me-pill',
  color1: '#6D5DFB',
  color2: '#00C2FF',
  themeName: 'PixelCode',
  dotsType: 'dots',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  logo: {
    active: true,
    src: 'pixelcode-logo.png'
  },
  customFrame: {
    cta: 'SCAN ME',
    sub: 'Point phone camera to scan'
  },
  errorLevel: 'H',
  exportRes: 2048
};

// 10 Curated Designer Templates
const TEMPLATES = [
  {
    id: 'barebone',
    name: 'Barebone QR',
    desc: 'Pure clean vector QR code with no frame or extras',
    icon: '⬛',
    defaultCta: '',
    defaultSub: ''
  },
  {
    id: 'scan-me-pill',
    name: 'Classic "SCAN ME"',
    desc: 'High-converting banner pill with camera badge',
    icon: '📸',
    defaultCta: 'SCAN ME',
    defaultSub: 'Point your camera to scan'
  },
  {
    id: 'upi-standee',
    name: 'UPI / Pay Standee',
    desc: 'Counter payment standee (GPay, PhonePe, Paytm)',
    icon: '💳',
    defaultCta: 'SCAN & PAY ANY UPI',
    defaultSub: 'GPay • PhonePe • Paytm • BHIM'
  },
  {
    id: 'restaurant-menu',
    name: 'Dining Menu',
    desc: 'Cafe & table tent frame for digital menus',
    icon: '🍽️',
    defaultCta: 'DIGITAL MENU & SPECIALS',
    defaultSub: 'Scan to browse menu & order'
  },
  {
    id: 'whatsapp-chat',
    name: 'WhatsApp Connect',
    desc: 'Official WhatsApp emerald frame with chat badge',
    icon: '💬',
    defaultCta: 'CHAT ON WHATSAPP',
    defaultSub: 'Instant support & fast response'
  },
  {
    id: 'social-insta',
    name: 'Instagram Follow',
    desc: 'Sunset gradient header with Instagram badge',
    icon: '✨',
    defaultCta: 'FOLLOW ON INSTAGRAM',
    defaultSub: 'Scan to visit official profile'
  },
  {
    id: 'wifi-connect',
    name: 'Guest Wi-Fi Sign',
    desc: 'Hotel & office card for instant Wi-Fi access',
    icon: '📶',
    defaultCta: 'FREE GUEST WI-FI',
    defaultSub: 'Scan to connect with no password typing'
  },
  {
    id: 'vcard-contact',
    name: 'Digital Business Card',
    desc: 'Executive card to save contact info directly',
    icon: '👤',
    defaultCta: 'SAVE DIGITAL CONTACT',
    defaultSub: 'Scan to add to phone address book'
  },
  {
    id: 'coupon-voucher',
    name: 'Discount Voucher',
    desc: 'Dashed coupon ticket with side notch cutouts',
    icon: '🏷️',
    defaultCta: 'CLAIM 20% DISCOUNT',
    defaultSub: 'Scan at checkout to redeem offer'
  },
  {
    id: 'minimal-border',
    name: 'Swiss Hairline',
    desc: 'Ultra-clean architectural border & quiet margins',
    icon: '📐',
    defaultCta: 'PIXELCODE DIRECT',
    defaultSub: 'Official verified portal'
  }
];

// Reference to in-memory rendered QR image
let currentQRImage = null;
let renderDebounceTimer = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  renderTemplatesGrid();
  bindInputEvents();
  renderQR();
  initMobileFloatingPreviewObserver();
  initDraggableMobilePreview();
});

function initMobileFloatingPreviewObserver() {
  const previewCard = document.getElementById('mainPreviewCard');
  const floatingPip = document.getElementById('mobileFloatingPreview');
  if (!previewCard || !floatingPip) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (window.innerWidth <= 1024) {
          if (entry.isIntersecting) {
            floatingPip.style.opacity = '0';
            floatingPip.style.pointerEvents = 'none';
            floatingPip.style.transform = 'translateY(15px)';
          } else {
            floatingPip.style.opacity = '1';
            floatingPip.style.pointerEvents = 'auto';
            floatingPip.style.transform = 'translateY(0)';
          }
        }
      });
    }, { threshold: 0.15 });

    observer.observe(previewCard);
  }
}

// Draggable Floating Preview Controller for Mobile & Small Screens
function initDraggableMobilePreview() {
  const pip = document.getElementById('mobileFloatingPreview');
  if (!pip) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let hasMoved = false;

  function onDragStart(e) {
    // Don't initiate drag if clicking on interactive buttons inside
    if (e.target.closest('button')) return;

    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;

    const rect = pip.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    hasMoved = false;
    isDragging = true;

    pip.classList.add('is-dragging');

    // Switch from right/bottom to absolute left/top coordinates
    pip.style.right = 'auto';
    pip.style.bottom = 'auto';
    pip.style.left = `${initialLeft}px`;
    pip.style.top = `${initialTop}px`;
  }

  function onDragMove(e) {
    if (!isDragging) return;

    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved = true;
      if (e.cancelable) e.preventDefault(); // Prevent accidental scroll
    }

    const pipWidth = pip.offsetWidth || 114;
    const pipHeight = pip.offsetHeight || 155;

    // Viewport bounds with padding
    const minX = 8;
    const maxX = window.innerWidth - pipWidth - 8;
    const minY = 50;
    const maxY = window.innerHeight - pipHeight - 12;

    const newLeft = Math.min(Math.max(initialLeft + dx, minX), maxX);
    const newTop = Math.min(Math.max(initialTop + dy, minY), maxY);

    pip.style.left = `${newLeft}px`;
    pip.style.top = `${newTop}px`;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    pip.classList.remove('is-dragging');

    if (hasMoved) {
      pip._justDragged = true;
      setTimeout(() => {
        pip._justDragged = false;
      }, 180);
    }
  }

  // Pointer & Touch Events
  pip.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove, { passive: false });
  window.addEventListener('mouseup', onDragEnd);

  pip.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: false });
  window.addEventListener('touchend', onDragEnd);
}

// Render the 10 Templates in Step 2
function renderTemplatesGrid() {
  const container = document.getElementById('templatesGrid');
  if (!container) return;

  container.innerHTML = TEMPLATES.map(tmpl => {
    const isBarebone = tmpl.id === 'barebone';
    return `
      <div class="template-card ${isBarebone ? 'is-barebone' : ''} ${state.template === tmpl.id ? 'active' : ''}" onclick="selectTemplate('${tmpl.id}')" data-tid="${tmpl.id}">
        <div class="template-badge-icon">${tmpl.icon}</div>
        <div class="template-name">${tmpl.name}</div>
        <div class="template-desc">${tmpl.desc}</div>
      </div>
    `;
  }).join('');
}

// Bind live inputs across forms
function bindInputEvents() {
  const inputIds = [
    'inputUrl', 'waPhone', 'waMessage', 'upiId', 'upiName', 'upiAmount', 'upiNote',
    'wifiSsid', 'wifiPass', 'wifiType', 'vcardName', 'vcardTitle', 'vcardPhone', 'vcardEmail', 'plainText'
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', scheduleRender);
      el.addEventListener('change', scheduleRender);
    }
  });
}

function scheduleRender() {
  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(renderQR, 80);
}

// ============================================================================
// MODE SWITCHING (BASIC vs ADVANCED)
// ============================================================================

function switchMode(mode) {
  state.mode = mode;
  document.getElementById('modeBasicBtn').classList.toggle('active', mode === 'basic');
  document.getElementById('modeAdvancedBtn').classList.toggle('active', mode === 'advanced');

  const advSection = document.getElementById('advancedOptionsSection');
  if (advSection) {
    advSection.style.display = mode === 'advanced' ? 'block' : 'none';
  }

  showToast(`Switched to ${mode === 'basic' ? 'Basic' : 'Advanced'} Mode`);
}

// ============================================================================
// CONTENT TYPE SELECTOR
// ============================================================================

function selectType(type) {
  state.contentType = type;

  // Update button active states
  document.querySelectorAll('.type-btn, .type-chip, .type-nav-btn').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.type === type);
  });

  // Toggle active form
  document.querySelectorAll('.form-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const activePanel = document.getElementById(`form-${type}`);
  if (activePanel) activePanel.classList.add('active');

  // Intelligent template auto-select for best UX
  if (type === 'whatsapp' && state.template === 'scan-me-pill') selectTemplate('whatsapp-chat');
  else if (type === 'upi' && state.template === 'scan-me-pill') selectTemplate('upi-standee');
  else if (type === 'wifi' && state.template === 'scan-me-pill') selectTemplate('wifi-connect');
  else if (type === 'vcard' && state.template === 'scan-me-pill') selectTemplate('vcard-contact');

  scheduleRender();
}

// ============================================================================
// TEMPLATE SELECTION
// ============================================================================

function selectTemplate(templateId) {
  state.template = templateId;

  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.toggle('active', card.dataset.tid === templateId);
  });

  const tmpl = TEMPLATES.find(t => t.id === templateId);
  if (tmpl) {
    state.customFrame.cta = tmpl.defaultCta;
    state.customFrame.sub = tmpl.defaultSub;
    const ctaInput = document.getElementById('advCtaText');
    const subInput = document.getElementById('advSubText');
    if (ctaInput) ctaInput.value = tmpl.defaultCta;
    if (subInput) subInput.value = tmpl.defaultSub;
  }

  scheduleRender();
}

// ============================================================================
// COLOR THEMES
// ============================================================================

function setBrandTheme(color1, color2, name) {
  state.color1 = color1;
  state.color2 = color2;
  state.themeName = name;

  document.querySelectorAll('.palette-btn, .color-choice-btn, .color-chip-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (typeof event !== 'undefined' && event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  } else {
    document.querySelectorAll('.palette-btn, .color-choice-btn, .color-chip-btn').forEach(btn => {
      if (btn.textContent.includes(name)) btn.classList.add('active');
    });
  }

  // Sync with Advanced inputs
  const adv1 = document.getElementById('advColor1');
  const adv1Hex = document.getElementById('advColor1Hex');
  const adv2 = document.getElementById('advColor2');
  const adv2Hex = document.getElementById('advColor2Hex');
  if (adv1) adv1.value = color1;
  if (adv1Hex) adv1Hex.value = color1;
  if (adv2) adv2.value = color2;
  if (adv2Hex) adv2Hex.value = color2;

  scheduleRender();
}

function updateAdvColors() {
  const adv1 = document.getElementById('advColor1');
  const adv2 = document.getElementById('advColor2');
  if (adv1) {
    state.color1 = adv1.value;
    document.getElementById('advColor1Hex').value = adv1.value;
  }
  if (adv2) {
    state.color2 = adv2.value;
    document.getElementById('advColor2Hex').value = adv2.value;
  }
  scheduleRender();
}

// ============================================================================
// ADVANCED CUSTOMIZATIONS
// ============================================================================

function setDotStyle(style) {
  state.dotsType = style;
  document.querySelectorAll('[data-dot]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dot === style);
  });
  scheduleRender();
}

function setCornerSquare(style) {
  state.cornerSquareType = style;
  document.querySelectorAll('[data-eye]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.eye === style);
  });
  scheduleRender();
}

function setCornerDot(style) {
  state.cornerDotType = style;
  document.querySelectorAll('[data-ball]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ball === style);
  });
  scheduleRender();
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    state.logo.active = true;
    state.logo.src = e.target.result;
    state.errorLevel = 'H'; // Safe scan tolerance with logo
    showToast('Custom logo applied!');
    scheduleRender();
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  state.logo.active = false;
  state.logo.src = null;
  const input = document.getElementById('advLogoInput');
  if (input) input.value = '';
  showToast('Logo removed');
  scheduleRender();
}

function updateCustomFrame() {
  const cta = document.getElementById('advCtaText')?.value || '';
  const sub = document.getElementById('advSubText')?.value || '';
  state.customFrame.cta = cta;
  state.customFrame.sub = sub;
  scheduleRender();
}

function setErrorLevel(level) {
  state.errorLevel = level;
  document.querySelectorAll('#advancedOptionsSection .options-pill-grid button').forEach(b => {
    if (b.textContent.includes('%')) {
      b.classList.toggle('active', b.textContent.includes(level));
    }
  });
  scheduleRender();
}

// ============================================================================
// PAYLOAD FORMATTER
// ============================================================================

function getPayload() {
  switch (state.contentType) {
    case 'url': {
      let url = (document.getElementById('inputUrl')?.value || 'https://pixelcode.in').trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url;
    }
    case 'whatsapp': {
      const phone = (document.getElementById('waPhone')?.value || '919959607605').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(document.getElementById('waMessage')?.value || 'Hi PixelCode!');
      return `https://wa.me/${phone}?text=${msg}`;
    }
    case 'upi': {
      const id = document.getElementById('upiId')?.value || 'pixelcode@upi';
      const name = document.getElementById('upiName')?.value || 'PixelCode';
      const amt = document.getElementById('upiAmount')?.value || '';
      const note = document.getElementById('upiNote')?.value || 'Payment';
      const p = new URLSearchParams();
      p.set('pa', id);
      p.set('pn', name);
      p.set('cu', 'INR');
      if (amt) p.set('am', amt);
      if (note) p.set('tn', note);
      return `upi://pay?${p.toString()}`;
    }
    case 'wifi': {
      const ssid = document.getElementById('wifiSsid')?.value || 'Guest_WiFi';
      const pass = document.getElementById('wifiPass')?.value || '';
      const type = document.getElementById('wifiType')?.value || 'WPA';
      return `WIFI:S:${ssid};T:${type};P:${pass};;`;
    }
    case 'vcard': {
      const name = document.getElementById('vcardName')?.value || 'Vishnu | PixelCode';
      const title = document.getElementById('vcardTitle')?.value || 'Director';
      const phone = document.getElementById('vcardPhone')?.value || '+919959607605';
      const email = document.getElementById('vcardEmail')?.value || 'info@pixelcode.in';
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTITLE:${title}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
    }
    case 'text':
    default:
      return document.getElementById('plainText')?.value || 'PixelCode QR';
  }
}

// ============================================================================
// CORE CANVAS COMPOSITING & RENDERING (ZERO BUGS)
// ============================================================================

async function renderQR() {
  const displayCanvas = document.getElementById('qrDisplayCanvas');
  if (!displayCanvas) return;

  const payload = getPayload();

  // Create temporary in-memory qr-code-styling generator
  const qrGen = new QRCodeStyling({
    width: 600,
    height: 600,
    data: payload,
    image: state.logo.active && state.logo.src ? state.logo.src : '',
    dotsOptions: {
      type: state.dotsType,
      color: state.color1,
      gradient: state.color1 !== state.color2 ? {
        type: 'linear',
        rotation: Math.PI / 4,
        colorStops: [
          { offset: 0, color: state.color1 },
          { offset: 1, color: state.color2 }
        ]
      } : undefined
    },
    backgroundOptions: {
      color: '#FFFFFF'
    },
    cornersSquareOptions: {
      type: state.cornerSquareType,
      color: state.color1
    },
    cornersDotOptions: {
      type: state.cornerDotType,
      color: state.color1
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 4,
      imageSize: 0.28,
      hideBackgroundDots: true
    },
    qrOptions: {
      errorCorrectionLevel: state.errorLevel
    }
  });

  try {
    const rawBlob = await qrGen.getRawData('png');
    if (!rawBlob) return;

    const img = new Image();
    img.src = URL.createObjectURL(rawBlob);
    img.onload = () => {
      currentQRImage = img;
      paintTemplate(displayCanvas, img, 480);
      const floatCanvas = document.getElementById('mobileFloatingCanvas');
      if (floatCanvas) {
        paintTemplate(floatCanvas, img, 240);
      }
      URL.revokeObjectURL(img.src);
    };
  } catch (err) {
    console.error('QR Render Error:', err);
  }
}

/**
 * Helper to dynamically fit text inside a bounding width without clipping or overflowing
 */
function drawFittedText(ctx, text, x, y, maxWidth, maxFontSize, fontWeight, fontFamily, color, baseline = 'middle') {
  if (!text) return;
  ctx.save();
  let fontSize = maxFontSize;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  let textWidth = ctx.measureText(text).width;

  while (textWidth > maxWidth && fontSize > 8) {
    fontSize -= 0.5;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    textWidth = ctx.measureText(text).width;
  }

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Paints the selected designer template onto any target canvas
 */
function paintTemplate(canvas, qrImg, baseWidth) {
  const ctx = canvas.getContext('2d');
  const tmpl = state.template;
  const brandColor = state.color1;

  let width = baseWidth;
  let height = baseWidth;
  let qrX = 0, qrY = 0, qrSize = Math.round(width * 0.72);

  // Proportional geometries based on template
  if (tmpl === 'barebone' || tmpl === 'plain') {
    height = width;
    qrSize = Math.round(width * 0.84);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round((height - qrSize) / 2);
  } else if (tmpl === 'scan-me-pill') {
    height = Math.round(width * 1.30);
    qrSize = Math.round(width * 0.72);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.08);
  } else if (tmpl === 'upi-standee') {
    height = Math.round(width * 1.34);
    qrSize = Math.round(width * 0.68);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.21);
  } else if (tmpl === 'restaurant-menu') {
    height = Math.round(width * 1.32);
    qrSize = Math.round(width * 0.70);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.16);
  } else if (tmpl === 'whatsapp-chat') {
    height = Math.round(width * 1.30);
    qrSize = Math.round(width * 0.70);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.19);
  } else if (tmpl === 'social-insta') {
    height = Math.round(width * 1.32);
    qrSize = Math.round(width * 0.70);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.20);
  } else if (tmpl === 'wifi-connect') {
    height = Math.round(width * 1.30);
    qrSize = Math.round(width * 0.70);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.16);
  } else if (tmpl === 'vcard-contact') {
    height = Math.round(width * 1.30);
    qrSize = Math.round(width * 0.70);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.16);
  } else if (tmpl === 'coupon-voucher') {
    height = Math.round(width * 1.30);
    qrSize = Math.round(width * 0.66);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.16);
  } else if (tmpl === 'minimal-border') {
    height = Math.round(width * 1.15);
    qrSize = Math.round(width * 0.76);
    qrX = Math.round((width - qrSize) / 2);
    qrY = Math.round(width * 0.08);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  const cardRadius = Math.round(width * 0.055);
  const strokeW = Math.max(1.5, Math.round(width * 0.003));

  // 1. DRAW FRAME BACKGROUND & ACCENTS
  switch (tmpl) {
    case 'barebone':
    case 'plain': {
      drawRoundedCard(ctx, 0, 0, width, height, Math.round(width * 0.04), '#FFFFFF', '#E8ECF4', strokeW);
      break;
    }

    case 'scan-me-pill': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Inner QR Plate
      const platePad = Math.round(width * 0.022);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.04), '#F8FAFC', '#F1F5F9', 1);

      // Slim, elegant button pill (proportional 44px on 480px, NOT a giant blob!)
      const pillHeight = Math.round(width * 0.092);
      const pillWidth = Math.round(width * 0.62);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.06);

      // Create rich brand gradient for the pill
      const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillWidth, pillY + pillHeight);
      pillGrad.addColorStop(0, state.color1);
      pillGrad.addColorStop(1, state.color2 || state.color1);

      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, pillGrad, null, 0);

      // CTA Text cleanly centered inside pill
      drawFittedText(ctx, state.customFrame.cta || 'SCAN ME', width / 2, pillY + (pillHeight / 2), pillWidth * 0.82, Math.round(pillHeight * 0.36), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle comfortably below the pill
      const subY = pillY + pillHeight + Math.round(width * 0.052);
      drawFittedText(ctx, state.customFrame.sub || 'Point phone camera to scan', width / 2, subY, width * 0.85, Math.round(width * 0.027), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'upi-standee': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Header Banner
      const headerH = Math.round(width * 0.15);
      const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
      headerGrad.addColorStop(0, '#0088CC');
      headerGrad.addColorStop(1, '#00A3FF');
      drawTopRoundedCard(ctx, 0, 0, width, headerH, cardRadius, headerGrad);
      drawFittedText(ctx, 'BHIM UPI • ACCEPTED HERE', width / 2, headerH / 2, width * 0.88, Math.round(width * 0.034), '800', 'Sora, sans-serif', '#FFFFFF');

      // QR Plate
      const platePad = Math.round(width * 0.02);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.035), '#F8FAFC', '#E2E8F0', 1);

      // Slim CTA Pill
      const pillHeight = Math.round(width * 0.088);
      const pillWidth = Math.round(width * 0.72);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#09090B', null, 0);

      drawFittedText(ctx, state.customFrame.cta || 'SCAN & PAY WITH ANY APP', width / 2, pillY + (pillHeight / 2), pillWidth * 0.86, Math.round(pillHeight * 0.36), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle below pill
      const subY = pillY + pillHeight + Math.round(width * 0.048);
      drawFittedText(ctx, state.customFrame.sub || 'Google Pay • PhonePe • Paytm • BHIM', width / 2, subY, width * 0.88, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'restaurant-menu': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Header Text
      drawFittedText(ctx, '🍽️ ' + (state.customFrame.cta || 'DIGITAL MENU & SPECIALS'), width / 2, Math.round(width * 0.085), width * 0.88, Math.round(width * 0.034), '800', 'Sora, sans-serif', '#D97706');

      // QR Plate
      const platePad = Math.round(width * 0.02);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.035), '#FFFBEB', '#FDE68A', 1);

      // Amber CTA Pill
      const pillHeight = Math.round(width * 0.092);
      const pillWidth = Math.round(width * 0.64);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#D97706', null, 0);

      drawFittedText(ctx, 'VIEW DIGITAL MENU', width / 2, pillY + (pillHeight / 2), pillWidth * 0.84, Math.round(pillHeight * 0.36), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle
      const subY = pillY + pillHeight + Math.round(width * 0.05);
      drawFittedText(ctx, state.customFrame.sub || 'Scan with camera to view menu & order', width / 2, subY, width * 0.88, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#78350F');
      break;
    }

    case 'whatsapp-chat': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Header Banner
      const headerH = Math.round(width * 0.14);
      drawTopRoundedCard(ctx, 0, 0, width, headerH, cardRadius, '#075E54');
      drawFittedText(ctx, '💬 CONNECT ON WHATSAPP', width / 2, headerH / 2, width * 0.88, Math.round(width * 0.033), '800', 'Sora, sans-serif', '#FFFFFF');

      // QR Plate
      const platePad = Math.round(width * 0.02);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.035), '#F0FDF4', '#BBF7D0', 1);

      // WhatsApp Green CTA Pill (slim 44px button)
      const pillHeight = Math.round(width * 0.092);
      const pillWidth = Math.round(width * 0.64);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#25D366', null, 0);

      drawFittedText(ctx, state.customFrame.cta || 'CHAT ON WHATSAPP', width / 2, pillY + (pillHeight / 2), pillWidth * 0.82, Math.round(pillHeight * 0.36), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle below pill
      const subY = pillY + pillHeight + Math.round(width * 0.048);
      drawFittedText(ctx, state.customFrame.sub || 'Instant response • Scan to message', width / 2, subY, width * 0.88, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'social-insta': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Instagram Header
      const headerH = Math.round(width * 0.14);
      const instaGrad = ctx.createLinearGradient(0, 0, width, 0);
      instaGrad.addColorStop(0, '#833AB4');
      instaGrad.addColorStop(0.5, '#FD1D1D');
      instaGrad.addColorStop(1, '#FCB045');
      drawTopRoundedCard(ctx, 0, 0, width, headerH, cardRadius, instaGrad);
      drawFittedText(ctx, '✨ FOLLOW ON INSTAGRAM', width / 2, headerH / 2, width * 0.88, Math.round(width * 0.033), '800', 'Sora, sans-serif', '#FFFFFF');

      // QR Plate
      const platePad = Math.round(width * 0.02);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.035), '#FDF2F8', '#FBCFE8', 1);

      // Instagram Gradient Pill
      const pillHeight = Math.round(width * 0.092);
      const pillWidth = Math.round(width * 0.66);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, instaGrad, null, 0);

      drawFittedText(ctx, state.customFrame.cta || 'VIEW INSTAGRAM PROFILE', width / 2, pillY + (pillHeight / 2), pillWidth * 0.84, Math.round(pillHeight * 0.35), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle
      const subY = pillY + pillHeight + Math.round(width * 0.048);
      drawFittedText(ctx, state.customFrame.sub || 'Scan with camera to view posts & reels', width / 2, subY, width * 0.88, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'wifi-connect': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Header Text
      drawFittedText(ctx, '📶 ' + (state.customFrame.cta || 'FREE GUEST WI-FI'), width / 2, Math.round(width * 0.085), width * 0.88, Math.round(width * 0.034), '800', 'Sora, sans-serif', '#6D5DFB');

      // QR Plate
      const platePad = Math.round(width * 0.02);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.035), '#F5F3FF', '#EDE9FE', 1);

      // Violet Pill
      const pillHeight = Math.round(width * 0.092);
      const pillWidth = Math.round(width * 0.64);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#6D5DFB', null, 0);

      drawFittedText(ctx, 'CONNECT TO WI-FI', width / 2, pillY + (pillHeight / 2), pillWidth * 0.82, Math.round(pillHeight * 0.36), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle
      const subY = pillY + pillHeight + Math.round(width * 0.048);
      drawFittedText(ctx, state.customFrame.sub || 'Point phone camera to join automatically', width / 2, subY, width * 0.88, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'vcard-contact': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, cardRadius, '#FFFFFF', '#E8ECF4', strokeW);

      // Header
      drawFittedText(ctx, '👤 ' + (state.customFrame.cta || 'SAVE DIGITAL CONTACT'), width / 2, Math.round(width * 0.085), width * 0.88, Math.round(width * 0.034), '800', 'Sora, sans-serif', '#09090B');

      // QR Plate
      const platePad = Math.round(width * 0.02);
      drawRoundedCard(ctx, qrX - platePad, qrY - platePad, qrSize + (platePad * 2), qrSize + (platePad * 2), Math.round(width * 0.035), '#F8FAFC', '#E2E8F0', 1);

      // Ink Pill
      const pillHeight = Math.round(width * 0.092);
      const pillWidth = Math.round(width * 0.64);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#09090B', null, 0);

      drawFittedText(ctx, 'SAVE CONTACT', width / 2, pillY + (pillHeight / 2), pillWidth * 0.82, Math.round(pillHeight * 0.36), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle
      const subY = pillY + pillHeight + Math.round(width * 0.048);
      drawFittedText(ctx, state.customFrame.sub || 'Scan to save directly to phone contacts', width / 2, subY, width * 0.88, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'coupon-voucher': {
      // Main Card
      drawRoundedCard(ctx, 0, 0, width, height, Math.round(width * 0.045), '#FFFFFF', '#E2E8F0', strokeW);

      // Dashed inner border for coupon feel
      ctx.save();
      ctx.strokeStyle = brandColor;
      ctx.lineWidth = Math.max(1.5, Math.round(width * 0.004));
      ctx.setLineDash([Math.round(width * 0.015), Math.round(width * 0.012)]);
      ctx.strokeRect(width * 0.04, width * 0.04, width * 0.92, height - (width * 0.08));
      ctx.restore();

      // Header
      drawFittedText(ctx, '🏷️ ' + (state.customFrame.cta || 'SPECIAL OFFER VOUCHER'), width / 2, Math.round(width * 0.095), width * 0.85, Math.round(width * 0.033), '800', 'Sora, sans-serif', brandColor);

      // QR Plate
      drawRoundedCard(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, Math.round(width * 0.03), '#F8FAFC', null, 0);

      // Pill
      const pillHeight = Math.round(width * 0.088);
      const pillWidth = Math.round(width * 0.64);
      const pillX = Math.round((width - pillWidth) / 2);
      const pillY = qrY + qrSize + Math.round(width * 0.055);
      drawRoundedCard(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2, brandColor, null, 0);

      drawFittedText(ctx, 'REDEEM VOUCHER', width / 2, pillY + (pillHeight / 2), pillWidth * 0.82, Math.round(pillHeight * 0.35), '800', 'Sora, sans-serif', '#FFFFFF');

      // Subtitle
      const subY = pillY + pillHeight + Math.round(width * 0.048);
      drawFittedText(ctx, state.customFrame.sub || 'Scan at checkout to redeem discount', width / 2, subY, width * 0.85, Math.round(width * 0.026), '600', 'Inter, sans-serif', '#64748B');
      break;
    }

    case 'minimal-border': {
      drawRoundedCard(ctx, 0, 0, width, height, Math.round(width * 0.035), '#FFFFFF', '#09090B', Math.max(2, Math.round(width * 0.004)));
      drawFittedText(ctx, state.customFrame.cta || 'PIXELCODE DIRECT', width / 2, height - Math.round(width * 0.055), width * 0.88, Math.round(width * 0.028), '800', 'Sora, sans-serif', '#09090B');
      break;
    }
  }

  // 2. DRAW QR CODE
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
}

// Utility: Rounded card drawer
function drawRoundedCard(ctx, x, y, width, height, radius, fill, stroke, strokeWidth) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke && strokeWidth) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  ctx.restore();
}

// Utility: Drawer for cards that are only rounded on the top two corners (for headers)
function drawTopRoundedCard(ctx, x, y, width, height, radius, fill) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.restore();
}

// ============================================================================
// EXPORT ENGINE (PNG, SVG, PDF, CLIPBOARD)
// ============================================================================

function setExportResolution(res, btnEl) {
  state.exportRes = res;
  document.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  showToast(`Export Quality set to ${res}px`);
}

function downloadPNG() {
  if (!currentQRImage) return;

  const exportCanvas = document.createElement('canvas');
  paintTemplate(exportCanvas, currentQRImage, state.exportRes);

  const fileName = `pixelcode_qr_${state.contentType}_${state.exportRes}px.png`;
  const link = document.createElement('a');
  link.download = fileName;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();

  showToast(`Downloaded ${state.exportRes}px Print-Ready PNG`);
}

function downloadSVG() {
  if (!currentQRImage) return;

  const exportCanvas = document.createElement('canvas');
  paintTemplate(exportCanvas, currentQRImage, 2048);

  const dataUrl = exportCanvas.toDataURL('image/png');
  const svgContent = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportCanvas.width}" height="${exportCanvas.height}" viewBox="0 0 ${exportCanvas.width} ${exportCanvas.height}">
  <image href="${dataUrl}" width="${exportCanvas.width}" height="${exportCanvas.height}" />
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.download = `pixelcode_qr_${state.contentType}.svg`;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);

  showToast('Downloaded Vector SVG');
}

function downloadPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF || !currentQRImage) {
    showToast('PDF generator loading...');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const exportCanvas = document.createElement('canvas');
  paintTemplate(exportCanvas, currentQRImage, 2048);
  const imgData = exportCanvas.toDataURL('image/png');

  // Page title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.text('PixelCode QR Flyer', 105, 30, { align: 'center' });

  doc.setTextColor(109, 93, 251);
  doc.setFontSize(10);
  doc.text('NOT JUST PRETTY. PERSUASIVE. • PIXELCODE.IN', 105, 38, { align: 'center' });

  // Centered QR Image
  const imgW = 135;
  const imgH = (exportCanvas.height / exportCanvas.width) * imgW;
  doc.addImage(imgData, 'PNG', 37.5, 50, imgW, imgH);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  doc.text('Scan with your smartphone camera to access', 105, 50 + imgH + 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated via PixelCode QR Generator • Commercial Print Asset', 105, 285, { align: 'center' });

  doc.save(`pixelcode_qr_${state.contentType}_flyer.pdf`);
  showToast('Downloaded Printable Flyer PDF!');
}

async function copyImageToClipboard() {
  if (!currentQRImage) return;

  const exportCanvas = document.createElement('canvas');
  paintTemplate(exportCanvas, currentQRImage, 1024);

  try {
    exportCanvas.toBlob(async blob => {
      if (blob && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Copied high-res QR image to clipboard! Ready to paste into Figma or Canva.');
      } else {
        showToast('Clipboard access unavailable in this browser');
      }
    });
  } catch (err) {
    showToast('Could not copy to clipboard');
  }
}

// Native Android Web Share Integration
async function shareQR() {
  if (!currentQRImage) return;

  const exportCanvas = document.createElement('canvas');
  paintTemplate(exportCanvas, currentQRImage, 1200);

  try {
    exportCanvas.toBlob(async blob => {
      if (!blob) return;
      const file = new File([blob], 'pixelcode-qr.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'PixelCode QR',
          text: 'Generated with PixelCode QR (https://pixelcode.in)',
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'PixelCode QR',
          text: `Scan my QR Code: ${getPayload()}`,
          url: state.contentType === 'url' ? getPayload() : 'https://pixelcode.in'
        });
      } else {
        openDownloadModal('png');
      }
    }, 'image/png');
  } catch (err) {
    if (err.name !== 'AbortError') {
      openDownloadModal('png');
    }
  }
}

// Android Back Button Listener & Modal Dismissal (Capacitor / Cordova / Hardware Back)
document.addEventListener('backbutton', (e) => {
  const privacyModal = document.getElementById('privacyModal');
  if (privacyModal && privacyModal.classList.contains('active')) {
    e.preventDefault();
    closePrivacyModal();
    return;
  }
  const downloadModal = document.getElementById('downloadModal');
  if (downloadModal && downloadModal.classList.contains('active')) {
    e.preventDefault();
    closeDownloadModal();
    return;
  }
});

// Safe External Link Launcher for Android (Opens system browser instead of WebView)
function openExternalUrl(event, url) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  try {
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      window.open(url, '_system');
      return false;
    }
  } catch (_) {}
  window.open(url, '_blank', 'noopener,noreferrer');
  return false;
}

// ============================================================================
// PRIVACY & SECURITY MODAL (Play Store Compliance)
// ============================================================================

function openPrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePrivacyModal() {
  const modal = document.getElementById('privacyModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handlePrivacyModalBackdropClick(event) {
  if (event.target && event.target.id === 'privacyModal') {
    closePrivacyModal();
  }
}

// ============================================================================
// PROMOTIONAL DOWNLOAD MODAL (Websites, Apps & Agency Services)
// ============================================================================

state.pendingDownloadType = 'png';

function openDownloadModal(type = 'png') {
  state.pendingDownloadType = type;
  const modal = document.getElementById('downloadModal');
  const btnText = document.getElementById('modalDownloadBtnText');
  const fileSpecs = document.getElementById('modalFileSpecs');
  const downloadBtn = document.getElementById('modalDownloadBtn');

  if (!modal) return;

  if (downloadBtn) {
    downloadBtn.classList.remove('downloaded');
  }

  if (type === 'png') {
    if (btnText) btnText.textContent = `Download PNG (${state.exportRes}px Ultra HD)`;
    if (fileSpecs) fileSpecs.textContent = `PNG • ${state.exportRes} × ${state.exportRes}px`;
  } else if (type === 'svg') {
    if (btnText) btnText.textContent = `Download Scalable Vector SVG`;
    if (fileSpecs) fileSpecs.textContent = `Scalable SVG • Infinitely Sharp`;
  } else if (type === 'pdf') {
    if (btnText) btnText.textContent = `Download Printable Flyer PDF`;
    if (fileSpecs) fileSpecs.textContent = `Print-Ready PDF • A4 Flyer`;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDownloadModal() {
  const modal = document.getElementById('downloadModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleModalBackdropClick(event) {
  if (event.target && event.target.id === 'downloadModal') {
    closeDownloadModal();
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closePrivacyModal();
    closeDownloadModal();
  }
});

function triggerActualDownload() {
  const type = state.pendingDownloadType || 'png';
  const downloadBtn = document.getElementById('modalDownloadBtn');
  const btnText = document.getElementById('modalDownloadBtnText');

  if (type === 'png') {
    downloadPNG();
  } else if (type === 'svg') {
    downloadSVG();
  } else if (type === 'pdf') {
    downloadPDF();
  }

  if (downloadBtn && btnText) {
    downloadBtn.classList.add('downloaded');
    btnText.textContent = '✓ Download Started! Check Downloads';
  }
}

// ============================================================================
// MOBILE FLOATING PREVIEW CONTROLLER
// ============================================================================

function scrollToPreview() {
  const pip = document.getElementById('mobileFloatingPreview');
  if (pip && pip._justDragged) return; // Prevent scroll after drag repositioning

  const el = document.getElementById('mainPreviewCard');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.style.display = 'flex';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2600);
}
