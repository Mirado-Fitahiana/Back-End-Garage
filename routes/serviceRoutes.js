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
      voiture,
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
      montantFinal,
      etat
    } = req.body;

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

    if (prixPiece && Array.isArray(prixPiece)) {
      prixPiece = prixPiece.map(price => Number(price));
    } else {
      prixPiece = [];
    }

    const typeServiceData = await TypeService.findById(typeService);
    if (!typeServiceData) return res.status(404).json({ error: "TypeService introuvable" });

    if (typeServiceData.nom === "Réparation" && (!piece || piece.length === 0)) {
      return res.status(400).json({ error: "Le champ 'piece' est obligatoire pour un service de type Réparation." });
    }

    const newService = new Service({
      user: new mongoose.Types.ObjectId(user),
      typeService: new mongoose.Types.ObjectId(typeService),
      voiture: new mongoose.Types.ObjectId(voiture),
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
      montantFinal,
      etat
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const services = await Service.find().populate("user").populate("typeService").populate("piece").populate("voiture");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Obtenir un service par ID
router.get("/user/:isUser?", async (req, res) => {
  try {
    if(req.params.idUser){
      const service = await Service.find({ user: req.params.idUser })
        .sort({ date: -1 })
        .populate("user")
        .populate("typeService")
        .populate("piece")
        .populate("voiture");
      if (!service) return res.status(404).json({ message: "Service non trouvé" });
      return res.json(service);
    }
    const services = await Service.find()
      .sort({ date: -1 })
      .populate("user")
      .populate("typeService")
      .populate("piece")
      .populate("voiture");
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
router.get("/search-all", async (req, res) => {
  try {
    console.log("Requête de recherche:", req.query);

    const keyword = req.query.keyword || "";
    const regex = new RegExp(keyword, "i");

    // On fait une recherche simple, sans populate d'abord
    const services = await Service.find({
      $or: [
        { description: regex },
        { etat: regex },
        { typeEntretien: regex }
      ]
    });

    if (services.length === 0) {
      return res.status(200).json([]);
    }

    // Ensuite, on utilise `Promise.all` pour peupler chaque service trouvé
    const populatedServices = await Promise.all(
      services.map(service => 
        service
          .populate("user")
          .populate("typeService")
          .populate("piece")
          .populate("voiture")
          .execPopulate()
      )
    );

    console.log("Services trouvés après populate:", populatedServices.length);
    res.status(200).json(populatedServices);
  } catch (error) {
    console.error("Erreur lors de la recherche:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Route dynamique par ID - Doit être définie après
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("user")
      .populate("typeService")
      .populate("piece")
      .populate("voiture");
      
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
