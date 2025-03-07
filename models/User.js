const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  adresseMail: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  numeroTel: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ["ADMIN", "CLIENT", "MECANICIEN"], // 1 = manager, 2 = client, 3 = mécanicien
    required: true
  },
  photo: {
    type: String,
    default: "https://res.cloudinary.com/djw5i7vxf/image/upload/v1619001972/user-icon-6_k4v0jw.png"
  }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
