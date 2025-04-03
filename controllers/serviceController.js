const Service = require("../models/Service"); // Assure-toi que le chemin est correct

const getUpcomingServices = async (req, res) => {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0); 
        const services = await Service.find({
            $or: [
                { 
                    dateFixeVisite: { $gte: now } 
                },
                { 
                    $and: [
                        { dateFixeVisite: { $lte: now } }, // Même jour
                        { heureFixeVisite: { $gte: now.toISOString().split('T')[1].slice(0, 5) } } // Heure >= maintenant
                    ]
                }
            ]
        }).select('dateFixeVisite heureFixeVisite');

        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUpcomingServices };
