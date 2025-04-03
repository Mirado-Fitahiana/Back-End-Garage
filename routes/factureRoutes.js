const express = require("express");
const router = express.Router();
const Facture = require("../models/Facture"); 

router.post("/", async (req, res) => {
    try {
        const facture = new Facture(req.body);
        const savedFacture = await facture.save();
        res.status(201).json(savedFacture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const factures = await Facture.find()
            .populate("client")
            .populate("typeService")
            .populate("service");
        res.status(200).json(factures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id)
            .populate("client")
            .populate("typeService")
            .populate("service");

        if (!facture) return res.status(404).json({ message: "Facture non trouvée" });

        res.status(200).json(facture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get("/client/:client?", async (req, res) => {
    try {
        const facture = await Facture.find({ client: req.params.client })
            .populate("client")
            .populate("typeService")
            .populate("service");

        if (!facture) return res.status(404).json({ message: "Facture non trouvée" });

        res.status(200).json(facture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const updatedFacture = await Facture.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedFacture) return res.status(404).json({ message: "Facture non trouvée" });

        res.status(200).json(updatedFacture);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedFacture = await Facture.findByIdAndDelete(req.params.id);

        if (!deletedFacture) return res.status(404).json({ message: "Facture non trouvée" });

        res.status(200).json({ message: "Facture supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
