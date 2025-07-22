require("dotenv").config();
const { connectDB1 } = require("./config/database"); // conectamos de forma asíncrona

const startServer = async () => {
  try {
    await connectDB1(); // esperamos conexión

    
    const app = require("./app");
    const PORT = process.env.PORT || 3000;

    console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID);
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN);
    console.log("TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER);
    console.log("GC_TYPE:", process.env.GC_TYPE);
    console.log("GC_PRIVATE_KEY_ID:", process.env.GC_PRIVATE_KEY_ID);
    console.log("GC_PRIVATE_KEY:", process.env.GC_PRIVATE_KEY);
    console.log("GC_CLIENT_EMAIL:", process.env.GC_CLIENT_EMAIL);
    console.log("GC_CLIENT_ID:", process.env.GC_CLIENT_ID);
    console.log("GC_AUTH_URI:", process.env.GC_AUTH_URI);
    console.log("GC_TOKEN_URI:", process.env.GC_TOKEN_URI);
    console.log("GC_AUTH_PROVIDER_X509_CERT_URL:", process.env.GC_AUTH_PROVIDER_X509_CERT_URL);
    console.log("GC_CLIENT_X509_CERT_URL:", process.env.GC_CLIENT_X509_CERT_URL);
    console.log("GC_UNIVERSE_DOMAIN:", process.env.GC_UNIVERSE_DOMAIN);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB DB1:", err.message);
  }
};

startServer();
