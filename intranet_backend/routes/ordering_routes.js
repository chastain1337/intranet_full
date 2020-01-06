const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
var Product = require("../models/models").Product;
var Vendor = require("../models/models").Vendor;
var PO = require("../models/models").PO;
const moment = require("moment");

//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/nahvac");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router.get("/compile", async (req, res, next) => {
  // Create a new purchase order for each vendor if  amountToOrder is > whenWeOrder
  const vendors = await Vendor.find({}, (a, b) => b);
  const products = await Product.find({}, (a, b) => b);
  const filteredVendors = vendors.filter(
    vendor => vendor.amountToOrder >= vendor.whenWeOrder
  );
  console.log(filteredVendors);

  const promises = filteredVendors.map(async vendor => {
    const filteredProducts = products.filter(
      product =>
        product.primaryVendor === vendor.vendorCode && product.qtyToOrder > 0
    );
    const poContent = filteredProducts.map((product, index) => {
      return {
        line_id: `${Date.now()}-${index}`,
        sku: product.sku,
        part_number: product.partNumber,
        desc: product.desc ? product.desc : "",
        qty_ordered: product.qtyToOrder,
        qty_outstanding: product.qtyToOrder,
        qty_recd: 0,
        price_unit: product.luc,
        price_extended: Math.round(product.luc * product.qtyToOrder * 100) / 100
      };
    });

    const qty = Number(
      poContent.reduce((total, row) => {
        return total + row.qty_outstanding;
      }, 0)
    );
    const amount = Number(
      poContent.reduce((total, row) => {
        return total + row.price_extended;
      }, 0)
    );

    const poObj = {
      number: `${vendor.vendorCode}${moment().format("YY.MM.DD")}`,
      vendor: vendor.vendorCode,
      total_qty: qty,
      total_outstanding_qty: qty,
      total_amount: amount,
      total_outstanding_amount: amount,
      dateCreated: Date.now(),
      dateModified: Date.now(),
      orderDate: Date.now(),
      submitted: false,
      content: poContent
    };
    console.log(poObj);
    await new PO(poObj).save();
  });
  await Promise.all(promises);
  res.status(201);
  res.send({ success: true, ordersCreated: promises.length });
});

router.get("/calculate", async (req, res, next) => {
  const products = await Product.find({}, async (err, productsArr) => {
    return productsArr;
  });
  const promises1 = products.map(async product => {
    product.qtyToOrder = product.max - product.available - product.onOrder;
    if (product.qtyToOrder < 0) product.qtyToOrder = 0;
    if (product.available < product.min) {
      product.orderFromMinAmount = product.qtyToOrder * product.luc;
    } else {
      product.orderFromMinAmount = 0;
    }
    await product.save();
  });

  await Promise.all(promises1);

  const vendors = await Vendor.find({}, async (err, vendorArr) => {
    return vendorArr;
  });

  const updatedProducts = await Product.find({}, async (err, productsArr) => {
    return productsArr;
  });

  const promises2 = vendors.map(async vendor => {
    const productsFromThisVendor = updatedProducts.filter(
      product => product.primaryVendor === vendor.vendorCode
    );
    console.log(productsFromThisVendor[0]);
    vendor.amountToOrder = productsFromThisVendor.reduce((total, product) => {
      return total + Number(Math.round(product.orderFromMinAmount * 100) / 100);
    }, 0);
    await vendor.save();
  });

  await Promise.all(promises2);

  res.status(201);
  res.send("finished");
});

router.post("/inventoryFile", (req, res, next) => {
  const data = JSON.stringify(req.body).replace(
    /([^ ,\\0-9a-zA-Z_\.\-])+/g,
    ""
  );
  const rows = data.split("\\n").map(row => {
    const rowArray = row.split(",");
    return { sku: rowArray[0], available: rowArray[1] };
  });
  console.log(rows);

  let successes = [];
  let failures = [];
  const promises = rows.map(async row => {
    await Product.findOne({ sku: row.sku }, async (err, _prod) => {
      if (err) return err;
      if (!_prod) {
        failures.push(row.sku);
        return;
      }
      _prod.available = row.available;
      await _prod.save(err => {
        if (err) {
          failures.push(row.sku);
          return;
        }
        successes.push(row.sku);
      });
    });
  });

  Promise.all(promises).then(() => {
    console.log(successes);
    console.log(failures);
    res.status(201);
    return res.send({ finished: true, succ: successes, fail: failures });
  });
});

module.exports = router;
