const bodyParser = require('body-parser');
const ejs = require('ejs');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

module.exports = function(app, express) {

    app.use(morgan('dev'));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(session({
        secret: 'le brutte intenzioni la maleducazione',
        resave: false,
        saveUninitialized: true
      }))
    
    app.set('views', path.join(__dirname, '../../frontend'));
    app.set('view engine', 'ejs');

    app.use(express.static(path.join(__dirname, '../../frontend')));
    //app.use(express.static(path.join(__dirname, '../../frontend/template/.')));
};