const fileuploader = require('../utilities/file-uploader.js');
const sendmail = require('../utilities/mail-send');
const moment = require('moment');
const Mapper = require('../utilities/request-model-mapper.js')
const Reservation = require('../models/reservation.js');
const User = require('../models/user.js');

module.exports = 
{
    becomeHost: async (req, res) => {
        await User.findByIdAndUpdate(req.session.user._id, { $set: { is_host: true } }, { new: true }, function(err, updatedUser) {

            if(err) {
                console.log(`Mongo error while updating user profile data: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }
            else {
                res.status(200).json({message: 'User is now host'});
                req.session.user = updatedUser;
                req.session.save();
            }
        });
    },

    logout: (req, res) => {
        req.session.user = null;
        req.session.save();
        res.status(200).redirect("/");
    },

    profile: (req, res) => {
        if(!req.session.user)
            res.sendStatus(403);
        else
            res.render("index", {pagetitle: "Gestione Profilo", path: "profile"});
    },

    reservationsEarnings: async (req, res) => {

        if(!req.session.user || !req.session.user.is_host)
            res.sendStatus(403);
        else {
            await Reservation.find({
                host: req.session.user._id,
                status: { $nin: ["canceled", "refused"]}
            }, function(err, reservations) {
                if(err) {
                    console.log(`Mongo error while reservations data: ${err}`);
                    res.status(500).json({message: "Server error while processing the request"});
                }
                else {                
                    let data = JSON.stringify(reservations.map(result => {
                        return result == null ? result : { 
                            x: result.createdAt,
                            y: result.cleaning_cost + result.stay_cost,
                        };
                    }));
                    res.render("index", { pagetitle: "Gestione Guadagni", path: "reservations-earnings", reservations, data});
                }
            }).populate("apartment").populate("customer");
        }
    },

    reservationsReports: async (req, res) => {

        if(!req.session.user || !req.session.user.is_host)
            res.sendStatus(403);
        else {
            await Reservation.find({
                host: req.session.user._id,
                status: { $nin: ["canceled", "refused"]}
            }, function(err, reservations) {
                if(err) {
                    console.log(`Mongo error while reservations data: ${err}`);
                    res.status(500).json({message: "Server error while processing the request"});
                }
                else {                
                    let data = JSON.stringify(reservations.map(result => {
                        return result == null ? result : { 
                            x: result.createdAt,
                            y: result.city_tax,
                        };
                    }));
                    res.render("index", { pagetitle: "Storico Guadagni", path: "reservations-reports", reservations, data});
                }
            }).populate("apartment").populate("customer");
        }
    },

    sendReports: async(req,res) => {
        
        if(!!req.files) {

            let filesPackages = Object.values(req.files);

            for(filePackage of filesPackages) {

                req.session.user.profile_document_path = new Array();
                let i = 0;

                if(Array.isArray(filePackage)) {

                    for(file of filePackage) {
                        let filePath = `/uploads/hosts/files/_${moment().format("YYYY-MM-DD_hh-mm-ss")}.xls`;
                        req.session.user.profile_document_path.push(await fileuploader(file, filePath));
                        
                        i++;
                    }
                }
                else {
                    let file = filePackage;
                    let filePath = `/uploads/hosts/files/RendicontoBnB_${moment().format("YYYY-MM-DD")}.xls`;
                    req.session.user.profile_document_path.push(await fileuploader(file, filePath));
                }

            }
        } 


        sendmail("bnb.webandmobile@gmail.com", "Rendiconto ultimi 3 mesi", "Rendiconto totale degli ultimi 3 mesi, incluso di generalità e intervallo di tempo degli affitti", "",[{

            filename: 'RendicontoBnB_' + '.xls',
            path:`./public/uploads/hosts/files/RendicontoBnB_${moment().format("YYYY-MM-DD")}.xls`
               }]);
          res.send("Invio avvenuto con successo!");

    },  


    renderBecomeHost: (req, res) => {
        if(req.session.user === undefined || req.session.user === null)
            res.sendStatus(403);
        else
            res.render("index", {pagetitle: "Diventa Host", path: "become-host"});
    },

    renderSignup: (req, res) => {
        res.render("index", {pagetitle: "Registrazione", path: "signup"});
    },

    signin: async (req, res) => {
        var email = req.body.email;
        var password = req.body.password;

        // Utilizzo il metodo comparePasswords della classe di modello 
        // per poter confrontare la password dopo avere decrittografata 
        await User.findOne({'email': email}, (err, user) => {

            if (!user) // notifies if user is not found
                res.status(401).json({message: "User not found"});

            else {
                user.comparePasswords(password, (err, match) => {
                
                if (!match) 
                    res.status(401).json({message: "Password mismatch"});
                else {
                    req.session.user = user;
                    res.status(200).json({message: 'Login succesful'});
                }
              });
            }
        });
    },

    signup: async (req, res) => {

        let existingUser;
        
        await User.findOne({'email': req.body.email}, (err, user) => {

            if(err) {
                console.log(`Mongo error while user was signing up: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }

            existingUser = user;
            
        });

        if (existingUser) {
            res.status(500).json({message: "User with this e-mail address already exists!"});
            return;
        }

        var newUser = new User(Mapper.getUserFromReq(req));
        newUser.is_host = false;

        await User.create(newUser, function(err, user) {
            if(err) {
                console.log(`Mongo error while user was signing up: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }
            else {
                req.session.user = newUser;
                res.status(201).json({message: 'Signup succesful'});
            }
        });
    },

    update: async (req, res) => {

        let imagePath = `/uploads/users/images/${req.params.id}_${moment().format("YYYY-MM-DD_hh-mm-ss")}.jpg`;
        let user = Mapper.getUserFromReq(req);

        if(req.files) {
            let image = Object.values(req.files)[0];
            user.profile_picture_path = await fileuploader(image, imagePath);
        }

        // Elimina eventuali valori undefined che arrivano dal form e che andrebbero
        // a sostituire i valori già salvati nel DB.
        Object.keys(user).forEach(key => user[key] === undefined && delete user[key]);

        await User.findByIdAndUpdate(req.params.id, user, { new: true}, function(err, updatedUser) {

            if(err) {
                console.log(`Mongo error while updating user profile data: ${err}`);
                res.status(500).json({message: "Server error while processing the request"});
            }
            else {
                res.status(200).json({message: 'User profile updated succesfully'});
                req.session.user = updatedUser;
                req.session.save();
            }
        });
    }
}