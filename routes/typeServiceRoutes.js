const express = require("express");
const TypeService = require("../models/TypeService");

const router = express.Router();

// Ajouter un type de service
router.post("/", async (req, res) => {
  try {
    const typeService = new TypeService(req.body);
    await typeService.save();
    res.status(201).json(typeService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir tous les types de service
router.get("/", async (req, res) => {
  try {
    const typeServices = await TypeService.find();
    res.json(typeServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir un type de service par ID
router.get("/:id?", async (req, res) => {
  try {
    if (req.params.id) {
      const typeService = await TypeService.findById(req.params.id);
      if (!typeService) return res.status(404).json({ message: "Type de service non trouvé" });
      res.json(typeService);
    }
    const typeServices = await TypeService.find();
    res.json(typeServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un type de service
router.put("/:id", async (req, res) => {
  try {
    const typeService = await TypeService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!typeService) return res.status(404).json({ message: "Type de service non trouvé" });
    res.json(typeService);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un type de service
router.delete("/:id?", async (req, res) => {
  try {
    if (req.params.id) {
      await TypeService.findByIdAndDelete(req.params.id);
      return res.json({ message: "Type de service supprimé avec succès" });
    }
    await TypeService.deleteMany();
    res.json({ message: "Tous les types de service ont été supprimés" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add multiple type services at once
router.post("/bulk", async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: "Request body must be an array of TypeService objects" });
    }

    const typeServices = await TypeService.insertMany(req.body);
    res.status(201).json({ message: "Types de service ajoutés avec succès", data: typeServices });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;