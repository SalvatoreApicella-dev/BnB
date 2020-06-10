const moment = require('moment');
const Mapper = require('../utilities/request-model-mapper.js')
const Apartment = require('../models/apartment.js');

module.exports = 
{
    create: async (req, res) => {
        var newApartment = new Apartment(Mapper.getApartmentFromReq(req));

        await Apartment.create(newApartment, async function(err, apartment) {
            if(err)
                console.log(`Mongo error while user was signing up: ${err}`);
            else {
                
                if(!!req.files) {

                let i = 0;
                let images = [].concat(req.files.photos);

                    for(let image of images) {
                        let path = `/apartment/images/${apartment._id}_${moment().format("YYYY-MM-DD_hh-mm-ss")}_${i}.jpg`;
                        image.mv(`./uploads${path}`);
                        apartment.photo_paths.push(path);
                        i++;
                    }
                }

                await Apartment.updateOne({_id: apartment._id}, apartment);
                res.status(201).json("Apartment inserted sucesfully");
            }
        });        
    },

    getApartment: async (req, res) => {
        await Apartment.findById(req.params.id, async function(err, apartment) {
            if(err) {
                console.log(`Mongo error while retrieving apartment data: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }
            else
                await Apartment.find({}, function(err, apartments) {
                    let apartmentsTest = JSON.stringify(apartments.map(x => { return { address: x.fulladdress, price: x.price } }));
                    res.render("index", {pagetitle: "Appartamento", path: "apartment-details", apartment, apartments, apartmentsTest});  
            });     
        });
    },

    getApartments: async (req, res) => { 
        await Apartment.find({}, function(err, apartments) {
            if(err) {
                console.log(`Mongo error while retrieveing apartments data: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }
            else
                res.render("index", {pagetitle: "Lista Appartamenti", path: "apartments", apartments});
        });
    },
    
    renderCreate: (req, res) => {
        if(req.session.user === undefined || req.session.user === null)
            res.sendStatus(403);
        else
            res.render("index", {pagetitle: "Inserimento Appartamento", path: "apartment-create"});
    },

    searchApartments: async (req, res) => {

        req.session.guests = {
            adults: req.query.guests_adults,
            children: req.query.guests_children,
            newborns: req.query.guests_newborns,
            total: req.query.guests
        };

        req.session.save();

        await Apartment.find({
            "address.province": req.query.province,
            "address.town": req.query.town,
            beds: { $gte: req.query.guests }
        }, function(err, apartments) {
            if(err) {
                console.log(`Mongo error while retrieveing apartments data: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }
            else
                res.render("index", {pagetitle: `Hai cercato alloggi a ${req.query.location}`, path: "apartments", apartments});
        });
    },
}
