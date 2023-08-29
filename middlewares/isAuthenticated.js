const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      /*console.log(req.headers.authorization);*/
      /*création d'une variable pour ne recevoir que le token sans le bearer*/
      const validToken = req.headers.authorization.replace("Bearer ", "");

      /*Vérifier que le tokenn existe*/
      const user = await User.findOne({ token: validToken }).select("account");
      //console.log(user);
      if (user) {
        req.user = user;
        return next();
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
