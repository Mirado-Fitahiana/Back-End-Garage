const express = require("express");
const Piece = require("../models/Piece");

const router = express.Router();

// Ajouter une nouvelle pièce
router.post("/", async (req, res) => {
  try {
    const piece = new Piece(req.body);
    await piece.save();
    res.status(201).json(piece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir toutes les pièces ou une pièce spécifique par ID
router.get("/:id?", async (req, res) => {
  try {
    if (req.params.id) {
      const piece = await Piece.findById(req.params.id);
      if (!piece) return res.status(404).json({ message: "Pièce non trouvée" });
      return res.json(piece);
    }

    const pieces = await Piece.find();
    res.json(pieces);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Mettre à jour une pièce
router.put("/:id", async (req, res) => {
  try {
    const piece = await Piece.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!piece) return res.status(404).json({ message: "Pièce non trouvée" });
    res.json(piece);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une pièce
router.delete("/:id", async (req, res) => {
  try {
    await Piece.findByIdAndDelete(req.params.id);
    res.json({ message: "Pièce supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Insérer plusieurs data à la fois
router.post("/bulk", async (req, res) => {
  try {
    const pieces = await Piece.insertMany(req.body);
    res.status(201).json({ message: "Pièces insérées avec succès", data: pieces });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
