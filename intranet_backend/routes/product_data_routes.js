const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var Vendor = require("../models/models").Vendor;
var Product = require("../models/models").Product;

//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/intranet");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

router.get("/getproduct", (req, res, next) => {
  var _sku = req.query.sku;
  Product.findOne({ sku: _sku }, (err, product) => {
    if (err) {
      res.status(500);
      res.send("An error occured. " + err);
    } else {
      res.status(200);
      res.send(product);
    }
  });
});

router.get("/products", (req, res, next) => {
  const fields = req.query.field;
  Product.find({}, fields, (err, obj) => {
    res.json(obj);
  });
});

router.get("/allskus", (req, res, next) => {
  Product.find({}, "sku", (err, obj) => {
    const skus = obj.map(_obj => _obj.sku);
    res.json(skus);
  });
});

router.get("/allproductvendorcodes", (req, res, next) => {
  Product.find({}, (err, prouctObjects) => {
    const vendorCodes = prouctObjects.map(prod => {
      if (prod.primaryVendor) {
        return prod.primaryVendor.vendorCode;
      }
    });
    res.json(vendorCodes);
  });
});

router.post("/deleteProduct", (req, res, next) => {
  console.log(req.body.skuToDel);
  Product.deleteOne({ sku: req.body.skuToDel }, err => {
    if (err) {
      console.error(err);
      next(err);
    }
    res.status(201);
    res.send(null);
  });
});

router.post("/updateproduct", async (req, res, next) => {
  var resObj = req.body;

  // Update vendor code to vendor object code
  const vendorObj = await Vendor.findOne(
    { vendorCode: resObj.primaryVendorCode },
    (err, obj) => {
      return obj;
    }
  );
  resObj.primaryVendor = vendorObj;
  delete resObj.primaryVendorCode;

  var numUpdated;
  doTheRest = numUpdated => {
    console.log(numUpdated);
    if (numUpdated === 1) {
      res.status(201);
      res.send(null);
    } else {
      res.status(500);
      res.send(null);
    }
  };

  if (!resObj._id) {
    // You are creating, not updating a product
    console.log("creating product on server side");
    const resDocument = new Product(resObj);
    await resDocument.save(async err => {
      if (err) {
        console.error(err);
        return next(err);
      } else {
        doTheRest(1);
      }
    });
    console.log(numUpdated);
  } else {
    await Product.replaceOne({ _id: resObj._id }, resObj, (err, _res) => {
      if (err) {
        return next(err);
      } else {
        doTheRest(1);
      }
    });
  }
});

module.exports = router;
