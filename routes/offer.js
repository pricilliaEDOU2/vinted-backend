const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");

const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/offers", isAuthenticated, fileUpload(), async (req, res) => {
  try {
    /* console.log(req.headers.authorization); permet de visualiser le token inscrit dans le body Bearer token*/
    const { title, description, price, condition, city, brand, size, color } =
      req.body;
    /* console.log(req.body);*/
    /* console.log(req.files); /*pour recevoir la photo*/
    const newOffer = new Offer({
      product_mame: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          ETAT: condition,
        },
        {
          EMPLACEMENT: city,
        },
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          COULEUR: color,
        },
      ],
      owner: req.user,
    });

    const cloudinaryResponse = await cloudinary.uploader.upload(
      convertToBase64(req.files.picture)
    );
    /*console.log(result);permet d'avoir l'url où est stockée l'image*/
    /*Rajout de l'image reçue*/
    newOffer.product_image = cloudinaryResponse;
    await newOffer.save();
    /*console.log(newOffer);*/
    return res.status(201).json(newOffer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    //Renvoyer la page 1 par defaut
    let page = 1;

    //Présenter 10 éléments par page
    let limit = 5;

    if (req.query.page) {
      page = req.query.page;
    }

    const filters = {};
    if (req.query.title) {
      filters.product_mame = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = {
          $lte: Number(req.query.priceMax),
        };
      }
    }
    const sort = {};
    if (req.query.sort === "price-asc") {
      sort.product_price = -1;
    } else if (req.body.sort === "price-desc") {
      sort.product_price = "desc";
    }

    const skip = (page - 1) * limit;

    const filteredOffers = await Offer.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select("product_name product_price -_id");

    return res.status(200).json(filteredOffers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({ error: error.messsage });
  }
});

module.exports = router;
