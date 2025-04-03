const mongoose = require("mongoose");

const factureSchema = new mongoose.Schema({
    numeroFacture: {
        type: String,
        unique: true
    },
    client:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    typeService: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TypeService",
        required: true
    },
    service:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    voiture: {
        type:String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    coutReparation: {
        type: Number,
        required: true
    },
    piece: [{
        type: String 
    }],
    coutPiece: [{
        type: Number,
    }]
    ,
    montantPayer: {
        type: Number,
        required: true
    },
});


async function getNextFactureNumber() {
    const counterModel = mongoose.models.Counter || mongoose.model("Counter", new mongoose.Schema({
        name: { type: String, required: true },
        value: { type: Number, required: true }
    }));

    let counter = await counterModel.findOne({ name: "facture" });

    if (!counter) {
        counter = new counterModel({ name: "facture", value: 0 });
    }

    counter.value++;
    await counter.save();

    return `FF${String(counter.value).padStart(3, '0')}`;
}

factureSchema.pre("save", async function (next) {
    if (this.isNew) { 
        try {
            this.numeroFacture = await getNextFactureNumber();
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Facture", factureSchema);
