var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require(__root + 'auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: true }));
var connection = require('../db');
// CREATES A NEW USER
router.post('/', function (req, res) {
    // query to insert user in db
   
            var sql = "INSERT INTO user (`UserId`,`Name`,`EmailId`,`Password`,`PhoneNo`,`AddharNo`) Values ('3','Viram','viram1999@gmail.com','28819093','8879490','123d678')";
            connection.query(sql, function(err,result){
                if(err){
                    console.log(err);
                    res.send({message: 'Error Occured'})
                } else {
                    console.log('record stored');
                    res.send({message: 'user created'});
                }
            })
});

// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
    // query to retun all the users in db
            var sql = "Select * from user";
            connection.query(sql, function(err, result){
                if(err){
                    console.log(err);
                    res.send({message: 'Error Occured'})
                } else {
                    console.log('records received');
                    res.send({message : result});
                }
            })
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function (req, res) {
           var sql = "Select EmailId from user where UserId = " + req.params.id;
           connection.query(sql, function(err,result){
               if(err){
                   console.log(err);
                   res.send({message: 'Error Occured'})
               } else {
                   console.log('record received');
                   res.send({message: result});
               }
           })
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
    
});

// UPDATES A SINGLE USER IN THE DATABASE
// Added VerifyToken middleware to make sure only an authenticated user can put to this route
router.put('/:id', /* VerifyToken, */ function (req, res) {
   
});


module.exports = router;