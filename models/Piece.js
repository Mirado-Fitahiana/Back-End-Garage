const mongoose = require("mongoose");

const pieceSchema = new mongoose.Schema({
    mere: {
      type: String,
      required: true,
    },
    fille: {
      type: String,
    },
});
const Piece = mongoose.model("Piece", pieceSchema);

module.exports = Piece;