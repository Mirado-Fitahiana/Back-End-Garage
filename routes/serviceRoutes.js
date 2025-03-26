const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Service = require("../models/Service");
const TypeService = require("../models/TypeService");
const mongoose = require("mongoose");

const router = express.Router();
router.post("/", async (req, res) => {
  try {
    let {
      user,
      typeService,
      piece,
      avecPiece,
      prixPiece,
      description,
      visibleSymptom,
      image,
      typeEntretien,
      pieceAreparer,
      date,
      dateDernièreEntretien,
      dateSuggestionVisite,
      heureSuggestionVisite,
      dateFixeVisite,
      heureFixeVisite,
      duree,
      montantFinal
    } = req.body;

    // Convert `user`, `typeService`, and `piece` to ObjectId
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(typeService)) {
      return res.status(400).json({ error: "Invalid typeService ID" });
    }
    if (piece && Array.isArray(piece)) {
      piece = piece.map(id => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid piece ID: ${id}`);
        }
        return new mongoose.Types.ObjectId(id);
      });
    }

    // Convert `prixPiece` to an array of Numbers
    if (prixPiece && Array.isArray(prixPiece)) {
      prixPiece = prixPiece.map(price => Number(price));
    } else {
      prixPiece = []; // Ensure it's an array even if empty
    }

    // Check if `typeService` exists
    const typeServiceData = await TypeService.findById(typeService);
    if (!typeServiceData) return res.status(404).json({ error: "TypeService introuvable" });

    // If "Réparation", ensure `piece` is required
    if (typeServiceData.nom === "Réparation" && (!piece || piece.length === 0)) {
      return res.status(400).json({ error: "Le champ 'piece' est obligatoire pour un service de type Réparation." });
    }

    // Create new service entry
    const newService = new Service({
      user: new mongoose.Types.ObjectId(user),
      typeService: new mongoose.Types.ObjectId(typeService),
      piece,
      avecPiece,
      prixPiece,
      description,
      visibleSymptom,
      image,
      typeEntretien,
      pieceAreparer,
      date,
      dateDernièreEntretien,
      dateSuggestionVisite,
      heureSuggestionVisite,
      dateFixeVisite,
      heureFixeVisite,
      duree,
      montantFinal
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Obtenir tous les services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().populate("user").populate("typeService").populate("piece");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un service par ID
router.get("/:id?", async (req, res) => {
  try {
    if(req.params.id){
      const service = await Service.findById(req.params.id).populate("user").populate("typeService").populate("piece");
      if (!service) return res.status(404).json({ message: "Service non trouvé" });
      return res.json(service);
    }
    const services = await Service.find().populate("user").populate("typeService").populate("piece");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un service
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedService) return res.status(404).json({ message: "Service non trouvé" });
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un service
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
