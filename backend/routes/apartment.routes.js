module.exports = app => {
    const apartmentController = require("../controllers/apartment.controller.js");
  
    var router = require("express").Router();

    // Get all Apartments
    router.get("/", apartmentController.getApartments);

    // Get single Aapartment
    router.get("/apartment/:id", apartmentController.getApartment);

    // Show form for inserting a new Apartment or submit a new Apartment
    router.route("/create")
          .get(apartmentController.renderCreate)
          .post(apartmentController.create);

    app.use("/apartments", router);
  };