import React from "react";
import PONavbar from "./PONavbar";
import POContent from "./POContent";
import ViewInvoices from "./ViewInvoices";
import ErrorMessage from "./ErrorMessage";
import { Container, Card } from "react-bootstrap";
import ApplyInvoice from "./ApplyInvoice";
import { Route, Switch } from "react-router-dom";
import axios from "axios";

export default class PO extends React.Component {
  state = {
    showErrorMessage: false,
    errorMessage: null,
    poChanged: false
  };
  POContent = React.createRef();

  saveInvoice = (
    data,
    invoiceNumber,
    statistics,
    editingInvoice,
    postingDate
  ) => {
    // Correct line numbers
    const poNumber = this.props.activePO.number;
    const vendorCode = this.props.activePO.vendor;
    let newData = [];
    data.forEach(row => {
      if (row.qty_to_rec > 0) {
        newData.push({
          line_id: row.line_id,
          qty: parseInt(row.qty_to_rec),
          price_unit: row.price_unit,
          price_extended: row.price_receiving
        });
      }
    });

    axios
      .post(
        `http://localhost:4000/receiving/po/${vendorCode}/${poNumber}/applyInvoice`,
        {
          number: invoiceNumber,
          vendor: vendorCode,
          associatedPO: poNumber,
          total_qty: statistics.po_totalQtyRec,
          total_amount: statistics.po_totalAmtRec,
          content: newData,
          editingInvoice: editingInvoice,
          postingDate: postingDate
        }
      )
      .then(res => {
        if (res.status === 201) {
          window.location = res.data;
        }
      });
  };

  calculatePOStatistics = data => {
    const newStatistics = {
      po_totalAmt:
        Math.round(
          data.reduce((total, row) => {
            return total + Number(row.price_extended);
          }, 0) * 100
        ) / 100,

      po_totalAmtRec:
        Math.round(
          this.props.invoices.reduce((total, invoice) => {
            return total + Number(invoice.total_amount);
          }, 0) * 100
        ) / 100,

      po_totalAmtOut:
        Math.round(
          data.reduce((total, row) => {
            return total + Number(row.qty_outstanding * row.price_unit);
          }, 0) * 100
        ) / 100,

      po_totalQty: data.reduce((total, row) => {
        return total + Number(row.qty_ordered);
      }, 0),

      po_totalQtyRec: data.reduce((total, row) => {
        return total + Number(row.qty_recd);
      }, 0),

      po_totalQtyOut: data.reduce((total, row) => {
        return total + Number(row.qty_outstanding);
      }, 0)
    };
    return newStatistics;
  };

  savePO = (
    poDataObject,
    newNumber,
    newVendor,
    statistics,
    orderDate,
    _submitted
  ) => {
    // Correct line numbers
    const newData = poDataObject.map((row, index) => {
      if (!row.line_id || row.line_id.length === 0) {
        row.line_id = `${Date.now()}-${index}`;
      }
      return row;
    });

    const poNumber = this.props.activePO.number;
    const vendorCode = this.props.activePO.vendor;

    axios
      .post(
        "http://localhost:4000/receiving/po/" + vendorCode + "/" + poNumber,
        {
          number: newNumber,
          vendor: newVendor,
          total_qty: statistics.po_totalQty,
          total_outstanding_qty: statistics.po_totalQtyOut,
          total_amount: statistics.po_totalAmt,
          total_outstanding_amount: statistics.po_totalAmtOut,
          content: newData,
          orderDate: orderDate,
          submitted: _submitted
        }
      )
      .then(res => {
        if (res.status === 201) {
          window.location = res.data;
        }
      });
  };

  updatePOChangeState = newVal => {
    this.setState({ poChanged: newVal });
  };

  render() {
    if (this.props.activePO) {
      return (
        <Container>
          {this.state.showErrorMessage ? (
            <ErrorMessage message={this.state.message} />
          ) : null}
          <Card>
            <PONavbar
              activeTab={this.props.location.pathname
                .replace(`${this.props.match.url}/`, "")
                .replace(/\/.+/g, "")}
              poChanged={this.state.poChanged}
            />
            <Switch>
              <Route
                exact
                path={`${this.props.match.url}/viewEdit`}
                render={props => {
                  return (
                    <POContent
                      {...props}
                      po={this.props.activePO}
                      products={this.props.products}
                      vendorCodes={this.props.vendorCodes}
                      updatePOChangeState={this.updatePOChangeState}
                      savePO={this.savePO}
                      calculatePOStatistics={this.calculatePOStatistics}
                      ref={this.POContent}
                    />
                  );
                }}
              />
              <Route
                exact
                path={`${this.props.match.url}/viewInvoices`}
                render={props => {
                  return (
                    <ViewInvoices
                      {...props}
                      invoices={this.props.invoices}
                      history={this.props.history}
                    />
                  );
                }}
              />
              <Route
                exact
                path={`${this.props.match.url}/applyInvoice`}
                render={props => (
                  <ApplyInvoice
                    {...props}
                    po={this.props.activePO}
                    saveInvoice={this.saveInvoice}
                    invoices={this.props.invoices}
                  />
                )}
              />
            </Switch>
          </Card>
        </Container>
      );
    } else return null;
  }
}
