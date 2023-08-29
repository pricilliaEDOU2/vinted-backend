const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    unique: true, //Permet d'éviter de créer un utilisateur avec le même email. Clé unique
    type: String,
  },

  account: {
    username: String,
    avatar: Object,
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
