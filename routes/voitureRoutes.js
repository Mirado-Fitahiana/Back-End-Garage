const express = require("express");
const mongoose = require("mongoose");
const Voiture = require("../models/Voiture");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Ajouter une voiture (CREATE)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { proprietaire } = req.body;

    // Vérifier si l'utilisateur existe
    if (!mongoose.Types.ObjectId.isValid(proprietaire)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const voiture = new Voiture(req.body);
    await voiture.save();
    res.status(201).json(voiture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les voitures (READ ALL)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const voitures = await Voiture.find().populate("proprietaire", "nom adresseMail numeroTel");
    res.status(200).json(voitures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer une voiture par ID (READ ONE)
router.get("/:idUser/:id?", authMiddleware, async (req, res) => {
  try {
    const { idUser, id } = req.params;
    if (id) {
      const voiture = await Voiture.findOne({ _id: id, proprietaire: idUser }).populate("proprietaire", "nom adresseMail numeroTel");
      if (!voiture) return res.status(404).json({ message: "Voiture non trouvée" });
      return res.status(200).json(voiture);
    }
    const voitures = await Voiture.find({ proprietaire: idUser }).populate("proprietaire", "nom adresseMail numeroTel");
    res.status(200).json(voitures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une voiture (UPDATE)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedVoiture = await Voiture.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedVoiture) return res.status(404).json({ message: "Voiture non trouvée" });
    res.json(updatedVoiture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une voiture (DELETE)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Voiture.findByIdAndDelete(req.params.id);
    res.json({ message: "Voiture supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
