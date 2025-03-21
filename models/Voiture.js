const mongoose = require("mongoose");

const voitureSchema = new mongoose.Schema({
  marque: {
    type: String,
    required: true,
  },
  modele: {
    type: String,
    required: true,
  },
  annee: {
    type: Number,
    required: true,
  },
  immatriculation: {
    type: String,
    required: true,
    unique: true,
  },
  typeCarburant: {
    type: String,
    enum: ["Essence", "Diesel", "Hybride", "Électrique"],
    required: true,
  },
  puissance: {
    type: Number,
  },
  kilometrage: {
    type: Number,
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

const Voiture = mongoose.model("Voiture", voitureSchema);

module.exports = Voiture;
