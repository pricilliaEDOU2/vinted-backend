const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

//SIGN UP

router.post("/user/signup", async (req, res) => {
  try {
    //Destructuration du body pour ne plus avoir à faire req.body partout
    const { username, email, newsletter, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing parameters" });
    } else {
      const user = await User.findOne({ email: email }); //Je vais chercher dans la collection User un élément dont l'email est égal  à l'émail que j'ai reçu.  On peut just mettre email au lieu de email =email car la clé et la variable ont le même nom
      if (user === null) {
        const salt = uid2(16);
        const token = uid2(36);
        const hash = SHA256(password + salt).toString(encBase64);
        console.log(hash);
        //console.log(token, salt);
        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          newsletter: newsletter,
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        const responseObject = {
          _id: newUser._id,
          token: newUser.token,
          account: { username: newUser.account.username },
        };
        res.status(200).json({ responseObject });
      } else {
        res.status(409).json({ error: "This email already exists" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGIN

router.post("/user/login", async (req, res) => {
  try {
    const password = req.body.password;
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const newHash = SHA256(password + user.salt).toString(encBase64);
      if (user.hash === newHash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ error: "Password and email do not match" });
      }
    } else {
      res.status(401).json({ error: "Password and email do not match" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
