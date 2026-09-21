// ============================================================================
// PIXELCODE QR & BARCODE GENERATOR — NATIVE MOBILE APPLICATION ENGINE
// 100% Offline, Private, Client-Side Vector & Barcode Studio
// ============================================================================

const state = {
  appMode: 'qr',              // 'qr' or 'barcode'
  contentType: 'url',         // 'url', 'whatsapp', 'upi', 'wifi', 'vcard', 'text'
  barcodeFormat: 'CODE128',   // 'CODE128', 'EAN13', 'UPC', 'CODE39', 'ITF'
  barcodeHeight: 80,
  barcodeShowText: true,
  primaryColor: '#09090B',
  backgroundColor: '#FFFFFF',
  standee: 'none',
  logoDataUrl: null,
  logoName: null,
  activeSheet: null
};

let qrCodeStylingInstance = null;
let currentQRCanvas = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initQREngine();
  renderCurrentCode();

  // Android Hardware Back Button listener
  document.addEventListener('backbutton', (e) => {
    if (state.activeSheet) {
      e.preventDefault();
      closeSheet(state.activeSheet);
    }
  });

  // ESC key for desktop testing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.activeSheet) {
      closeSheet(state.activeSheet);
    }
  });
});

// ============================================================================
// MODE SWITCHING (QR vs BARCODE)
// ============================================================================

function switchMainMode(mode) {
  state.appMode = mode;

  // Header Titles
  const headerTitle = document.getElementById('appHeaderTitle');
  const headerSub = document.getElementById('appHeaderSubtitle');
  const primaryBtnText = document.getElementById('primaryGenerateText');
  const previewBadge = document.getElementById('previewModeBadge');

  // Tab Buttons
  const tabBtnQR = document.getElementById('tabBtnQR');
  const tabBtnBarcode = document.getElementById('tabBtnBarcode');
  const navBtnQr = document.getElementById('navBtnQr');
  const navBtnBarcode = document.getElementById('navBtnBarcode');

  // Chip Containers
  const qrChips = document.getElementById('qrChipsContainer');
  const barcodeChips = document.getElementById('barcodeChipsContainer');

  // Input groups
  const qrInputGroups = ['inputGroupUrl', 'inputGroupWhatsapp', 'inputGroupUpi', 'inputGroupWifi', 'inputGroupVcard', 'inputGroupText'];
  const barcodeInputGroup = document.getElementById('inputGroupBarcode');

  // Stages
  const qrStage = document.getElementById('qrStageWrapper');
  const barcodeStage = document.getElementById('barcodeStageWrapper');

  // Customise sheet sections
  const customLogoSec = document.getElementById('customLogoSection');
  const customBarcodeSec = document.getElementById('customBarcodeSection');

  if (mode === 'qr') {
    if (headerTitle) headerTitle.textContent = 'QR Generator';
    if (headerSub) headerSub.textContent = 'Create anything into a QR code';
    if (primaryBtnText) primaryBtnText.textContent = 'Generate QR Code';
    if (previewBadge) previewBadge.textContent = 'LIVE QR';

    tabBtnQR.classList.add('active');
    tabBtnBarcode.classList.remove('active');
    navBtnQr.classList.add('active');
    navBtnBarcode.classList.remove('active');

    qrChips.style.display = 'flex';
    barcodeChips.style.display = 'none';

    barcodeInputGroup.style.display = 'none';
    selectType(state.contentType); // re-activates active QR input

    qrStage.style.display = 'flex';
    barcodeStage.style.display = 'none';

    if (customLogoSec) customLogoSec.style.display = 'block';
    if (customBarcodeSec) customBarcodeSec.style.display = 'none';

  } else {
    if (headerTitle) headerTitle.textContent = 'Barcode Maker';
    if (headerSub) headerSub.textContent = 'Generate standard product barcodes';
    if (primaryBtnText) primaryBtnText.textContent = 'Generate Barcode';
    if (previewBadge) previewBadge.textContent = 'LIVE BARCODE';

    tabBtnBarcode.classList.add('active');
    tabBtnQR.classList.remove('active');
    navBtnBarcode.classList.add('active');
    navBtnQr.classList.remove('active');

    qrChips.style.display = 'none';
    barcodeChips.style.display = 'flex';

    qrInputGroups.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    barcodeInputGroup.style.display = 'block';

    qrStage.style.display = 'none';
    barcodeStage.style.display = 'flex';

    if (customLogoSec) customLogoSec.style.display = 'none';
    if (customBarcodeSec) customBarcodeSec.style.display = 'block';
  }

  renderCurrentCode();
}

// ============================================================================
// QR CATEGORY CHIPS SELECTION
// ============================================================================

function selectType(type) {
  state.contentType = type;

  // Highlight active chip
  document.querySelectorAll('#qrChipsContainer .chip-item').forEach(btn => {
    if (btn.getAttribute('data-type') === type) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Switch visible input group
  const map = {
    url: 'inputGroupUrl',
    whatsapp: 'inputGroupWhatsapp',
    upi: 'inputGroupUpi',
    wifi: 'inputGroupWifi',
    vcard: 'inputGroupVcard',
    text: 'inputGroupText'
  };

  Object.values(map).forEach(groupId => {
    const el = document.getElementById(groupId);
    if (el) el.style.display = 'none';
  });

  const activeGroup = document.getElementById(map[type]);
  if (activeGroup) activeGroup.style.display = 'block';

  renderCurrentCode();
}

// ============================================================================
// BARCODE FORMAT SELECTION
// ============================================================================

function selectBarcodeFormat(format) {
  state.barcodeFormat = format;

  document.querySelectorAll('#barcodeChipsContainer .chip-item').forEach(btn => {
    if (btn.getAttribute('data-bformat') === format) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const helper = document.getElementById('barcodeHelperText');
  const input = document.getElementById('inputBarcodeValue');

  if (format === 'EAN13') {
    if (helper) helper.textContent = '12 or 13 numeric digits required for retail EAN-13';
    if (input && (!input.value || input.value.length < 12)) input.value = '890123456789';
  } else if (format === 'UPC') {
    if (helper) helper.textContent = '11 or 12 numeric digits required for UPC-A';
    if (input && (!input.value || input.value.length < 11)) input.value = '012345678905';
  } else if (format === 'CODE39') {
    if (helper) helper.textContent = 'Alphanumeric characters (A-Z, 0-9, dash, space)';
  } else if (format === 'ITF') {
    if (helper) helper.textContent = 'Even number of numeric digits (e.g. 123456)';
  } else {
    if (helper) helper.textContent = 'Alphanumeric and standard characters (Code 128)';
  }

  renderCurrentCode();
}

// ============================================================================
// PAYLOAD EXTRACTION
// ============================================================================

function getQRPayload() {
  const type = state.contentType;

  if (type === 'url') {
    const v = document.getElementById('inputUrl')?.value?.trim() || '';
    return v.startsWith('http://') || v.startsWith('https://') ? v : (v ? 'https://' + v : 'https://pixelcode.in');
  }

  if (type === 'whatsapp') {
    const phone = (document.getElementById('inputWaPhone')?.value || '').replace(/\D/g, '');
    const msg = encodeURIComponent(document.getElementById('inputWaMsg')?.value || '');
    if (!phone) return 'https://wa.me/919959607605';
    return `https://wa.me/${phone}${msg ? '?text=' + msg : ''}`;
  }

  if (type === 'upi') {
    const vpa = document.getElementById('inputUpiVpa')?.value?.trim() || 'pixelcode@upi';
    const name = encodeURIComponent(document.getElementById('inputUpiName')?.value?.trim() || 'PixelCode');
    const amt = document.getElementById('inputUpiAmount')?.value?.trim();
    let upi = `upi://pay?pa=${vpa}&pn=${name}&cu=INR`;
    if (amt && Number(amt) > 0) upi += `&am=${amt}`;
    return upi;
  }

  if (type === 'wifi') {
    const ssid = document.getElementById('inputWifiSsid')?.value?.trim() || 'PixelCode-Network';
    const pass = document.getElementById('inputWifiPass')?.value?.trim() || '';
    return `WIFI:T:WPA;S:${ssid};P:${pass};;`;
  }

  if (type === 'vcard') {
    const name = document.getElementById('inputVcardName')?.value?.trim() || 'PixelCode Contact';
    const phone = document.getElementById('inputVcardPhone')?.value?.trim() || '';
    const email = document.getElementById('inputVcardEmail')?.value?.trim() || '';
    return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
  }

  if (type === 'text') {
    return document.getElementById('inputText')?.value?.trim() || 'PixelCode High-Resolution Vector Engine';
  }

  return 'https://pixelcode.in';
}

function getBarcodePayload() {
  const v = document.getElementById('inputBarcodeValue')?.value?.trim();
  if (v) return v;
  if (state.barcodeFormat === 'EAN13') return '890123456789';
  if (state.barcodeFormat === 'UPC') return '012345678905';
  return '123456789012';
}

// ============================================================================
// QR ENGINE (QRCodeStyling)
// ============================================================================

function initQREngine() {
  const container = document.getElementById('qrDisplayCanvas');
  if (!container || !window.QRCodeStyling) return;

  container.innerHTML = '';

  qrCodeStylingInstance = new QRCodeStyling({
    width: 240,
    height: 240,
    type: 'canvas',
    data: 'https://pixelcode.in',
    margin: 10,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: state.logoDataUrl ? 'H' : 'Q'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.35,
      margin: 4
    },
    dotsOptions: {
      color: state.primaryColor,
      type: 'rounded'
    },
    backgroundOptions: {
      color: state.backgroundColor
    },
    cornersSquareOptions: {
      color: state.primaryColor,
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: state.primaryColor,
      type: 'dot'
    }
  });

  qrCodeStylingInstance.append(container);
}

// ============================================================================
// BARCODE ENGINE (JsBarcode)
// ============================================================================

function renderBarcode() {
  if (!window.JsBarcode) return;

  const rawValue = getBarcodePayload();
  const format = state.barcodeFormat;

  try {
    window.JsBarcode('#barcodeSvg', rawValue, {
      format: format,
      height: state.barcodeHeight,
      displayValue: state.barcodeShowText,
      font: 'Plus Jakarta Sans',
      fontSize: 14,
      textMargin: 6,
      lineColor: state.primaryColor,
      background: '#FFFFFF',
      margin: 12
    });
  } catch (err) {
    // Graceful fallback to Code128 if formatting check failed (e.g. invalid checksum in draft input)
    try {
      window.JsBarcode('#barcodeSvg', rawValue, {
        format: 'CODE128',
        height: state.barcodeHeight,
        displayValue: state.barcodeShowText,
        lineColor: state.primaryColor,
        background: '#FFFFFF',
        margin: 12
      });
    } catch (_) {}
  }
}

// ============================================================================
// UNIFIED RENDER TRIGGER
// ============================================================================

let renderDebounceTimer = null;

function renderCurrentCode() {
  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    if (state.appMode === 'qr') {
      if (!qrCodeStylingInstance) initQREngine();
      const payload = getQRPayload();

      qrCodeStylingInstance.update({
        data: payload,
        dotsOptions: {
          color: state.primaryColor,
          type: 'rounded'
        },
        cornersSquareOptions: {
          color: state.primaryColor,
          type: 'extra-rounded'
        },
        cornersDotOptions: {
          color: state.primaryColor,
          type: 'dot'
        },
        image: state.logoDataUrl || undefined,
        qrOptions: {
          errorCorrectionLevel: state.logoDataUrl ? 'H' : 'Q'
        }
      });
    } else {
      renderBarcode();
    }
  }, 50);
}

function onInputChange() {
  renderCurrentCode();
}

function onBarcodeInputChange() {
  renderCurrentCode();
}

function triggerManualGenerate() {
  renderCurrentCode();
  showToast(state.appMode === 'qr' ? '✓ QR Code Generated!' : '✓ Barcode Generated!');
}

// ============================================================================
// 1-TAP CLIPBOARD PASTE
// ============================================================================

async function pasteClipboardToInput(targetId) {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      const input = document.getElementById(targetId);
      if (input && text) {
        input.value = text;
        renderCurrentCode();
        showToast('Pasted from clipboard!');
      }
    } else {
      showToast('Clipboard permission needed');
    }
  } catch (err) {
    showToast('Clipboard access unavailable');
  }
}

// ============================================================================
// CUSTOMISATION HANDLERS
// ============================================================================

function setCustomColor(hex) {
  state.primaryColor = hex;

  document.querySelectorAll('.color-preset-dot').forEach(dot => {
    dot.classList.remove('active');
  });

  renderCurrentCode();
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    state.logoDataUrl = event.target.result;
    state.logoName = file.name;

    const btnRemove = document.getElementById('btnRemoveLogo');
    if (btnRemove) btnRemove.style.display = 'block';

    renderCurrentCode();
    showToast('Logo applied! Level H error correction active.');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  state.logoDataUrl = null;
  state.logoName = null;

  const fileInput = document.getElementById('logoFileInput');
  if (fileInput) fileInput.value = '';

  const btnRemove = document.getElementById('btnRemoveLogo');
  if (btnRemove) btnRemove.style.display = 'none';

  renderCurrentCode();
  showToast('Logo removed');
}

function updateBarcodeSettings() {
  const slider = document.getElementById('barcodeHeightSlider');
  const showText = document.getElementById('barcodeShowText');

  if (slider) state.barcodeHeight = parseInt(slider.value, 10);
  if (showText) state.barcodeShowText = showText.checked;

  renderBarcode();
}

function selectStandee(standeeId) {
  state.standee = standeeId;

  document.querySelectorAll('.standee-card').forEach(c => {
    if (c.getAttribute('data-standee') === standeeId) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  closeSheet('standeesSheet');
  showToast(`Standee frame set: ${standeeId}`);
}

// ============================================================================
// EXPORT & DOWNLOAD ENGINE
// ============================================================================

async function executeDownload(format = 'png') {
  closeSheet('downloadSheet');

  if (state.appMode === 'qr') {
    await downloadQR(format);
  } else {
    await downloadBarcode(format);
  }
}

async function downloadQR(format) {
  if (!qrCodeStylingInstance) return;

  if (format === 'png') {
    qrCodeStylingInstance.download({
      name: `pixelcode_qr_${state.contentType}`,
      extension: 'png'
    });
    showToast('Downloaded High-Res PNG!');
  } else if (format === 'svg') {
    qrCodeStylingInstance.download({
      name: `pixelcode_qr_${state.contentType}`,
      extension: 'svg'
    });
    showToast('Downloaded Scalable Vector SVG!');
  } else if (format === 'pdf') {
    await generatePDFDoc('qr');
  }
}

async function downloadBarcode(format) {
  const svg = document.getElementById('barcodeSvg');
  if (!svg) return;

  if (format === 'svg') {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerFileDownload(url, `pixelcode_barcode_${state.barcodeFormat}.svg`);
    showToast('Downloaded Vector Barcode SVG!');
  } else if (format === 'png') {
    const canvas = document.createElement('canvas');
    const svgBox = svg.getBoundingClientRect();
    const scale = 3;
    canvas.width = (svgBox.width || 300) * scale;
    canvas.height = (svgBox.height || 120) * scale;

    const ctx = canvas.getContext('2d');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      triggerFileDownload(canvas.toDataURL('image/png'), `pixelcode_barcode_${state.barcodeFormat}.png`);
      showToast('Downloaded High-Res Barcode PNG!');
    };
    img.src = url;
  } else if (format === 'pdf') {
    await generatePDFDoc('barcode');
  }
}

function triggerFileDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Print Flyer PDF Generator
async function generatePDFDoc(mode) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('PDF Engine loading...');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Title
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(22);
  doc.text(mode === 'qr' ? 'PixelCode QR Flyer' : 'PixelCode Product Barcode', 105, 30, { align: 'center' });

  doc.setTextColor(26, 115, 232);
  doc.setFontSize(10);
  doc.text('NOT JUST PRETTY. PERSUASIVE. • PIXELCODE.IN', 105, 38, { align: 'center' });

  if (mode === 'qr') {
    const rawBlob = await qrCodeStylingInstance.getRawData('png');
    if (rawBlob) {
      const reader = new FileReader();
      reader.onload = () => {
        doc.addImage(reader.result, 'PNG', 45, 55, 120, 120);
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(11);
        doc.text('Scan with your smartphone camera to access', 105, 190, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Generated via PixelCode QR Studio • Commercial Print Asset', 105, 285, { align: 'center' });
        doc.save(`pixelcode_qr_flyer.pdf`);
        showToast('Downloaded Printable PDF Flyer!');
      };
      reader.readAsDataURL(rawBlob);
    }
  } else {
    const svg = document.getElementById('barcodeSvg');
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 35, 75, 140, 60);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(11);
      doc.text(`Format: ${state.barcodeFormat} • Code: ${getBarcodePayload()}`, 105, 150, { align: 'center' });
      doc.setFontSize(8);
      doc.text('Generated via PixelCode Barcode Studio • Commercial Asset', 105, 285, { align: 'center' });
      doc.save(`pixelcode_barcode_${state.barcodeFormat}.pdf`);
      showToast('Downloaded Printable PDF Flyer!');
    };
    img.src = url;
  }
}

// ============================================================================
// NATIVE SHARING
// ============================================================================

async function shareCurrentAsset() {
  try {
    if (state.appMode === 'qr') {
      const blob = await qrCodeStylingInstance.getRawData('png');
      if (blob) {
        const file = new File([blob], 'pixelcode-qr.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'PixelCode QR Code',
            text: 'Generated with PixelCode QR',
            files: [file]
          });
          return;
        }
      }
    }

    // Fallback standard share
    if (navigator.share) {
      await navigator.share({
        title: state.appMode === 'qr' ? 'PixelCode QR' : 'PixelCode Barcode',
        text: state.appMode === 'qr' ? `Scan my QR Code: ${getQRPayload()}` : `Barcode: ${getBarcodePayload()}`,
        url: 'https://pixelcode.in'
      });
    } else {
      openSheet('downloadSheet');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      openSheet('downloadSheet');
    }
  }
}

// ============================================================================
// BOTTOM SHEET CONTROLLER
// ============================================================================

function openSheet(sheetId) {
  // Close any existing open sheet
  if (state.activeSheet && state.activeSheet !== sheetId) {
    closeSheet(state.activeSheet);
  }

  const sheet = document.getElementById(sheetId);
  if (!sheet) return;

  sheet.classList.add('active');
  state.activeSheet = sheetId;
  document.body.style.overflow = 'hidden';
}

function closeSheet(sheetId) {
  const sheet = document.getElementById(sheetId || state.activeSheet);
  if (!sheet) return;

  sheet.classList.remove('active');
  state.activeSheet = null;
  document.body.style.overflow = '';
}

function handleSheetBackdropClick(event, sheetId) {
  if (event.target && event.target.id === sheetId) {
    closeSheet(sheetId);
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
  }, 2200);
}
