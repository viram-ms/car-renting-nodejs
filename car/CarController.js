var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
global.__root   = __dirname + '/'; 
var connection = require('../db');
var DownloadPdf = require('../Download/index');
const puppeteer = require('puppeteer');


router.post('/createcar', function(req,res){
    var sql = "INSERT INTO vehicle VALUES ( '" + req.body.VehicleId + "' , '" +req.body.VehicleNo +  "' , '" + req.body.FType + "' , '" + req.body.Price + "' , '" + req.body.Location  + "' , '" + req.body.Status + "' , '" + req.body.Name + "' )" 
    connection.query(sql , function(err, result){
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error'});
        } else {
            res.status(200).send({message: 'Car Created Successfully'});
        }
    })
});

router.get('/getcar', function(req,res){
    var sql = "Select * from Vehicle";
    connection.query(sql, function(err, result){
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error'});
        } else {
            res.status(200).send({message: result});
        }
    })
});

router.post('/newbill', function(req,res){

    var sql = "INSERT INTO bill VALUES ( '" + req.body.BillId + "' , '" +req.body.Amount +  "' , '" + req.body.Gst + "' , '" + req.body.StartDate + "' , '" + req.body.EndDate  + "' , '" + req.body.VehicleId + "' , '" + req.body.UserId + "' ,'0' )" 
    console.log(sql);
    connection.query(sql , function(err, result){
        if(err){
            console.log(err);
            res.status(500).send({message: 'Error'});
        } else {
            var carsql = "Update vehicle set Status = '" + 0 + "' where VehicleId = " + req.body.VehicleId ;
            console.log(carsql);
            connection.query(carsql, function(err, carresult){
                if(err){
                    res.status(500).send({message: 'error'})
                } else {
                    res.status(200).send({message: 'Bill Created Successfully'});
                }
            }) 
        }
    })
});

router.post('/singlebill', function(req,res){
    var sql = "Select * from bill where UserId = '" + req.body.UserId + "' And StartDate = '" + req.body.StartDate  + "' And EndDate = '"  + req.body.EndDate + "'" ;
    connection.query(sql, function(error, result){
        if(error){
            res.status(500).send({message: 'Error'})
        } else {
            var usersql = "select * from user where UserId = '" + req.body.UserId + "'";
            console.log(usersql);
            connection.query(usersql, function(error, userresult){
                if(error){
                    res.status(500).send({message: 'Error'})
                } else {
                    var carsql = "select * from vehicle where VehicleId = '"  + result[0].VehicleId + "'";
                    connection.query(carsql, function(error, carresult){
                        if(error){
                            res.status(500).send({message: 'error'})
                        } else {
                            res.status(200).send({message: {bill:result, user: userresult, car: carresult}})
                        }
                    })
                }
            })
        }
    })
})

router.post('/history', function(req,res){
    var sql = "Select Vehicle.Name , Vehicle.VehicleNo, Vehicle.Ftype, Vehicle.Price, Vehicle.Location, Vehicle.Status, Bill.StartDate, Bill.EndDate, Bill.Amount, Bill.Gst, Bill.VehicleId, Bill.BillPaid, Bill.BillId from Bill Inner Join Vehicle on Vehicle.VehicleId = Bill.VehicleId where BillPaid='0' and UserID = '" + req.body.UserId + "'";
    console.log(sql);
    connection.query(sql, function(error , result ){
        if(error){
            res.status(500).send({message: error})
        } else {
            res.status(200).send({message: result})
        }
    })
});


router.post('/transactions', function(req,res){
   var sql = "Select Bill.BillId, Bill.Amount, Bill.Gst, Bill.StartDate, Bill.EndDate, Bill.VehicleId, Vehicle.Name , Vehicle.VehicleNo, Vehicle.Ftype, Vehicle.Price  from Bill join Vehicle on Vehicle.VehicleId = Bill.VehicleId where BillPaid = '1' and UserId = '" + req.body.UserId + "'";
   console.log(sql);
   connection.query(sql, function(error, result) {
       if(error){
           res.status(500).send({message: error})
       } else {
           res.status(200).send({message: result});
       }
   })
});



router.post('/return', function(req,res){
    var sql = "Update bill set BillPaid = '1' where BillId = '" + req.body.BillId + "'";
    console.log(sql);
    connection.query(sql, function(error, result){
        if(error){
            res.status(500).send({message: 'Error'})
        } else {
            var carsql = "Update vehicle set Status = '1' where VehicleId = '" + req.body.VehicleId + "'";
            console.log(carsql);
            connection.query(carsql, function(error, carresult){
                if(error){
                    res.status(500).send({message: 'error'})
                } else {
                    res.status(200).send({message: 'Car Returned Successfully'});
                }
            })
        }
    })
})

// router.post('/download', function(req, res){
//     var sql = "Select * from bill where UserId = '" + req.body.UserId + "' And StartDate = '" + req.body.StartDate  + "' And EndDate = '"  + req.body.EndDate + "'" ;
//     connection.query(sql, function(error, result){
//         if(error){
//             res.status(500).send({message: 'Error'})
//         } else {
//             var usersql = "select * from user where UserId = '" + req.body.UserId + "'";
//             connection.query(usersql, function(error, userresult){
//                 if(error){
//                     res.status(500).send({message: 'Error'})
//                 } else {
//                     var carsql = "select * from vehicle where VehicleId = '"  + result[0].VehicleId + "'";
//                     connection.query(carsql,function(error, carresult){
//                         if(error){
//                             res.status(500).send({message: 'error'})
//                         } else {
//                             const data = {bill:result, user: userresult, car: carresult}
//                             // console.log(data);
//                             const value = DownloadPdf.DownloadPdf(JSON.parse(JSON.stringify(data)));
//                             console.log('value',value);
//                             res.download(`./Download/Invoices/${data.user[0].Name}-${data.bill[0].BillId}.pdf`, function(err){
//                                 console.log(err)
//                                 if(!err){
//                                     res.status(200).send({message: 'Download SuccessFully'})
//                                 }
//                                 res.status(500).send({message: 'Error Download'});
//                             });

//                         }
//                     })
//                 }
//             })
//         }
//     })
// })

router.get('/export/pdf', (req, res) => {
    (async () => {
        const browser = await puppeteer.launch()
        const page = await browser.newPage();
        await page.goto('http://localhost:3000/bill')
        await page.evaluate(() => {
            localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTU2NzkyMzQ1NiwiZXhwIjoxNTY4MDA5ODU2fQ.kfmV-fVf1HBZPzAgzuUrdCR2izBpB0aTdlZW2QgA5Js')
        })
        await page.goto('http://localhost:3000/bill')
        const buffer = await page.pdf({format: 'A4', printBackground: true})
        console.log(buffer);
        res.type('application/pdf')
        res.send(buffer)
        browser.close()
    })()
})

module.exports = router;
