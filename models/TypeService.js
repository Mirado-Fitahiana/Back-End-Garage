const mongoose = require("mongoose");

const typeServiceSchema = new mongoose.Schema({
    nom: {
      type: String,
      required: true,
    },
    partie: {
        type: String
    },
    typeEntretien: {
        type: String
    }
});
const TypeService = mongoose.model("TypeService", typeServiceSchema);

module.exports = TypeService;