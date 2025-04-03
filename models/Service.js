const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    typeService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TypeService",
        required: true
    },
    voiture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voiture",
        required: true
    },
    piece: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Piece",
        }
    ],
    avecPiece: [
        {
        type: Boolean
        }
    ],
    prixPiece: [
        {
        type: Number
        }
    ],
    description: {
        type: String
    },
    visibleSymptom: {
        type: Boolean
    },
    image: {
        type: String
    },
    typeEntretien: {
        type: String
    },
    pieceAreparer: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now 
    },
    dateDerniereEntretien: {
        type: Date
    },  
    dateSuggestionVisite: {
        type: Date
    },
    heureSuggestionVisite: {
        type: String
    },
    dateFixeVisite: {
        type: Date
    },
    heureFixeVisite: {
        type: String
    },
    dureeEstimee: {
        type: String
    },
    dureeEstimeeEnNombre: {
        type: Number
    },
    duree: {
        type: String
    },
    dureeEnNombre: {
        type: Number
    },
    montantFinal: {
        type: Number
    },
    etat: {
        type: String,
        required: true
    },
    mecanicien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true });

serviceSchema.pre("validate", async function (next) {
    if (this.typeService) {
      // Charger le typeService pour vérifier son nom
      const TypeService = mongoose.model("TypeService");
      const typeService = await TypeService.findById(this.typeService);
      
      if (typeService && typeService.nom === "Réparation" && (!this.piece || this.piece.length === 0)) {
        return next(new Error("Le champ 'piece' est obligatoire pour un service de type Réparation."));
      }
    }
    next();
  });

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
