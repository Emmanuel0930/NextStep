//Para conexión permanente con Mongo
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://Kadiha5:Kalena12%24@cluster0.usby9hz.mongodb.net/magneto_engage?retryWrites=true&w=majority');
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    process.exit(1);
  }
};

module.exports = connectDB;