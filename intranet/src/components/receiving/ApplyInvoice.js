import React from "react";
import { Table, Card, Form, Col, Button } from "react-bootstrap";
import ContentEditable from "react-contenteditable";
import qs from "query-string";
import ErrorMessage from "./ErrorMessage";
import moment from "moment";
import * as Datetime from "react-datetime";
require("./react-datetime.css");

export default class ApplyInvoice extends React.Component {
  state = {
    data: JSON.parse(JSON.stringify(this.props.po.content)),
    invoiceNumber: "",
    statistics: {
      po_totalAmtRec: 0,
      po_totalAmtOut: 0,
      po_totalQtyRec: 0,
      po_totalQtyOut: 0
    },
    postingDate: moment()
  };

  headers = [
    //[display,propname,disabled,type]
    ["SKU", "sku", true, "text"],
    ["Q.Ord", "qty_ordered", true, "int"],
    ["Part Number", "part_number", true, "text"],
    ["Description", "desc", true, "text"],
    ["Q.Out", "qty_outstanding", true, ""],
    ["Q.Rec", "qty_recd", true, ""],
    ["Q.To Rec", "qty_to_rec", false, "int"],
    ["Unit Price", "price_unit", false, "num"],
    ["Cost Rec'g", "price_receiving", false, "num"]
  ];

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

  componentDidUpdate = (prevProps, prevState) => {
    if (JSON.stringify(this.state.data) !== JSON.stringify(prevState.data)) {
      this.calculateStatistics();
    }
  };

  calculateStatistics = () => {
    const po_totalAmtRecNew =
      Math.round(
        this.state.data.reduce((total, row) => {
          return total + Number(row.price_receiving);
        }, 0) * 100
      ) / 100;

    const po_totalQtyRecNew = this.state.data.reduce((total, row) => {
      return total + Number(row.qty_to_rec);
    }, 0);

    const newStatistics = {
      po_TotalAmt: this.state.statistics.po_TotalAmt,

      po_TotalQty: this.state.statistics.po_TotalQty,

      po_totalAmtRec: po_totalAmtRecNew,

      po_totalAmtOut:
        Math.round(
          (this.state.statistics.po_TotalAmt - po_totalAmtRecNew) * 100
        ) / 100,

      po_totalQtyRec: po_totalQtyRecNew,

      po_totalQtyOut: this.state.statistics.po_TotalQty - po_totalQtyRecNew
    };
    this.setState({
      statistics: newStatistics
    });
  };

  componentDidMount = () => {
    let newData = null;
    let newInvNumber = "";
    let postingDate = moment();
    let editingInvoice = false;
    const invoiceToEdit = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true
    }).invoice;

    const invoiceObj = this.props.invoices.find(
      invoice =>
        invoice.vendor === this.props.po.vendor &&
        invoice.number === invoiceToEdit
    );
    if (invoiceToEdit && invoiceObj) {
      editingInvoice = true;
      postingDate = invoiceObj.postingDate;
      newData = this.state.data.map(PORow => {
        invoiceObj.content.forEach(invoiceRow => {
          if (invoiceRow.line_id === PORow.line_id) {
            PORow.qty_outstanding += invoiceRow.qty;
            PORow.qty_recd -= invoiceRow.qty;
            PORow.qty_to_rec = invoiceRow.qty;
            PORow.price_unit = invoiceRow.price_unit;
            PORow.price_receiving = invoiceRow.price_extended;
          } else {
            PORow.qty_to_rec = 0;
            PORow.price_receiving = 0;
          }
        });
        return PORow;
      });
      newInvNumber = invoiceObj.number;
    } else {
      newData = this.state.data.map(row => {
        row.qty_to_rec = 0;
        row.price_receiving = 0;
        return row;
      });
    }

    const poTotalAmt =
      Math.round(
        newData.reduce((total, row) => {
          return total + Number(row.price_extended);
        }, 0) * 100
      ) / 100;

    const poTotalQty = newData.reduce((total, row) => {
      return total + Number(row.qty_ordered);
    }, 0);

    this.setState(
      {
        data: newData,
        statistics: {
          ...this.state.statistics,
          po_TotalAmt: poTotalAmt,
          po_TotalQty: poTotalQty
        },
        invoiceNumber: newInvNumber,
        editingInvoice: editingInvoice,
        postingDate: postingDate
      },
      () => {
        this.calculateStatistics();
      }
    );
  };

  validateAllOtherFieldsAgainstRecentChange = async (
    row,
    prop,
    newVal,
    validator
  ) => {
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
      this.setState({ poChanged: true }, this.props.updatePOChangeState());
    }

    const qtyReceiving = this.state.data[row]["qty_to_rec"];
    const unitPrice = this.state.data[row]["price_unit"];
    switch (prop) {
      case "qty_to_rec":
        let newQtyToRec = newVal;
        if (isNaN(newVal)) {
          newQtyToRec = 0;
        } else if (newVal > this.state.data[row].qty_outstanding) {
          newQtyToRec = this.state.data[row].qty_outstanding;
        }

        return updateValues([
          [row, "qty_to_rec", newQtyToRec],
          [
            row,
            "price_receiving",
            Math.round(unitPrice * newQtyToRec * 100) / 100
          ]
        ]);

      case "price_unit":
        const roundedUnitPrice = Math.round(newVal * 100000) / 100000;
        const extPrice = this.state.data[row]["price_receiving"];

        if (
          extPrice ===
          Math.round(roundedUnitPrice * qtyReceiving * 100) / 100
        ) {
          return; //console.log("extPrice on row " + row + " is ok");
        } else {
          return updateValues([
            [row, prop, roundedUnitPrice],
            [
              row,
              "price_receiving",
              Math.round(roundedUnitPrice * qtyReceiving * 100) / 100
            ]
          ]);
        }

      case "price_receiving":
        const roundedExtPrice = Math.round(newVal * 100) / 100;

        if (
          unitPrice ===
          Math.round((roundedExtPrice / qtyReceiving) * 100000) / 100000
        ) {
          return; //console.log("Unit price on row " + row + " is ok.");
        } else {
          return updateValues([
            [row, prop, roundedExtPrice],
            [
              row,
              "price_unit",
              Math.round((roundedExtPrice / qtyReceiving) * 100000) / 100000
            ]
          ]);
        }

      default:
        break;
    }
  };

  handleContentEditable = e => {
    const val = e.target.value;
    const rowNum = parseInt(e.currentTarget.dataset.row);
    const prop = e.currentTarget.dataset.prop;
    let newVal = null;
    switch (e.currentTarget.attributes.contenttype.value) {
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
  validateInvoiceNumberChange = () => {
    if (
      this.props.invoices.some(
        invoice => invoice.number === this.state.invoiceNumber
      )
    ) {
      this.setState({
        errorMessage: "This invoice already exists for this vendor.",
        showErrorMessage: true
      });
    }
  };
  handleInvoiceNumberChange = e => {
    const newInvNumber = e.target.value
      .replace(/([^0-9a-zA-Z_\.\-])+/g, "")
      .toString();
    this.setState({ invoiceNumber: newInvNumber });
  };

  handleDateChange = date => {
    if (date._isAMomentObject) {
      return this.setState({ postingDate: date });
    }
  };

  render() {
    const ths = this.headers.map(header => (
      <th key={`header-${header[0]}`}>{header[0]}</th>
    ));

    return (
      <>
        {this.state.showErrorMessage ? (
          <ErrorMessage message={this.state.errorMessage} />
        ) : null}
        <Card.Body>
          <Form>
            <Form.Row>
              <Col xs={3}>
                <Form.Label>PO Number</Form.Label>
                <Form.Control disabled value={this.props.po.number} />
                <Form.Label className="my-1">Options:</Form.Label>
                <Button
                  size="sm"
                  variant="success"
                  className="mx-2 my-1"
                  onClick={() => {
                    this.props.saveInvoice(
                      this.state.data,
                      this.state.invoiceNumber,
                      this.state.statistics,
                      this.state.editingInvoice,
                      this.state.postingDate
                    );
                  }}
                  disabled={
                    this.state.invoiceNumber.length < 3 ||
                    this.state.po_totalQtyRec === 0
                  }>
                  SAVE
                </Button>
                <Button size="sm" variant="danger" disabled className="my-1">
                  DELETE
                </Button>
              </Col>
              <Col xs={2}>
                <Form.Label>Vendor Code</Form.Label>
                <Form.Control value={this.props.po.vendor} disabled />
                Posting Date
                <Datetime
                  onChange={this.handleDateChange}
                  value={moment(this.state.postingDate).format("M/D/YY")}
                  closeOnSelect={true}
                  inputProps={{
                    value: moment(this.state.postingDate).format("M/D/YY")
                  }}
                  timeFormat={false}
                />
              </Col>
              <Col xs={2}>
                <Form.Label>Invoice Number</Form.Label>
                <Form.Control
                  value={this.state.invoiceNumber}
                  onChange={this.handleInvoiceNumberChange}
                  onBlur={this.validateInvoiceNumberChange}
                />
              </Col>
              <Col xs={5}>
                <Form.Label>Statistics</Form.Label>
                <Form.Row>
                  <Table size="sm" hover borderless className="text-right">
                    <tbody style={{ fontSize: "12pt" }}>
                      <tr>
                        <td>PO Amount</td>
                        <td className="mr-1">
                          {this.state.statistics.po_TotalAmt}
                        </td>
                        <td></td>
                        <td></td>
                        <td className="border-left">PO Qty</td>
                        <td>{this.state.statistics.po_TotalQty}</td>
                      </tr>
                      <tr>
                        <td>Invoice Amount</td>
                        <td className="mr-1">
                          {this.state.statistics.po_totalAmtRec}
                        </td>
                        <td></td>
                        <td></td>
                        <td className="border-left">Invoice Qty</td>
                        <td>{this.state.statistics.po_totalQtyRec}</td>
                      </tr>
                      <tr>
                        <td>PO Amount Out.</td>
                        <td className="mr-1">
                          {this.state.statistics.po_totalAmtOut}
                        </td>
                        <td></td>
                        <td></td>
                        <td className="border-left">PO Qty Out.</td>
                        <td>{this.state.statistics.po_totalQtyOut}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Form.Row>
              </Col>
            </Form.Row>
          </Form>
        </Card.Body>
        <Table size="sm" bordered>
          <thead>
            <tr>{ths}</tr>
          </thead>
          <tbody>
            {this.state.data.map((row, rowIndex) => {
              return (
                <tr key={rowIndex.toString() + "row"}>
                  {this.headers.map((header, colIndex) => {
                    return (
                      <td
                        key={`${header[1]}-${rowIndex}`}
                        style={
                          header[2] ? { backgroundColor: "#e9ecef" } : null
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
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
  }
}
