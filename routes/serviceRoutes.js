const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Service = require("../models/Service");
const TypeService = require("../models/TypeService");
const mongoose = require("mongoose");
const { getUpcomingServices } = require("../controllers/serviceController");

const router = express.Router();
router.get("/upcoming", getUpcomingServices);
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
    const services = await Service.find().populate("user").populate("typeService").populate("piece").populate("voiture").populate("mecanicien");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Obtenir un service par ID
router.get("/user/:isUser?", async (req, res) => {
  try {
    if (req.params.idUser) {
      const service = await Service.find({ user: req.params.idUser })
        .sort({ date: -1 })
        .populate("user")
        .populate("typeService")
        .populate("piece")
        .populate("voiture")
        .populate('mecanicien');
      if (!service) return res.status(404).json({ message: "Service non trouvé" });
      return res.json(service);
    }
    const services = await Service.find()
      .sort({ date: -1 })
      .populate("user")
      .populate("typeService")
      .populate("piece")
      .populate("voiture")
      .populate('mecanicien');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Mettre à jour un service
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { dureeEstimee, duree } = req.body;

    // Fonction pour convertir une durée en nombre (en heures décimales)
    function convertirEnNombre(dureeString) {
      if (!dureeString) return null;
      const [heures, minutes] = dureeString.split(":").map(Number);
      return heures + (minutes / 60);
    }

    // Mise à jour des champs calculés si nécessaire
    if (dureeEstimee) {
      req.body.dureeEstimeeEnNombre = convertirEnNombre(dureeEstimee);
    }

    if (duree) {
      req.body.dureeEnNombre = convertirEnNombre(duree);
    }

    // Mise à jour du service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

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

// Récupérer tous les services dont la dateFixeVisite est aujourd'hui
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const services = await Service.find({
      dateFixeVisite: { $gte: startOfDay, $lt: endOfDay }
    });

    // if (!services || services.length === 0) {
    //   return res.status(404).json({ message: "Aucun service trouvé pour aujourd'hui" });
    // }

    const count = services.length;
    return res.json({ count });
  } catch (error) {
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

// Recherche de la durée totale de travail d'un utilisateur par mois (par jour)
router.get("/mecanicien/:userId/duree-travail/:year/:month", async (req, res) => {
  try {
    const { userId, year, month } = req.params;

    // Convertir l'année et le mois en nombre entier
    const yearInt = parseInt(year);
    const monthInt = parseInt(month);

    // Déterminer la date de début et de fin du mois spécifié
    const startDate = new Date(yearInt, monthInt - 1, 1); // Premier jour du mois
    const endDate = new Date(yearInt, monthInt + 1, 1); // Premier jour du mois suivant

    const result = await Service.aggregate([
      {
        $match: {
          mecanicien: new mongoose.Types.ObjectId(userId),
          dateFixeVisite: { $gte: startDate, $lt: endDate },
          dureeEnNombre: { $exists: true }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$dateFixeVisite" } }
          },
          totalDuree: { $sum: "$dureeEnNombre" }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]);
    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
    const allDates = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(yearInt, monthInt - 1, day).toISOString().split('T')[0];
      allDates[dateString] = 0;
    }

    result.forEach(item => {
      allDates[item._id.date] = item.totalDuree;
    });
    const formattedResult = {};
    Object.keys(allDates).forEach(date => {
      formattedResult[date] = allDates[date];
    });

    res.status(200).json(formattedResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compter le nombre de rendez-vous par état
router.get("/etat/:etat?", async (req, res) => {
  try {
    const service = await Service.find({ etat: req.params.etat });
    if (!service) return res.status(404).json({ message: "Etat non trouvé" });
    const count = service.length;
    return res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Somme totale de tous les montantFinal pour l'année en cours
router.get("/montant-total/global", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Définir la date de début et de fin de l'année actuelle
    const startDate = new Date(currentYear, 0, 1); // 1er Janvier de l'année courante
    const endDate = new Date(currentYear + 1, 0, 1); // 1er Janvier de l'année suivante

    const result = await Service.aggregate([
      {
        $match: {
          dateFixeVisite: { $gte: startDate, $lt: endDate }, // Filtre par année courante
          montantFinal: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalMontantFinal: { $sum: "$montantFinal" }
        }
      }
    ]);

    // Vérifier si des données ont été trouvées
    const total = result.length > 0 ? result[0].totalMontantFinal : 0;

    res.status(200).json({ total, year: currentYear }); // Retourne aussi l'année actuelle
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recherche du montant total par mois pour une année donnée
router.get("/montant-total/:year", async (req, res) => {
  try {
    const { year } = req.params;
    const yearInt = parseInt(year);

    // Définir la date de début et de fin de l'année
    const startDate = new Date(yearInt, 0, 1); // 1er janvier de l'année
    const endDate = new Date(yearInt + 1, 0, 1); // 1er janvier de l'année suivante

    const result = await Service.aggregate([
      {
        $match: {
          dateFixeVisite: { $gte: startDate, $lt: endDate },
          montantFinal: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateFixeVisite" },
            month: { $month: "$dateFixeVisite" }
          },
          totalMontantFinal: { $sum: "$montantFinal" }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ]);

    // Formatage de la réponse pour faciliter l'utilisation côté frontend
    const formattedResult = {};

    // Ajouter tous les mois avec valeur par défaut de 0
    for (let month = 1; month <= 12; month++) {
      const monthKey = `${yearInt}-${month.toString().padStart(2, '0')}`;
      formattedResult[monthKey] = 0;
    }

    // Remplir les mois disponibles dans les résultats de l'agrégation
    result.forEach(item => {
      const monthKey = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
      formattedResult[monthKey] = item.totalMontantFinal;
    });

    res.status(200).json(formattedResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/etat/:etat/mecanicien/:mecanicienId', async (req, res) => {
  const etatParam = req.params.etat; 
  const mecanicienId = req.params.mecanicienId;

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999); 

  try {
      const services = await Service.find({ 
          etat: etatParam, 
          mecanicien: mecanicienId,
          dateFixeVisite: { $gte: todayStart, $lte: todayEnd } 
      })
      .populate('user')
      .populate('typeService')
      .populate('voiture')
      .populate('piece')
      .populate('mecanicien')
      .exec();
      
      res.status(200).json(services);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
module.exports = router;
