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

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB DB1:", err.message);
  }
};

startServer();
