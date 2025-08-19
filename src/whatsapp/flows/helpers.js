// whatsapp/flows/helpers.js
const { normalizarTexto, encontrarMejorCoincidencia } = require('../core/similarity');

function normalizeDigits(s) { return String(s || '').replace(/\D+/g, ''); }

function formatPrizeList(prizes) {
  if (!prizes || !prizes.length) return 'No hay premios disponibles para canjear ahora mismo.';
  return prizes.map((p, i) => `${i+1}. ${p.title}`).join('\n');
}
function formatCouponsList(coupons) {
  if (!coupons || !coupons.length) return 'No tenés cupones activos.';
  return coupons.map(c => `- ${c.title} • expira: ${c.expires}`).join('\n');
}
function formatCatalogList(items) {
  if (!items || !items.length) return 'No hay cupones en el catálogo por ahora.';
  return items.map(i => `- ${i.title} • disponible: ${i.hasta}`).join('\n');
}
function matchPrize(userMsg, prizes) {
  const n = Number(normalizeDigits(userMsg));
  if (Number.isInteger(n) && n >= 1 && n <= prizes.length) return prizes[n-1];
  const names = prizes.map(p => p.title);
  const got = encontrarMejorCoincidencia(userMsg, names, 0.5);
  if (got) return prizes[names.indexOf(got)];
  return null;
}
function genReqId() {
  const r = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  return `RQ${r}`;
}

// textos
const HOWTO_TEXT =
  '🔄 Para canjear un cupón:\n' +
  '1. Ingresá a "Ver mis cupones" o tocá "Canjear cupón".\n' +
  '2. Elegí el cupón que querés.\n' +
  '3. Confirmá y canjealo.\n' +
  '4. Vas a recibir un código QR por WhatsApp.\n' +
  '📌 Usalo antes de la fecha de vencimiento.';

const ISSUE_PROMPT =
  '⚠️ ¿Qué problema tuviste con el cupón?\n' +
  'A. No me llegó\n' +
  'B. No funciona el QR\n' +
  'C. El comercio no lo aceptó\n' +
  'D. Hablar con asistente Ekokai';

const ECOPUNTO_ISSUE_PROMPT =
  '⚠️ Lamentamos que hayas tenido un inconveniente. ¿Podés contarnos qué pasó?\n' +
  'Opciones:\n' +
  'A. El lugar estaba cerrado\n' +
  'B. Me atendieron mal\n' +
  'C. El lugar estaba en mal estado\n' +
  'D. Otro problema\n' +
  '— Escribí A, B, C o D (también podés usar 1–4). Para volver, escribí "atrás".';

// mocks
function mockGetUserCoupons() {
  return [
    { id: 'c1', title: '🍔 2x1 en hamburguesas', expires: '15-08-2026' },
    { id: 'c2', title: '🎬 Combo cine',          expires: '16-04-2026' },
    { id: 'c3', title: '🧃 Jugo natural',         expires: '30-08-2026' },
  ];
}
function mockGetRedeemablePrizes() {
  return [
    { id: 'p1', title: '🎁 Lavado ecológico', stock: 50 },
    { id: 'p2', title: '🍿 Combo cine',       stock: 100 },
    { id: 'p3', title: '☕ Café de especialidad', stock: 200 },
    { id: 'p4', title: '🧃 Jugo natural',     stock: 999 },
  ];
}
function mockGetCatalog() {
  return [
    { title: '🍔 2x1 en hamburguesas', hasta: '15-08-2026' },
    { title: '🎬 Combo cine',          hasta: 'hasta agotar stock' },
    { title: '🧼 Lavado ecológico',     hasta: '01-09-2026' },
    { title: '☕ Café de especialidad', hasta: '31-12-2026' },
    { title: '🍕 25% en pizzerías',     hasta: '15-10-2026' },
    { title: '🧃 Jugo natural',         hasta: '30-08-2026' },
  ];
}
function mockGetHuellaMensual() {
  return { kgMes: 7.4, bolsasEquivalentes: 12, visitasEcopunto: 3, periodo: 'Agosto 2025' };
}
function mockGetHuellaAcumulada() {
  return { kgTotal: 57 };
}

module.exports = {
  normalizarTexto,
  normalizeDigits,
  formatPrizeList,
  formatCouponsList,
  formatCatalogList,
  matchPrize,
  genReqId,
  encontrarMejorCoincidencia,
  HOWTO_TEXT,
  ISSUE_PROMPT,
  ECOPUNTO_ISSUE_PROMPT,
  mockGetUserCoupons,
  mockGetRedeemablePrizes,
  mockGetCatalog,
  mockGetHuellaMensual,
  mockGetHuellaAcumulada,
};
