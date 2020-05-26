const userController = require("../controllers/user.controller.js");
const apartmentController = require("../controllers/apartments.controller.js");
const Apartment = require('../models/apartment.js');
const stream = require('stream');
module.exports = function(app, express) {

    require('../routes/user.routes.js')(app);
    require('../routes/apartment.routes.js')(app);

    //mi serve per testare
    var apartments = [
        {
            name: "Appartamento 1",
            price: 15.50,
            description: "Bellissimo appartamento vicino al mare",
        },
        {
            name: "Appartamento 2",
            price: 22,
            description: "Bellissimo appartamento in montagna",
        },
        {
            name: "Appartamento 3",
            price: 25.50,
            description: "Bellissimo appartamento in centro città, vicno alla stazione, ecc.",
        },
        {
            name: "Appartamento 4",
            price: 19.90,
            description: "Casa di Pirrone",
        },
    ];
    // fine roba di test

    // var stream = Apartment.find().cursor()
    // cursor.on('error', function (err) {
    // console.error(err)
    // })
    // stream.on('data', function (doc) {
    //  console.log(doc)
    // })
    
    // Apartment.find().stream()
    // .on('data', function(doc){
    //   apartments.push(convert(doc));
    // })
    // .on('error', function(err){
    //   // handle error
    // })
    // .on('end', function(){
    //     cb (null, emotions)
    // });


    const apartment =  Apartment.find(function (err, apartment) {
        if (err) return console.error(err);
        console.log(apartment);
        return
      })

      const list = apartment.exec();
        console.log(list);

    app.get('/', function(req, res) {
        var name = req.body.name;
        res.render("index", {pagetitle: "Home", apartments: apartments});
    });


    app.get('/signin', function(req, res) {
        res.render("signin");
    });

    app.get('/signup', function(req, res) {
        res.render("signup");
    });

    app.get("/insert", function(req,res)
    {
        res.render("insertApartment");
    });

};