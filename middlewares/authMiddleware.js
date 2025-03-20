const jwt = require("jsonwebtoken");
require("dotenv").config(); // Charger les variables d'environnement

const JWT_SECRET = process.env.JWT_SECRET || "defaultSecret"; // Utilisation dynamique

module.exports = (req, res, next) => {
  try {
    // Récupérer le token de plusieurs sources (Headers, Cookies)
    let token = req.header("Authorization") || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Accès refusé, token manquant" });
    }

    // Supprimer "Bearer " s'il est présent
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    // Vérification du token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Ajouter les infos du user au req

    next();
  } catch (error) {
    console.error("Erreur JWT :", error.message); // Log pour debug
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};
