// src/whatsapp/core/dfcx.utils.js
function buildCxResponse(text, sessionParams = {}) {
  const camel = {
    fulfillmentResponse: { messages: [{ text: { text: [text] } }] },
    sessionInfo: { parameters: sessionParams },
  };
  const snake = {
    fulfillment_response: camel.fulfillmentResponse,
    session_info: camel.sessionInfo,
  };
  return { ...camel, ...snake };
}
module.exports = { buildCxResponse };
