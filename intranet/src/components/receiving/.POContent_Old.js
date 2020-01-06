import React from "react";
import { Card, Form, Col, Button, Row } from "react-bootstrap";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
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
    this.hotTableComponent = React.createRef();
    this.skus = this.props.products.map(product => product.sku);
    this.state = {
      validSKUs: null,
      poNumber: this.props.po.number,
      poVendor: this.props.po.vendor,
      invalidCells: [],
      data: this.props.po.content
    };
    this.unchangedPO = JSON.parse(JSON.stringify(this.props.po));
  }

  componentDidUpdate = (prevProps, prevState) => {
    // a valid entry into the table (one that does not return false on the validator(s)) does not trigger this
    this.hotTableComponent.current.hotInstance.validateCells();

    const hot = this.hotTableComponent.current.hotInstance;
    const skusBeingLoaded = this.state.data.map(product => product.sku);
    skusBeingLoaded.forEach((sku, row) => {
      if (sku !== null && !this.skus.includes(sku)) {
        hot.setCellMeta(row, 0, "readOnly", true);
      }
    });
  };

  componentDidMount = () => {
    console.log("component mounted");
    const hot = this.hotTableComponent.current.hotInstance;
    hot.updateSettings({
      cells: (row, col) => {
        console.log(row, col);
        var cellProps = {};
        if (col === 0 && row < this.unchangedPO.content.length) {
          // ensure only sku column in the original data
          var cellProps = {};
          const sku = hot.getDataAtCell(row, col);
          if (!this.skus.includes(sku)) {
            cellProps.readOnly = true;
          } else cellProps = {};
          return cellProps;
        }
        return cellProps;
      }
    });

    // this.hotTableComponent.current.hotInstance.validateCells();
    // console.log("Component mounted");
    // const hot = this.hotTableComponent.current.hotInstance;
    // const skusBeingLoaded = this.state.data.map(product => product.sku);
    // skusBeingLoaded.forEach((sku, row) => {
    //   if (sku !== null && !this.skus.includes(sku)) {
    //     hot.setCellMeta(row, 0, "readOnly", true);
    //   }
    // });
  };

  skuValidator = (sku, callback) => {
    if (sku == null || !sku || sku === "") return callback(true);
    if (this.skus === null || !this.skus.includes(sku)) {
      callback(false);
    } else {
      callback(true);
    }
  };

  skuIsValid = sku => {
    if (this.skus === null || !this.skus.includes(sku)) {
      return false;
    } else {
      return true;
    }
  };

  updateBasedOnChanges = (changes, source) => {
    console.log(source);

    const valueIsNotANumberAndWasReset = (oldVal, newVal, row, prop) => {
      if (isNaN(newVal)) {
        this.hotTableComponent.current.hotInstance.setDataAtRowProp(
          row,
          prop,
          oldVal,
          "program"
        );
        return true;
      } else return false;
    };

    // Run initial validator if this is the first load
    if (source === "loadData") {
      return;
    }

    // Run ignore if data was programattically updated
    if (source === "program") return;

    // Update other fields if this was a user change
    if (source === "edit") {
      changes.forEach(([row, prop, oldValue, newValue]) => {
        const qty = this.hotTableComponent.current.hotInstance.getDataAtRowProp(
          row,
          "qty_ordered"
        );
        switch (prop) {
          case "sku":
            const col = this.hotTableComponent.current.hotInstance.propToCol(
              prop
            );

            // Check if new sku is just blank
            if (newValue == null) {
              // Clear part number, desc, unit price
              this.hotTableComponent.current.hotInstance.setDataAtRowProp(
                [
                  [row, "part_number", null],
                  [row, "desc", null],
                  [row, "price_unit", 0]
                ],
                "program"
              );

              if (this.state.invalidCells.includes(`${row}-${col}`)) {
                const newInvalidCells = this.state.invalidCells.filter(
                  cellID => cellID !== `${row}-${col}`
                );
                return this.setState({ invalidCells: newInvalidCells });
              } else return;
            }

            if (this.skuIsValid(newValue)) {
              // Look up part number and desc
              const thisProduct = this.props.products.find(
                product => product.sku === newValue
              );
              this.hotTableComponent.current.hotInstance.setDataAtRowProp(
                [
                  [row, "part_number", thisProduct.partNumber],
                  [row, "desc", thisProduct.desc],
                  [row, "price_unit", thisProduct.luc]
                ],
                "program"
              );

              if (this.state.invalidCells.includes(`${row}-${col}`)) {
                const newInvalidCells = this.state.invalidCells.filter(
                  cellID => cellID !== `${row}-${col}`
                );
                this.setState({ invalidCells: newInvalidCells });
              }
            } else {
              if (!this.state.invalidCells.includes(`${row}-${col}`)) {
                const newInvalidCells = [
                  ...this.state.invalidCells,
                  `${row}-${col}`
                ];
                this.setState({ invalidCells: newInvalidCells });
              }
            }
            break;
          case "price_unit":
            if (valueIsNotANumberAndWasReset(oldValue, newValue, row, prop))
              break;
            // Updated price_extended
            const roundedUnitPrice = Math.round(newValue * 100000) / 100000;
            this.hotTableComponent.current.hotInstance.setDataAtRowProp(
              [
                [row, "price_unit", roundedUnitPrice],
                [
                  row,
                  "price_extended",
                  Math.round(qty * roundedUnitPrice * 100) / 100
                ]
              ],
              "program"
            );
            break;

          case "price_extended":
            if (valueIsNotANumberAndWasReset(oldValue, newValue, row, prop))
              break;

            // Updated price_unit
            const roundedPriceExtended = Math.round(newValue * 100) / 100;
            this.hotTableComponent.current.hotInstance.setDataAtRowProp(
              [
                [row, "price_extended", roundedPriceExtended],
                [
                  row,
                  "price_unit",
                  Math.round((roundedPriceExtended / qty) * 100000) / 100000
                ]
              ],
              "program"
            );
            break;

          case "qty_ordered":
            if (valueIsNotANumberAndWasReset(oldValue, newValue, row, prop))
              break;
            // Updated price_extended
            const wholeNumberQty = Math.round(newValue);
            const price_unit = this.hotTableComponent.current.hotInstance.getDataAtRowProp(
              row,
              "price_unit"
            );
            this.hotTableComponent.current.hotInstance.setDataAtRowProp(
              [
                [row, "price_extended", price_unit * wholeNumberQty],
                [row, "qty_ordered", wholeNumberQty]
              ],

              "program"
            );
            break;

          default:
            break;
        }
      });
    }
  };

  handlePoNumberChange = e => {
    this.setState({ poNumber: e.target.value });
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
    this.setState({ poVendor: e.target.value });
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

  savePO = () => {
    console.log(this.hotTableComponent.current.hotInstance.getData());
  };

  logSelectedCellMeta = () => {
    return;
    const hot = this.hotTableComponent.current.hotInstance;
    console.log(
      hot.getCellMeta(hot.getSelected()[0][0], hot.getSelected()[0][1])
    );
  };

  render() {
    console.log("render");
    return (
      <>
        <Card.Body>
          <Card.Title>
            <Form>
              <Form.Row>
                <Col xs={6}>
                  <Form.Label>PO Number</Form.Label>
                  <Form.Control
                    value={this.state.poNumber}
                    onChange={this.handlePoNumberChange}
                    onBlur={this.validatePoNumber}
                  />
                </Col>
                <Col xs={4}>
                  <Form.Label>Vendor Code</Form.Label>
                  <Form.Control
                    value={this.state.poVendor}
                    onChange={this.handleVendorChange}
                    onBlur={this.validateVendor}
                  />
                </Col>
                <Col xs={2}>
                  <Form.Label>Options</Form.Label>
                  <Form.Row>
                    <Button
                      size="sm"
                      variant="success"
                      className="mr-1 mb-1"
                      disabled={this.state.invalidCells.length > 0}
                      onClick={this.savePO}>
                      SAVE
                    </Button>
                    <Button size="sm" className="mb-1" variant="danger">
                      DELETE
                    </Button>
                  </Form.Row>
                </Col>
              </Form.Row>
            </Form>
          </Card.Title>

          <HotTable
            afterChange={this.updateBasedOnChanges}
            afterSelection={this.logSelectedCellMeta}
            licenseKey={"non-commercial-and-evaluation"}
            data={this.state.data}
            ref={this.hotTableComponent}
            dataSchema={{
              sku: null,
              qty_ordered: null,
              part_number: null,
              desc: null,
              qty_outstanding: null,
              qty_recd: null,
              price_unit: null,
              price_extended: null
            }}
            colHeaders={[
              "SKU",
              "Q.Ord",
              "Part Number",
              "Description",
              "Q.Out",
              "Q.Rec",
              "Unit Price",
              "Total Price"
            ]}
            columns={[
              {
                data: "sku",
                validator: this.skuValidator
              },
              { data: "qty_ordered", type: "numeric" },
              { data: "part_number" },
              { data: "desc" },
              { data: "qty_outstanding", editor: false },
              { data: "qty_recd", editor: false },
              {
                data: "price_unit",
                type: "numeric",
                numericFormat: { pattern: "$0,0.00" }
              },
              {
                data: "price_extended",
                type: "numeric",
                numericFormat: { pattern: "$0,0.00" }
              }
            ]}
            manualColumnResize={true}
            minSpareRows={200 - this.state.data.length}
          />
        </Card.Body>
      </>
    );
  }
}

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
