var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var VerifyToken = require('./VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var connection = require('../db');
/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/login', function(req, res) {
    const Email = req.body.EmailId;
    var sql = "Select * FROM user where EmailId = '" +  Email + "'";
    connection.query(sql, function(err,rows,fields){
      if(err){
        res.status(500).send('Error on the server');
      } else {
        if(rows.length === 0){
          res.status(404).send('No user Found');
        }
        else {
          const values = JSON.parse(JSON.stringify(rows));
          var passwordIsValid = bcrypt.compareSync(req.body.Password, values[0].Password);
          if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
          var token = jwt.sign({ id: values[0].UserId }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          res.status(200).send({ auth: true, token: token, data:values });
        }
      }
    })
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function(req, res) {
    var hashedPassword = bcrypt.hashSync(req.body.Password, 8);
    var sql = "Select EmailId FROM user where EmailId = ' `${req.body.EmailId}` ' ";
    connection.query(sql, function(err, result){
      if(err){
        res.status(500).send({message: 'Error'});
      } else {
        if(result.length !== 0){
          return res.status(404).send("User Already exists");
        } else {
          var entry = "INSERT INTO user  Values( '" + req.body.UserId + "', '" +req.body.Name + "', '" + req.body.EmailId + "', '" + hashedPassword +"', '" +req.body.PhoneNo +"', '" + req.body.AddharNo + "')";
          connection.query(entry, function(error, resp){
            if(error){
              res.status(500).send({message: 'User details not entered in database. Connection Failed'});
            } else {
              var token = jwt.sign({ id: req.body.UserId }, config.secret, {
                expiresIn: 86400 // expires in 24 hours
              });
            res.status(200).send({ auth: true, token: token});
          }
        })
      }
    }
  })
});

router.get('/me', VerifyToken, function(req, res, next) {
  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

module.exports = router;