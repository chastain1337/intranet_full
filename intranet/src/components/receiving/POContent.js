import React from "react";
import POContentTableHeader from "./POContentTableHeader";
import { Card, Form, Col, Button, Table, Alert } from "react-bootstrap";
import ContentEditable from "react-contenteditable";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import PastePOContentModal from "./PastePOContentModal";
import moment from "moment";
import * as Datetime from "react-datetime";
require("./react-datetime.css");

// Inputs:
//             - PO Number,
//             - Vendor

//         Columns:
//         [
//             SKU,                - validate against products db, uneditable if qty_recd > 0
//             partnumber,         - auto populate unless otherwise specified
//             desc,               - auto populate unless otherwise specified
//             qty ordered,        - integer, *cannot edit below qty rec'd*
//             Outstanding qty     - calculated, if edited, up qty ordered to match
//             Qty Rec'd           - DISABLED unless you are in "received", still show value
//             price,              - $
//             extended price      - price * qty ordered, if edited adjust price to match
//         ]

//         Values to calculate at bottom:
//             - Total qty
//             - Total outstanding qty
//             - $ of PO
//             - Outstanding $ of PO

//         Buttons: *what do these do?
//             - Save
//             - Save and Add New
//             - Save and Receive
//             - Delete Purchase Order and All Related Invoices

export default class POContent extends React.Component {
  constructor(props) {
    super(props);
    this.skus = this.props.products.map(product => product.sku);
    this.state = {
      poNumber: this.props.po.number,
      poVendor: this.props.po.vendor,
      invalidCells: [],
      data: this.props.po.content,
      currentFocusValue: null,
      poChanged: false,
      showMessage: false,
      message: null,
      statistics: {
        po_totalAmt: 0,
        po_totalAmtRec: 0,
        po_totalAmtOut: 0,
        po_totalQty: 0,
        po_totalQtyRec: 0,
        po_totalQtyOut: 0
      },
      helpBarText: "",
      showPasteContentModal: false,
      orderDate: moment(this.props.po.orderDate).format("M/D/YY")
    };
    this.headers = [
      //[display,propname,disabled,type]
      ["SKU", "sku", false, "text"],
      ["Q.Ord", "qty_ordered", false, "int"],
      ["Part Number", "part_number", false, "text"],
      ["Description", "desc", false, "text"],
      ["Q.Out", "qty_outstanding", true, ""],
      ["Q.Rec", "qty_recd", true, ""],
      ["Unit Price", "price_unit", false, "num"],
      ["Total Price", "price_extended", false, "num"]
    ];
  }
  addAbove = rowIndex => {
    var emptyDataObject = {};
    this.headers.forEach(header => {
      emptyDataObject[header[1]] = "";
    });
    const newData = [...this.state.data];
    newData.splice(rowIndex, 0, emptyDataObject);
    this.setState({ data: newData });
  };

  deleteRow = rowIndex => {
    const newData = [...this.state.data];
    newData.splice(rowIndex, 1);
    this.setState({ data: newData });
  };

  hideMessage = () => {
    this.setState({ showMessage: false, message: null });
  };

  updateStatistics = () => {
    const newStatistics = this.props.calculatePOStatistics(this.state.data);
    this.setState({ statistics: newStatistics });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!this.lastRowIsBlank()) {
      var emptyDataObject = {};
      this.headers.forEach(header => {
        emptyDataObject[header[1]] = "";
      });
      const newData = [...this.state.data, emptyDataObject];
      this.setState({ data: newData });
    }

    if (JSON.stringify(this.state.data) !== JSON.stringify(prevState.data)) {
      this.updateStatistics();
    }
  };

  lastRowIsBlank = () => {
    if (this.state.data.length === 0) return false;

    const lastRowObj = this.state.data[this.state.data.length - 1];
    const lastRowObjValues = Object.values(lastRowObj);
    return lastRowObjValues.every(prop => {
      return prop === "" || prop === null || prop === "<br>";
    });
  };

  fillRows = () => {
    if (this.lastRowIsBlank()) return;

    var emptyDataObject = {};
    this.headers.forEach(header => {
      emptyDataObject[header[1]] = "";
    });

    var arrayOfEmptyObjects = []; // will be trimmed off before uploading to server
    for (var i = 0; i <= this.state.data.length - this.state.data.length; i++) {
      arrayOfEmptyObjects.push(emptyDataObject);
    }

    const newData = this.state.data.concat(arrayOfEmptyObjects);
    return this.setState({ data: newData });
  };

  componentDidMount = () => {
    this.fillRows();
    //this.validateAllCells();
    //this.updateStatistics();
    this.props.updatePOChangeState(false);
  };

  validateAllCells = async () => {
    for (var i = 0; i < this.state.data.length - 1; i++) {
      for (var h = 0; h < this.headers.length; h++) {
        await this.validateAllOtherFieldsAgainstRecentChange(
          i,
          this.headers[h][1],
          this.state.data[i][this.headers[h][1]],
          "auto"
        );
      }
    }
  };

  skuIsValid = sku => {
    if (this.skus === null || !this.skus.includes(sku)) {
      return false;
    } else {
      return true;
    }
  };

  handlePoNumberChange = e => {
    this.setState({ poNumber: e.target.value.toUpperCase() });
  };

  validatePoNumber = () => {
    const oldNumValid = !this.state.invalidCells.includes("po");
    const shortenedNo = this.state.poNumber.replace(
      /([^0-9a-zA-Z_\.\-])+/g,
      ""
    );
    const newNumValid = !(
      shortenedNo.length !== this.state.poNumber.length ||
      this.state.poNumber.trim().length < 5
    );

    switch (newNumValid) {
      case true:
        switch (oldNumValid) {
          case true: //new: good, old: good -- do nothing
            break;
          case false: //new: good, old: bad -- validate field bc it was invalid
            this.setState(prevState => {
              const newInvalidCells = prevState.invalidCells.filter(
                cellID => cellID !== "po"
              );
              return { invalidCells: newInvalidCells };
            });
            break;
        }
        break;
      case false:
        switch (oldNumValid) {
          case true: //new: bad, old: good -- invalidate field bc it was valid
            this.setState(prevState => {
              const newInvalidCells = [...prevState.invalidCells, "po"];
              return { invalidCells: newInvalidCells };
            });
            break;
          case false:
            break; //new: bad, old: bad -- do nothing
        }
    }
  };

  handleVendorChange = e => {
    this.setState({ poVendor: e.target.value.toUpperCase() });
  };

  validateVendor = () => {
    const prevVendorValid = !this.state.invalidCells.includes("vendor");
    const newVendorValid = this.props.vendorCodes.includes(this.state.poVendor);

    switch (newVendorValid) {
      case true:
        switch (prevVendorValid) {
          case true: //new: good, old: good -- do nothing
            break;
          case false: //new: good, old: bad -- validate field bc it was invalid
            this.setState(prevState => {
              // remove vendor from the invalid cells array
              const newInvalidCells = prevState.invalidCells.filter(
                cellID => cellID !== "vendor"
              );
              return { invalidCells: newInvalidCells };
            });
            break;
        }
        break;
      case false:
        switch (prevVendorValid) {
          case true: //new: bad, old: good -- invalidate field bc it was valid
            this.setState(prevState => {
              const newInvalidCells = [...prevState.invalidCells, "vendor"];
              return { invalidCells: newInvalidCells };
            });
            break;

          case false:
            break; //new: bad, old: bad -- do nothing
        }
    }
  };

  deletePO = () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this Purchase Order? This cannot be undone."
    );

    if (confirmation !== true) {
      return;
    }

    const poNumber = this.props.po.number;
    const vendorCode = this.props.po.vendor;

    axios
      .post(
        "http://localhost:4000/receiving/po/" + vendorCode + "/" + poNumber,
        {
          delete: true
        }
      )
      .then(res => {
        if (res.status === 201) {
          window.location = "/receiving/viewPOs";
        }
      });
  };

  handleContentEditable = e => {
    const val = e.target.value.toUpperCase();
    const rowNum = parseInt(e.currentTarget.dataset.row);
    const prop = e.currentTarget.dataset.prop;
    let newVal = null;
    switch (e.currentTarget.attributes.contenttype.value) {
      case "text":
        newVal =
          val.charAt(val.length - 5) !== " " ? val.replace(/<BR>/g, "") : val;
        break;
      case "num":
        newVal = val.replace(/[^0-9\.]+/g, "");
        break;
      case "int":
        newVal = val.replace(/[^0-9]+/g, "");
        break;
    }

    const updatedRowObject = { ...this.state.data[rowNum] };
    updatedRowObject[prop] = newVal;

    const newData = this.state.data.map((row, index) => {
      if (index === rowNum) return updatedRowObject;
      return row;
    });
    this.setState({ data: newData });
  };

  pasteAsPlainText = e => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertHTML", false, text);
  };

  handleFocus = e => {
    this.setState({ currentFocusValue: e.target.textContent }, () => {
      setTimeout(() => {
        document.execCommand("selectAll", false, null);
      }, 0);
    });
    if (this.state.data[e.target.attributes["data-row"].value].qty_recd > 0) {
      this.setState({
        showMessage: true,
        message:
          'Changing a SKU with a "received" quantity will update all invoices to the new SKU.'
      });
    }
  };

  disableNewlines = e => {
    const keyCode = e.keyCode || e.which;

    if (keyCode === 13 || keyCode === 40) {
      e.returnValue = false;
      if (e.preventDefault) e.preventDefault();
      const dataRow = parseInt(e.target.attributes["data-row"].value) + 1;
      const dataProp = e.target.attributes["data-prop"].value;
      const nextRowSameProp = document.querySelector(
        `[data-row="${dataRow}"][data-prop="${dataProp}"]`
      );
      if (nextRowSameProp) {
        setTimeout(function() {
          nextRowSameProp.focus();
        }, 0);
      }
    } else if (keyCode === 38) {
      if (e.preventDefault) e.preventDefault();
      const dataRow = parseInt(e.target.attributes["data-row"].value) - 1;
      const dataProp = e.target.attributes["data-prop"].value;
      const prevRowSameProp = document.querySelector(
        `[data-row="${dataRow}"][data-prop="${dataProp}"]`
      );
      if (prevRowSameProp) {
        setTimeout(function() {
          prevRowSameProp.focus();
        }, 0);
      }
    }
  };

  toggleInvalidCell = (row, prop, cellShouldNowBeValid) => {
    // Removes if row-col combo is in valid cells, or adds if it is not
    const cellUsedToBeValid = !this.state.invalidCells.includes(
      row + "-" + prop
    );

    var newInvalidCells;

    if (cellUsedToBeValid && !cellShouldNowBeValid) {
      // going from valid -> invalid
      // Add to invalid list
      newInvalidCells = [...this.state.invalidCells, `${row}-${prop}`];
    } else if (!cellUsedToBeValid && cellShouldNowBeValid) {
      // going from invalid -> valid
      newInvalidCells = this.state.invalidCells.filter(
        cell => cell !== `${row}-${prop}`
      );
    } else {
      return;
    }
    this.setState({ invalidCells: newInvalidCells });
  };

  handleCellChange = e => {
    const row = parseInt(e.currentTarget.dataset.row);
    const prop = e.currentTarget.dataset.prop;
    const newVal = this.state.data[row][prop];
    if (newVal !== this.state.currentFocusValue) {
      this.validateAllOtherFieldsAgainstRecentChange(
        row,
        prop,
        newVal,
        "manual"
      );
    }
  };

  validateAllOtherFieldsAgainstRecentChange = async (
    row,
    prop,
    newVal,
    validator
  ) => {
    // triggered onBlur of po content change

    const updateValues = async arrayOfRowPropValueArrays => {
      // [[row1,prop1,value1],[row2,prop2,val2]]

      var newData = [...this.state.data];

      arrayOfRowPropValueArrays.forEach(newValueSet => {
        const row = newValueSet[0];
        const prop = newValueSet[1];
        const newVal = newValueSet[2];
        //console.log(`updating row ${row} of ${prop} to ${newVal}`);
        const updatedRowObject = { ...newData[row] };
        updatedRowObject[prop] = newVal;
        newData = newData.map((_row, index) => {
          if (index === row) return updatedRowObject;
          return _row;
        });
      });
      this.setState({ data: newData }, () => {
        return true;
      });
    };

    if (this.state.poChanged === false && validator === "manual") {
      this.setState({ poChanged: true }, this.props.updatePOChangeState(true));
    }

    switch (prop) {
      case "sku":
        // Check if new sku is just blank
        if (newVal === "" || newVal === null || newVal === "<br>") {
          updateValues([
            [row, "part_number", ""],
            [row, "desc", ""],
            [row, "price_unit", 0],
            [row, "price_extended", 0]
          ]);
          break;
        }

        // Validate sku
        if (!this.skuIsValid(newVal)) {
          return this.toggleInvalidCell(row, prop, false); // invalidate cell
        }
        // If valid

        this.toggleInvalidCell(row, prop, true);

        if (validator === "manual") {
          // Look up part number, des, and unit cost
          const thisProduct = this.props.products.find(
            product => product.sku === newVal
          );
          return updateValues([
            [row, "part_number", thisProduct.partNumber],
            [row, "desc", thisProduct.desc],
            [row, "price_unit", Number(thisProduct.luc)],
            [
              row,
              "price_extended",
              Math.round(
                Number(thisProduct.luc) *
                  Number(this.state.data[row]["qty_ordered"]) *
                  100
              ) / 100
            ]
          ]);
        }

        break;
      case "qty_ordered":
        const qtyRecd = this.state.data[row]["qty_recd"];
        const unitPrice = this.state.data[row]["price_unit"];
        if (newVal < qtyRecd) {
          newVal = qtyRecd;
        }
        updateValues([
          [row, prop, newVal],
          [row, "qty_outstanding", newVal - qtyRecd],
          [row, "price_extended", Math.round(unitPrice * newVal * 100) / 100]
        ]);
        break;

      case "price_unit":
        if (isNaN(newVal)) {
          return updateValues([
            [row, prop, 0],
            [row, "price_extended", 0]
          ]);
        } else {
          const roundedUnitPrice = Math.round(newVal * 100000) / 100000;
          const qtyOrdered = this.state.data[row]["qty_ordered"];
          const extPrice = this.state.data[row]["price_extended"];

          // Update unit price to round it, and ext price to be unit*qty, if it is not already correct

          if (
            extPrice ===
            Math.round(roundedUnitPrice * qtyOrdered * 100) / 100
          ) {
            return; //console.log("extPrice on row " + row + " is ok");
          } else {
            return updateValues([
              [row, prop, roundedUnitPrice],
              [
                row,
                "price_extended",
                Math.round(roundedUnitPrice * qtyOrdered * 100) / 100
              ]
            ]);
          }
        }
        // Updated price_extended
        break;

      case "price_extended":
        if (isNaN(newVal)) {
          return updateValues([
            [row, prop, 0],
            [row, "price_unit", 0]
          ]);
        } else {
          const roundedExtPrice = Math.round(newVal * 100) / 100;
          const qtyOrdered = this.state.data[row]["qty_ordered"];
          const unitPrice = this.state.data[row]["price_unit"];

          if (
            unitPrice ===
            Math.round((roundedExtPrice / qtyOrdered) * 100000) / 100000
          ) {
            return; //console.log("Unit price on row " + row + " is ok.");
          } else {
            return updateValues([
              [row, prop, roundedExtPrice],
              [
                row,
                "price_unit",
                Math.round((roundedExtPrice / qtyOrdered) * 100000) / 100000
              ]
            ]);
          }
        }

      case "qty_ordered":
        return updateValues([
          [
            row,
            "price_extended",
            Math.round(newVal * this.state.data[row]["price_unit"] * 100) / 100
          ]
        ]);

      default:
        break;
    }
  };

  pasteContents = () => {
    this.setState({ showPasteContentModal: true });
  };

  updateRowsWithPastedValues = rowObjects => {
    console.log(rowObjects);
    var emptyDataObject = {};
    this.headers.forEach(header => {
      emptyDataObject[header[1]] = "";
    });
    const dataCopy = [...this.state.data];
    dataCopy.splice(dataCopy.length - 1, 1);
    const newData = [...dataCopy, ...rowObjects, emptyDataObject];
    this.setState({
      data: newData,
      showPasteContentModal: false
    });
  };
  clearHelperText = () => {
    this.setState({ helpBarText: "" });
  };

  handleDateChange = date => {
    if (date._isAMomentObject) {
      return this.setState({ orderDate: date });
    }
  };

  render() {
    return (
      <>
        <PastePOContentModal
          show={this.state.showPasteContentModal}
          onHide={() => {
            this.setState({ showPasteContentModal: false });
          }}
          headers={this.headers}
          products={this.props.products}
          updateRowsWithPastedValues={this.updateRowsWithPastedValues}
        />
        <Card.Body>
          <Alert
            className="text-center"
            variant="secondary"
            style={{ height: "18pt", padding: "0px", color: "#666666" }}>
            {this.state.helpBarText}
          </Alert>
          <Form>
            <Form.Row>
              <Col xs={3}>
                <Form.Control
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText:
                        "Changing a the PO Number will update all invoices to be associated with the new number."
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                  value={this.state.poNumber}
                  onChange={this.handlePoNumberChange}
                  onBlur={this.validatePoNumber}
                />
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={moment(this.props.po.dateCreated).format(
                    "M/D/YY h:mma"
                  )}
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText: "Date created"
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                />
                <Button
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText: this.props.po.submitted
                        ? "Save the purchase order. Disabled if there are invalid cells. Clicking will refresh the page."
                        : 'Save the changes to this Purchase Order and mark it as "SUBMITTED"'
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                  size="sm"
                  variant="success"
                  className="mx-1 my-1"
                  disabled={this.state.invalidCells.length > 0}
                  onClick={() =>
                    this.props.savePO(
                      this.state.data,
                      this.state.poNumber,
                      this.state.poVendor,
                      this.state.statistics,
                      this.state.orderDate,
                      true
                    )
                  }>
                  {this.props.po.submitted ? "SAVE" : "SUBMIT"}
                </Button>
                {this.props.po.submitted ? null : (
                  <Button
                    onMouseEnter={() =>
                      this.setState({
                        helpBarText:
                          "Save any changes made to the Purchase Order without marking it as submitted."
                      })
                    }
                    onMouseLeave={this.clearHelperText}
                    size="sm"
                    variant="success"
                    className="mx-1 my-1"
                    disabled={this.state.invalidCells.length > 0}
                    onClick={() =>
                      this.props.savePO(
                        this.state.data,
                        this.state.poNumber,
                        this.state.poVendor,
                        this.state.statistics,
                        this.state.orderDate,
                        false
                      )
                    }>
                    SAVE
                  </Button>
                )}
                <Button
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText:
                        "Bulk paste the PO contents. More instructions can be found by clicking this button."
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                  size="sm"
                  className="mr-1 my-1"
                  onClick={this.pasteContents}>
                  PASTE
                </Button>
                <Button
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText:
                        "Delete the PO. This action cannot be undone."
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                  size="sm"
                  variant="danger"
                  onClick={this.deletePO}
                  className="my-1">
                  DELETE
                </Button>
              </Col>
              <Col xs={2}>
                <Form.Control
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText:
                        "Changing a the Purchase Order Vendor will update all invoices to be associated with the new Vendor."
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                  value={this.state.poVendor}
                  onChange={this.handleVendorChange}
                  onBlur={this.validateVendor}
                />
                <Form.Control
                  plaintext
                  readOnly
                  defaultValue={moment(this.props.po.dateModified).format(
                    "M/D/YY h:mma"
                  )}
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText: "Date modified"
                    })
                  }
                  onMouseLeave={this.clearHelperText}
                />
              </Col>
              <Col xs={2}>
                <div
                  onMouseEnter={() =>
                    this.setState({
                      helpBarText:
                        "Order Date. Used to calculate ETA's and ordering."
                    })
                  }
                  onMouseLeave={this.clearHelperText}>
                  <Datetime
                    onChange={this.handleDateChange}
                    value={moment(this.state.orderDate).format("M/D/YY")}
                    closeOnSelect={true}
                    inputProps={{
                      value: moment(this.state.orderDate).format("M/D/YY")
                    }}
                    timeFormat={false}
                  />
                </div>
              </Col>
              <Col>
                <Table size="sm" hover borderless className="text-right">
                  <tbody style={{ fontSize: "12pt" }}>
                    <tr
                      onMouseEnter={() =>
                        this.setState({
                          helpBarText:
                            "Total dollar amount and quantity for this purchase order"
                        })
                      }
                      onMouseLeave={this.clearHelperText}>
                      <td>Total $</td>
                      <td className="mr-1">
                        {this.state.statistics.po_totalAmt}
                      </td>
                      <td></td>
                      <td></td>
                      <td className="border-left">Total Qty</td>
                      <td>{this.state.statistics.po_totalQty}</td>
                    </tr>
                    <tr
                      onMouseEnter={() =>
                        this.setState({
                          helpBarText:
                            "Amount received reflects pricing on the invoice and may not necessarily match the Purchase Order cost."
                        })
                      }
                      onMouseLeave={this.clearHelperText}>
                      <td>Total $ Rec</td>
                      <td className="mr-1">
                        {this.state.statistics.po_totalAmtRec}
                      </td>
                      <td></td>
                      <td></td>
                      <td className="border-left">Total Rec</td>
                      <td>{this.state.statistics.po_totalQtyRec}</td>
                    </tr>
                    <tr
                      onMouseEnter={() =>
                        this.setState({
                          helpBarText:
                            "Total $ amount = the sum of each row's outstanding quantity * the unit price specified here."
                        })
                      }
                      onMouseLeave={this.clearHelperText}>
                      <td>Total $ Out</td>
                      <td className="mr-1">
                        {isNaN(this.state.statistics.po_totalAmtOut)
                          ? ""
                          : this.state.statistics.po_totalAmtOut}
                      </td>
                      <td></td>
                      <td></td>
                      <td className="border-left">Total Out.</td>
                      <td>{this.state.statistics.po_totalQtyOut}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Form.Row>
            <Form.Row></Form.Row>
          </Form>
        </Card.Body>
        <Table size="sm" bordered hover>
          <POContentTableHeader headers={this.headers} />
          <tbody>
            {this.state.data.map((row, rowIndex) => {
              return (
                <tr key={rowIndex.toString() + "row"}>
                  {this.headers.map((header, colIndex) => {
                    return (
                      <td
                        key={`${header[1]}-${rowIndex}`}
                        style={
                          this.state.invalidCells.includes(
                            `${rowIndex}-${header[1]}`
                          )
                            ? {
                                backgroundColor: "RGB(255,199,206)",
                                color: "RGB(156,0,6)"
                              }
                            : !header[3]
                            ? { backgroundColor: "lightgray" }
                            : null
                        }>
                        <ContentEditable
                          style={{ height: "24px" }}
                          html={
                            row[header[1]] !== undefined &&
                            row[header[1]] !== null
                              ? row[header[1]].toString()
                              : ""
                          }
                          data-prop={header[1]}
                          data-row={rowIndex}
                          className="content-editable"
                          onChange={this.handleContentEditable}
                          onPaste={this.pasteAsPlainText}
                          onFocus={this.handleFocus}
                          onKeyPress={this.disableNewlines}
                          onBlur={this.handleCellChange}
                          disabled={header[2]}
                          contenttype={header[3]}
                        />
                      </td>
                    );
                  })}
                  <td className="text-center">
                    <FontAwesomeIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        this.addAbove(rowIndex);
                      }}
                      icon={faPlusCircle}
                    />
                  </td>
                  <td className="text-center">
                    {this.state.data[rowIndex].qty_recd === 0 ? (
                      <FontAwesomeIcon
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.deleteRow(rowIndex);
                        }}
                        icon={faTimesCircle}
                      />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
  }
}

// <HotTable
//   afterChange={this.updateBasedOnChanges}
//   afterSelection={this.logSelectedCellMeta}
//   licenseKey={"non-commercial-and-evaluation"}
//   data={this.state.data}
//   ref={this.hotTableComponent}
//   dataSchema={{
//     sku: null,
//     qty_ordered: null,
//     part_number: null,
//     desc: null,
//     qty_outstanding: null,
//     qty_recd: null,
//     price_unit: null,
//     price_extended: null
//   }}
//   colHeaders={[
//     "SKU",
//     "Q.Ord",
//     "Part Number",
//     "Description",
//     "Q.Out",
//     "Q.Rec",
//     "Unit Price",
//     "Total Price"
//   ]}
//   columns={[
//     {
//       data: "sku",
//       validator: this.skuValidator
//     },
//     { data: "qty_ordered", type: "numeric" },
//     { data: "part_number" },
//     { data: "desc" },
//     { data: "qty_outstanding", editor: false },
//     { data: "qty_recd", editor: false },
//     {
//       data: "price_unit",
//       type: "numeric",
//       numericFormat: { pattern: "$0,0.00" }
//     },
//     {
//       data: "price_extended",
//       type: "numeric",
//       numericFormat: { pattern: "$0,0.00" }
//     }
//   ]}
//   manualColumnResize={true}
//   minSpareRows={200 - this.state.data.length}
// />;

// onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
//   //fromrow = first row changed
//   //fromrow = last row changed
//   //updated = new row value

//   // Validate the change for no disallowed characters
//   const updatedValues = Object.values(updated);
//   const updatedKeys = Object.keys(updated);
//   const invalidUpdatedValues = updatedValues.filter(
//     value => value.length !== value.replace(/[{}<>;]/g, "").length
//   );
//   if (invalidUpdatedValues.length > 0) {
//     return console.log("Characters not allowed");
//     // show real error message
//   }

//   let rows = this.state.rows.slice();
//   const prop = Object.entries(updated)[0][0];
//   const val = Object.entries(updated)[0][1];

//   switch (prop) {
//     case "sku":
//       console.log("Updated SKU");

//       //  -validate that change is allowed (qty rec'd === 0)

//       //  -autofill: part_number, desc, price_unit, price_extended

//       // else turn the cell red and disable save button
//       break;

//     case "qty_ordered":
//       console.log("Updated qty ordered");
//       // -validate not less than qty recd
//       //   -update outstanding qty automatically
//       //   -update extended price automatically
//       break;

//     case "price_unit":
//       console.log("Updated unit cost");
//       // -validate valid price
//       // -update extended price as newprice * qty ordered
//       break;

//     case "price_extended":
//       console.log("Updated extended cost");
//       // -validate valid price
//       //   -update unit price as newprice / qty ordered
//       break;
//   }

//   /*
//     The row contents have changed

//     */

//   this.setState(state => {
//     const rows = state.rows.slice();
//     for (let i = fromRow; i <= toRow; i++) {
//       rows[i] = { ...rows[i], ...updated };
//     }
//     return { rows };
//   });
// };

// fillOutRows = () => {
//   const newRowsObject = [...this.state.rows];
//   const numRowsLeftToRender =
//     this.state.numRowsToLoadFinal - newRowsObject.length;
//   if (numRowsLeftToRender > 0) {
//     // Then load all the additional rows as blanks
//     for (
//       var i = newRowsObject.length + 1;
//       i <= this.state.numRowsToLoadFinal;
//       i++
//     ) {
//       newRowsObject.push({});
//     }
//   }
//   this.setState({ rows: newRowsObject });
// };
