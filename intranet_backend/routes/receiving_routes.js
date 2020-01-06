const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
var Vendor = require("../models/models").Vendor;
var Product = require("../models/models").Product;
var PO = require("../models/models").PO;
var Invoice = require("../models/models").Invoice;

//Connect to mongoDB
mongoose.connect("mongodb://localhost:27017/nahvac");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

// ======================================== CREATE ========================================

// Apply an invoice to a purchase order, also modifies the purchase order content
// Triggerd on creation or update
router.post("/po/:vendor/:poNumber/applyInvoice", async (req, res, next) => {
  const vendor = req.params.vendor;
  const poNumber = req.params.poNumber;
  const pathToRedirect = `/receiving/po/${vendor}/${poNumber}/viewEdit`;
  if (req.body.editingInvoice) {
    await deleteInvoice(vendor, req.body.number, poNumber);
  }
  delete req.body.editingInvoice;
  const newInvoice = new Invoice(req.body);
  newInvoice.dateCreated = Date.now();
  newInvoice.dateModified = Date.now();
  await newInvoice.save();

  // update quantities on associated PO
  const poObj = await PO.findOne(
    { vendor: vendor, number: poNumber },
    async (err, _po) => {
      if (err | !_po) {
        return err;
      } else {
        return _po;
      }
    }
  );

  const newPOContent = poObj.content.map(poRow => {
    newInvoice.content.forEach(invoiceRow => {
      if (invoiceRow.line_id === poRow.line_id) {
        poRow.qty_outstanding -= invoiceRow.qty;
        poRow.qty_recd += invoiceRow.qty;
      }
    });
    return poRow;
  });
  poObj.content = newPOContent;

  const new_total_outstanding_qty =
    poObj.total_outstanding_qty - newInvoice.total_qty;

  const new_total_outstanding_amount =
    Math.round(
      poObj.content.reduce((total, row) => {
        return total + row.qty_outstanding * row.price_unit;
      }, 0) * 100
    ) / 100;

  poObj.total_outstanding_amount = new_total_outstanding_amount;
  poObj.total_outstanding_qty = new_total_outstanding_qty;
  poObj.dateModified = Date.now();

  try {
    await poObj.save();
  } catch (e) {
    console.error(e);
  }

  res.status(201);
  res.send(pathToRedirect);
});

// Create new purchase order
router.post("/po", (req, res, next) => {
  const _number = req.body.number;
  const _vendor = req.body.vendor;
  // Validate that it is not a duplicate, if so return error and redirect back to PO page
  PO.find({ vendor: _vendor, number: _number }, (err, poObjArray) => {
    if (poObjArray.length > 0) {
      res.status(201);
      res.send({ success: false, message: "PO already exists." });
    } else {
      const newPO = new PO(req.body);
      newPO.total_qty = 0;
      newPO.total_outstanding_qty = 0;
      newPO.total_amount = 0;
      newPO.total_outstanding_amount = 0;
      newPO.content = [];
      newPO.dateCreated = Date.now();
      newPO.dateModified = Date.now();
      newPO.orderDate = Date.now();
      newPO.save(() => {
        res.status(201);
        res.send({ success: true, message: "PO successfully created." });
      });
    }
  });
});

router.post("/bulkCreate", async (req, res, next) => {
  const poObj = new PO(req.body);
  await poObj.save();
  res.status(201);
  res.send({ success: true });
});

// ======================================== READ ========================================

// Get a single purchase order
router.get("/po/:vendor/:poNumber", (req, res, next) => {
  const _vendor = req.params.vendor;
  const _poNumber = req.params.poNumber;
  PO.findOne({ vendor: _vendor, number: _poNumber }, (err, po) => {
    if (err | !po) {
      res.status(500);
      return res.send(err);
    }
    res.status(200);
    res.send(po);
  });
});

// Get all purchase orders
router.get("/pos", (req, res, next) => {
  PO.find({}, (err, POs) => {
    res.status(200);
    res.send(POs);
  });
});

// Get all invoices
router.get("/invoices", (req, res, next) => {
  Invoice.find({}, (err, invoices) => {
    res.status(200);
    res.send(invoices);
  });
});

// ======================================== UPDATE ========================================

// Update (or delete) purchase order, also updates all associated invoices
router.post("/po/:vendor/:poNumber", async (req, res, next) => {
  const oldVendor = req.params.vendor;
  const oldNumber = req.params.poNumber;

  if (req.body.delete) {
    await deletePO(oldVendor, oldNumber);
    res.status(201);
    return res.send(null);
  }

  const newVendor = req.body.vendor;
  const newNumber = req.body.number;
  const newContent = req.body.content.filter(row => row.sku !== "");

  const pathToRedirect = `/receiving/po/${newVendor}/${newNumber}/viewEdit`;
  const poObj = await PO.findOne(
    { vendor: oldVendor, number: oldNumber },
    async (err, _po) => {
      if (err | !_po) {
        return err;
      } else {
        return _po;
      }
    }
  );

  // Create array of all invoices associated with this PO
  const invoices = await Invoice.find(
    { vendor: oldVendor, associatedPO: oldNumber },
    async (err, invs) => {
      if (err) {
        return err;
      } else {
        return invs;
      }
    }
  );

  if (oldVendor !== newVendor) {
    poObj.vendor = newVendor;
    invoices.forEach(async invoice => {
      invoice.vendor = newVendor;
      invoice.dateModified = Date.now();
      await invoice.save();
    });
  }

  if (oldNumber !== newNumber) {
    poObj.number = newNumber;
    invoices.forEach(async invoice => {
      invoice.associatedPO = newNumber;
      invoice.dateModified = Date.now();
      await invoice.save();
    });
  }

  poObj.content = [...newContent];
  poObj.total_qty = req.body.total_qty;
  poObj.total_outstanding_qty = req.body.total_outstanding_qty;
  poObj.total_amount = req.body.total_amount;
  poObj.total_outstanding_amount = req.body.total_outstanding_amount;
  poObj.orderDate = req.body.orderDate;
  poObj.dateModified = Date.now();
  poObj.submitted = req.body.submitted;

  poObj.content.forEach((row, index) => {
    poObj.content[index].qty_recd = 0;
    poObj.content[index].qty_outstanding = poObj.content[index].qty_ordered;
  });

  if (invoices.length > 0) {
    // For every row of every invoice, adjust the received and outstanding quantity on the corresponding row of the Purchase Order row
    invoices.forEach(invoice => {
      invoice.content.forEach(row => {
        const lineNum = row.line_id;
        const rowQtyOnThisInvoice = row.qty;
        const i = poObj.content.findIndex(poRow => poRow.line_id === lineNum); // should only return 1 index
        poObj.content[i].qty_recd += rowQtyOnThisInvoice;
        poObj.content[i].qty_outstanding -= rowQtyOnThisInvoice;
      });
    });
  }

  try {
    await poObj.save();
  } catch (e) {
    console.error(e);
  }

  res.status(201);
  res.send(pathToRedirect);
});

// ======================================== DELETE ========================================
async function deletePos(pos) {
  var numDeleted = 0;
  for (po of pos) {
    const response = await PO.deleteOne({
      vendor: po.vendor,
      number: po.number
    });
    if (response.ok === 1) numDeleted++;
  }
  return numDeleted;
}

deletePO = async (vendor, number) => {
  // Delete invoices first
  await Invoice.deleteMany({ vendor: vendor, associatedPO: number });

  // Update "on order" for all products on the PO
  const poObj = await PO.findOne(
    { vendor: vendor, number: number },
    (a, b) => b
  );
  const promises = poObj.content.map(async row => {
    const prodObj = await Product.findOne({ sku: row.sku }, (a, b) => b);
    prodObj.onOrder -= row.qty_ordered;
    await prodObj.save();
  });

  await Promise.all(promises);
  await PO.deleteOne({
    vendor: vendor,
    number: number
  });
};

deleteInvoice = async (vendor, invoiceNumber, poNumber) => {
  const invoiceObj = await Invoice.findOne({
    vendor: vendor,
    number: invoiceNumber
  });
  const poObj = await PO.findOne({ vendor: vendor, number: poNumber });
  await Invoice.deleteOne({ vendor: vendor, number: invoiceNumber });
  // Recalculate totals
  const newPOContent = poObj.content.map(poRow => {
    invoiceObj.content.forEach(invoiceRow => {
      if (invoiceRow.line_id === poRow.line_id) {
        poRow.qty_outstanding += invoiceRow.qty;
        poRow.qty_recd -= invoiceRow.qty;
      }
    });
    return poRow;
  });
  poObj.content = newPOContent;
  const new_total_outstanding_qty =
    poObj.total_outstanding_qty + invoiceObj.total_qty;

  const new_total_outstanding_amount =
    Math.round(
      poObj.content.reduce((total, row) => {
        return total + row.qty_outstanding * row.price_unit;
      }, 0) * 100
    ) / 100;

  poObj.total_outstanding_amount = new_total_outstanding_amount;
  poObj.total_outstanding_qty = new_total_outstanding_qty;
  try {
    await poObj.save();
  } catch (e) {
    console.error(e);
  }
  return;
};

// Delete single invoice
router.post("/invoice/delete", async (req, res, next) => {
  const vendor = req.body.vendor;
  const number = req.body.number;
  const poNumber = req.body.associatedPO;
  await deleteInvoice(vendor, number, poNumber);
  res.status(201);
  res.send(null);
});

// Delete multiple purchase orders
router.post("/pos/delete", async (req, res, next) => {
  const pos = req.body;

  const numDeleted = await deletePos(pos);
  if (numDeleted > 0) {
    res.status(301);
    res.send(null);
  } else {
    res.status(500);
    res.send(0);
  }
});

module.exports = router;
