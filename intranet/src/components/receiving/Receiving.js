import React from "react";
import {
  Table,
  Container,
  ProgressBar,
  Spinner,
  Button
} from "react-bootstrap";
import axios from "axios";
import ReceivingNavBar from "./ReceivingNavBar";
import { Route, Switch } from "react-router-dom";
import CreatePO from "./CreatePO";
import CreateInvoice from "./CreateInvoice";
import ViewPOs from "./ViewPOs";
import ViewInvoices from "./ViewInvoices";
import Invoice from "./Invoice";
import PO from "./PO";
import ApplyInvoice from "./ApplyInvoice";
import BulkCreate from "./BulkCreate";
import queryString from "query-string";

export default class Receiving extends React.Component {
  state = {
    pos: null,
    invoices: null,
    products: null, // sku, partnum, desc
    vendors: null, // just the code
    progress: 0
  };

  loadPos = () => {
    axios.get("http://localhost:4000/receiving/pos").then(res => {
      this.setState(prevState => {
        const newProgress = prevState.progress + 25;
        return {
          pos: res.data,
          progress: newProgress
        };
      });
    });
  };

  loadInvoices = () => {
    axios.get("http://localhost:4000/receiving/invoices").then(res => {
      this.setState(prevState => {
        const newProgress = prevState.progress + 25;
        return {
          invoices: res.data,
          progress: newProgress
        };
      });
    });
  };

  loadProducts = () => {
    axios
      .get(
        "http://localhost:4000/productdata/products?field=sku&field=partNumber&field=desc&field=luc"
      )
      .then(res => {
        this.setState(prevState => {
          const newProgress = prevState.progress + 25;
          return {
            products: res.data,
            progress: newProgress
          };
        });
      });
  };

  loadVendors = () => {
    axios.get("http://localhost:4000/vendorinfo/allvendorcodes").then(res => {
      this.setState(prevState => {
        const newProgress = prevState.progress + 25;
        return {
          vendors: res.data,
          progress: newProgress
        };
      });
    });
  };

  componentDidMount = () => {
    if (this.state.progress !== 100) {
      this.loadPos();
      this.loadInvoices();
      this.loadProducts();
      this.loadVendors();
    }
  };

  refreshData = dataToRefresh => {
    const newProgress = this.state.progress - 25;
    switch (dataToRefresh) {
      case "pos":
        this.setState({ pos: null, progress: newProgress });
        return this.loadPos();
      case "invoices":
        this.setState({ invoices: null, progress: newProgress });
        return this.loadInvoices();
      case "products":
        this.setState({ products: null, progress: newProgress });
        return this.loadProducts();
      case "vendors":
        this.setState({ vendors: null, progress: newProgress });
        return this.loadVendors();
      default:
        break;
    }
  };

  render() {
    return (
      <>
        {this.state.progress < 100 ? (
          <Container>
            <ProgressBar now={this.state.progress} />
          </Container>
        ) : (
          <ReceivingNavBar />
        )}
        {this.props.location.pathname === "/receiving" ? (
          <Container>
            <Table size="sm">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Refresh</th>
                </tr>
                <tr>
                  <td>Purchase Orders</td>
                  <td>
                    <Button onClick={() => this.refreshData("pos")}>
                      {this.state.pos ? (
                        "Refresh"
                      ) : (
                        <Spinner animation="border" />
                      )}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Invoices</td>
                  <td>
                    <Button onClick={() => this.refreshData("invoices")}>
                      {this.state.invoices ? (
                        "Refresh"
                      ) : (
                        <Spinner animation="border" />
                      )}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Products</td>
                  <td>
                    <Button onClick={() => this.refreshData("products")}>
                      {this.state.products ? (
                        "Refresh"
                      ) : (
                        <Spinner animation="border" />
                      )}
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Vendors</td>
                  <td>
                    <Button onClick={() => this.refreshData("vendors")}>
                      {this.state.vendors ? (
                        "Refresh"
                      ) : (
                        <Spinner animation="border" />
                      )}
                    </Button>
                  </td>
                </tr>
              </thead>
            </Table>
          </Container>
        ) : null}
        {this.state.progress === 100 ? (
          <Switch>
            <Route
              path="/receiving/bulkCreatePOs"
              render={props => (
                <BulkCreate
                  {...props}
                  products={this.state.products}
                  vendors={this.state.vendors}
                />
              )}
            />
            <Route
              path="/receiving/po/:vendorCode/:poNumber"
              render={props => (
                <PO
                  {...props}
                  vendorCodes={this.state.vendors}
                  products={this.state.products}
                  invoices={this.state.invoices.filter(invoice => {
                    if (
                      invoice.vendor === props.match.params.vendorCode &&
                      invoice.associatedPO === props.match.params.poNumber
                    )
                      return invoice;
                  })}
                  activePO={this.state.pos.find(
                    po =>
                      po.vendor === props.match.params.vendorCode &&
                      po.number === props.match.params.poNumber
                  )}
                />
              )}
            />
            <Route
              exact
              path="/receiving/invoice/:vendorCode/:invNumber"
              render={props => (
                <Invoice
                  {...props}
                  invoice={this.state.invoices.find(
                    inv =>
                      inv.vendor === props.match.params.vendorCode &&
                      inv.number === props.match.params.invNumber
                  )}
                  po={this.state.pos.find(po => {
                    const invoice = this.state.invoices.find(
                      inv =>
                        inv.vendor === props.match.params.vendorCode &&
                        inv.number === props.match.params.invNumber
                    );
                    return (
                      po.vendor === invoice.vendor &&
                      po.number === invoice.associatedPO
                    );
                  })}
                />
              )}
            />
            <Route
              exact
              path="/receiving/createPO"
              render={props => (
                <CreatePO
                  {...props}
                  pos={this.state.pos}
                  vendorCodes={this.state.vendors}
                />
              )}
            />
            <Route
              exact
              path="/receiving/viewPOs"
              render={props => {
                let submitted = true;
                if (
                  queryString.parse(window.location.search).submitted ===
                  "false"
                )
                  submitted = false;

                const filteredPOs = this.state.pos.filter(
                  po => po.submitted === submitted
                );
                return (
                  <ViewPOs
                    {...props}
                    allPOs={filteredPOs}
                    refreshData={this.refreshData}
                  />
                );
              }}
            />
            <Route
              exact
              path="/receiving/createInvoice"
              render={props => (
                <CreateInvoice
                  {...props}
                  vendors={this.state.vendors}
                  pos={this.state.pos} // dont need entire po
                />
              )}
            />
            <Route
              exact
              path="/receiving/applyInvoice/:vendorCode/:poNumber"
              render={props => (
                <ApplyInvoice
                  {...props}
                  po={this.state.pos.find(
                    po =>
                      po.vendor === props.match.params.vendorCode &&
                      po.number === props.match.params.poNumber
                  )}
                  invoices={this.state.invoices.filter(
                    invoice => invoice.vendor === props.match.params.vendor
                  )}
                />
              )}
            />
            <Route
              exact
              path="/receiving/viewInvoices"
              render={props => (
                <ViewInvoices
                  {...props}
                  invoices={this.state.invoices}
                  history={this.props.history}
                />
              )}
            />
          </Switch>
        ) : null}
      </>
    );
  }
}
