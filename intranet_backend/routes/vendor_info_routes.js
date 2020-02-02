const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
var Vendor = require("../models/models").Vendor;
var Product = require("../models/models").Product;

//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/intranet");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router.post("/addvendor", (req, res, next) => {
  var newVendor = new Vendor(req.body);
  // probably add some validation before savingg
  newVendor.save((err, vendor) => {
    if (err) {
      res.status(500);
      res.send(`Vendor addition error:\n${err.errmsg}`);
    } else {
      res.status(201);
      res.send(`${vendor.vendorName} added successfully.`);
    }
  });
});

router.post("/deletevendor", (req, res, next) => {
  var vendId = req.body.vendorId;
  Vendor.deleteOne({ _id: vendId }, (err, something) => {
    if (err) res.next(err);
    res.redirect("/vendorinfo");
  });
});

router.post("/updatevendor", (req, res, next) => {
  var resObj = req.body;
  var id = resObj.vendorId;
  delete resObj.vendorId;
  Vendor.replaceOne({ _id: id }, resObj, (err, _res) => {
    if (err) next(err);
    res.status(201);
    if (_res.nModified == 1) {
      res.status(201);
      res.send(`${resObj.vendorName} updated successfully.`);
    } else {
      res.status(500);
      res.send("No fields were updated.");
    }
  });
});

router.get("/attributes", (req, res, next) => {
  var vendorCode = req.query.vendor;
  Vendor.findOne({ vendorCode: vendorCode }, (err, vendor) => {
    res.status(201);
    res.json(vendor);
  });
});

router.get("/allvendorcodes", (req, res, next) => {
  Vendor.find({}, "vendorCode", (err, vendorCodes) => {
    const resData = vendorCodes.map(vendorObj => vendorObj.vendorCode);
    res.json(resData);
  });
});

// router.get('/products', (req, res, next) => {
//     var vendorCode = req.query.vendorcode;
//     Product.find({"primaryVendor.vendorCode": vendorCode}, (err, found) => {
//         if (err) next(err);
//         res.locals.productsArray = found;
//         res.render('./vendor_info/products_for_vendor.pug');
//     });
// });

// router.param('vendorCode', (req, res, next, vendorCode) => {
//     Vendor.findOne({vendorCode: vendorCode}, (err, vendorObj) => {
//         if (err) return next(err);
//         if (!vendorObj) {
//             console.error('No doc found, doc.')
//             res.send('Vendor not found.')
//         };
//         req.vendorObj = vendorObj;
//         return next();
//     });
// });

// router.get('/:vendorCode', (req, res, next) => {
//     res.locals.vendorObj = req.vendorObj;
//     res.render('./vendor_info/vendors.pug');
// });

module.exports = router;
