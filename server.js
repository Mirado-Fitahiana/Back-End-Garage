const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require("./routes/userRoutes");
const pieceRoutes = require("./routes/pieceRoutes");
const typeServiceRoutes = require("./routes/typeServiceRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const voitureRoutes = require("./routes/voitureRoutes");
const factureRoutes = require("./routes/factureRoutes");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connecté"))
    .catch(err => console.log(err));

    
// Routes;
app.use("/users", userRoutes);
app.use("/pieces", pieceRoutes);
app.use("/type-services", typeServiceRoutes);
app.use("/services", serviceRoutes);
app.use("/voitures", voitureRoutes);
app.use("/factures", factureRoutes);
// Démarrer le serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port
${PORT}`));

