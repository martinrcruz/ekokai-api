// whatsapp/flows/cuponera.flow.js
const { responderWhatsApp } = require('../core/twilio.helper');
const { ensureSession } = require('../state/session.store');
const {
  formatPrizeList, formatCouponsList, formatCatalogList, matchPrize,
  HOWTO_TEXT, ISSUE_PROMPT,
  mockGetUserCoupons, mockGetRedeemablePrizes, mockGetCatalog
} = require('./helpers');

async function startCanjearQuickFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'canjear';
  ses.step = 'wait_prize';
  ses.coupons = mockGetUserCoupons();
  ses.prizes  = mockGetRedeemablePrizes();

  const count = ses.coupons.length;
  await responderWhatsApp(
    toE164,
    `🎉 Tenés ${count} cupón(es) activo(s).\n` +
    `🎯 Podés canjear por:\n${formatPrizeList(ses.prizes)}\n\n` +
    `✳️ Escribí el número o el nombre del premio que querés canjear (ej: "2" o "Combo cine"), o "atrás" para volver al menú de cupones.`
  );
  return true;
}
async function startVerCuponesFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'ver';
  ses.step = 'idle';
  ses.coupons = mockGetUserCoupons();

  const list = formatCouponsList(ses.coupons);
  await responderWhatsApp(
    toE164,
    `📋 Estos son tus cupones activos:\n${list}\n\n` +
    `💬 ¿Querés canjear alguno? Respondé "1" o "canjear". ` +
    `Escribí "atrás" para volver al menú de cupones.`
  );
  return true;
}
async function startVerCatalogoFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'catalogo';
  ses.step = 'idle';
  const catalog = mockGetCatalog();

  const list = formatCatalogList(catalog);
  await responderWhatsApp(
    toE164,
    `🗂️ Catálogo de cupones/premios disponibles:\n${list}\n\n` +
    `📌 Para canjear algo del catálogo, primero necesitás tener el cupón en tu cuenta.\n` +
    `➡️ Podés escribir "1" o "canjear" para ver premios canjeables con tus cupones.\n` +
    `Escribí "atrás" para volver al menú de cupones.`
  );
  return true;
}
async function startComoCanjearFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'cuponera_info';
  ses.step = 'idle';
  await responderWhatsApp(toE164, HOWTO_TEXT);
  return true;
}
async function startProblemaCuponFlow(toE164) {
  const ses = ensureSession(toE164);
  ses.flow = 'problema_cupon';
  ses.step = 'wait_issue_choice';
  await responderWhatsApp(toE164, ISSUE_PROMPT + '\n(Respondé A, B, C o D. También podés usar 1, 2, 3 o 4.)');
  return true;
}

module.exports = {
  startCanjearQuickFlow,
  startVerCuponesFlow,
  startVerCatalogoFlow,
  startComoCanjearFlow,
  startProblemaCuponFlow,
};
