const mongoose = require("mongoose");
var Vendor = require("./models/models").Vendor;
var Product = require("./models/models").Product;
var PO = require("./models/models").PO;

//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/intranet");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

// Add 5 vendors with random char codes

// // Change vendor code, vendor name and email
// Vendor.find({}, async (err, prodObjs) => {
//   await prodObjs.forEach(async (vend, index) => {
//     vend.howWeOrder = "Redacted";
//     await vend.save(err => {
//       if (err) console.error(`${vend.sku} has error: ${err}`);
//     });
//   });
//   console.log("done?");
// });

/*
Change vendor code, name, email
    Code: 4 random letters
    Name: 'Redacted'
    Email: orders@ ^ those 4 letters


Change SKU:
    descriptions: redacted
    Part numbers: four letters + 5 numbers
    
*/

generateCharacters = length => {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

generateString = length => {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  )
    .substring(0, length)
    .toUpperCase();
};

rn = (min, max) => {
  return Math.random() * (max - min) + min;
};

resetOnOrder = async () => {
  const products = await Product.find({}, (a, b) => b);
  const poObjects = await PO.find({}, (a, b) => b);
  const promises = products.map(async product => {
    product.onOrder = 0;
    poObjects.forEach(po => {
      po.content.forEach(row => {
        if (row.sku === product.sku) {
          product.onOrder += row.qty_ordered;
        }
      });
    });
    await product.save();
    console.log("saved " + product.sku);
  });
  await Promise.all(promises);
  console.log("Done.");
};

resetOnOrder();
