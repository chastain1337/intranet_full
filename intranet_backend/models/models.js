const mongoose = require("mongoose");
var chapterSchema = new mongoose.Schema({
  name: String,
  section: [
    {
      name: String
    }
  ]
});

var vendorSchema = new mongoose.Schema(
  {
    vendorCode: {
      type: String,
      required: true,
      //unique: true,
      trim: true,
      uppercase: true
    },
    vendorName: {
      type: String,
      required: false,
      trim: true
    },
    whenWeOrder: {},
    howWeOrder: {
      type: String
    },
    email: String,
    accountNumber: String,
    dropShipForUs: {},
    freightForDropShips: {},
    freightForOrders: {},
    leadTime: {},
    amountToOrder: Number
  },
  { strict: false }
);

//================================================================================
//================================================================================

var productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      uppercase: true,
      createdOn: { type: Date, default: Date.now }
    },
    desc: {
      type: String,
      trim: true
    },
    partNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    primaryVendor: String,
    luc: {
      type: Number,
      required: true
    },
    min: Number,
    max: Number,
    case: {
      type: Number,
      default: 1
    },
    location: {},
    length_in: Number,
    width_in: Number,
    height_in: Number,
    weight_oz: Number,
    available: Number,
    qtyToOrder: Number,
    onOrder: { type: Number, default: 0 },
    orderFromMinAmount: Number // (available < min ? qtyToOrder * luc : 0)
  },
  { strict: false }
);

var invoiceSchema = new mongoose.Schema({
  number: String,
  vendor: String,
  associatedPO: String,
  total_qty: Number,
  total_amount: Number,
  postingDate: Date,
  content: [
    {
      line_id: String,
      qty: Number,
      price_unit: Number,
      price_extended: Number
    }
  ]
});

var POSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      unique: true
    },
    vendor: String,
    total_qty: Number,
    total_outstanding_qty: Number,
    total_amount: Number,
    total_outstanding_amount: Number,
    dateCreated: Date,
    dateModified: Date,
    orderDate: Date,
    submitted: { type: Boolean, default: true },
    content: [
      {
        line_id: String,
        sku: String,
        part_number: String,
        desc: String,
        qty_ordered: Number,
        qty_outstanding: Number,
        qty_recd: Number,
        price_unit: Number,
        price_extended: Number
      }
    ]
  },
  { strict: false }
);

POSchema.pre("save", async function(next) {
  const new_doc = this;
  const original_doc = await this.constructor.findById(this.id, function(
    err,
    org
  ) {
    return org;
  });

  // Loop through every product object on the PO, remove the original.qty_ordered and add the new_doc.qty_ordered
  const promises = new_doc.content.map(async (row, index) => {
    const product = await mongoose
      .model("Product", productSchema)
      .findOne({ sku: row.sku }, (err, doc) => {
        return doc;
      });

    let previouslyOrdered = 0;
    if (original_doc !== null) {
      if (original_doc.content[index])
        previouslyOrdered = original_doc.content[index].qty_ordered;
    }

    let currentlyOnOrder = 0;
    if (product.onOrder) currentlyOnOrder = product.onOrder;
    product.onOrder = currentlyOnOrder - previouslyOrdered + row.qty_ordered;
    await product.save();
  });
  await Promise.all(promises);
  next();
});

module.exports.PO = mongoose.model("PO", POSchema);
module.exports.Invoice = mongoose.model("Invoice", invoiceSchema);
module.exports.Vendor = mongoose.model("Vendor", vendorSchema);
module.exports.Product = mongoose.model("Product", productSchema);
module.exports.Chapter = mongoose.model("Chapter", chapterSchema);
