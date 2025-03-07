const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const JWT_SECRET = "monSuperSecret"; // Remplace par une clé plus sécurisée en production

// Route d'inscription
router.post(
  "/register",
  [
    body("nom").notEmpty().withMessage("Le nom est obligatoire"),
    body("adresseMail").isEmail().withMessage("Email invalide"),
    body("numeroTel").notEmpty().withMessage("Numéro obligatoire"),
    body("password").isLength({ min: 6 }).withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    body("role").isIn(["ADMIN", "CLIENT", "MECANICIEN"]).withMessage("Rôle invalide")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { nom, adresseMail, numeroTel, password, role } = req.body;

      // Vérifier si l'utilisateur existe déjà
      let user = await User.findOne({ adresseMail });
      if (user) return res.status(400).json({ message: "Cet email est déjà utilisé" });

      user = new User({ nom, adresseMail, numeroTel, password, role });
      await user.save();

      res.status(201).json({ message: "Utilisateur créé avec succès !" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Route de connexion
router.post(
    "/login",
    [
      body("identifiant").notEmpty().withMessage("Email ou numéro de téléphone requis"),
      body("password").notEmpty().withMessage("Le mot de passe est obligatoire")
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  
      try {
        const { identifiant, password } = req.body;
  
        // Vérifier si l'identifiant est un email ou un numéro de téléphone
        const isEmail = /\S+@\S+\.\S+/.test(identifiant);
  
        // Chercher l'utilisateur en fonction de l'email ou du numéro de téléphone
        const user = await User.findOne(isEmail ? { adresseMail: identifiant } : { numeroTel: identifiant });
  
        if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });
  
        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });
  
        // Générer un token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
  
        res.json({ token, user: { id: user._id, nom: user.nom, role: user.role } });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  

// Récupérer le profil utilisateur (protégé par JWT)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur (protégé par JWT)
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { nom, adresseMail, numeroTel, photo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { nom, adresseMail, numeroTel, photo },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Utilisateur mis à jour", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un utilisateur (protégé par JWT)
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
