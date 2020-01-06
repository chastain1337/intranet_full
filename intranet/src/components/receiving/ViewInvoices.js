import React from "react";
import { Table, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle, faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import CustomSearchBar from "./CustomSearchBar";
import moment from "moment";

export default class ViewInvoices extends React.Component {
  state = {
    filter: this.props.filter,
    displayedInvs: this.props.invoices
  };

  headers = [
    ["Post Date", "postingDate"],
    ["Invoice Number", "number"],
    ["Vendor", "vendor"],
    ["PO", "associatedPO"],
    ["Qty", "total_qty"],
    ["Amount", "total_amount"]
  ];

  loadInvoice = (vendor, number) => {
    this.props.history.push(`/receiving/invoice/${vendor}/${number}`);
  };

  deleteInvoice = index => {
    const invoiceObj = this.props.invoices[index];
    axios
      .post("http://localhost:4000/receiving/invoice/delete", invoiceObj)
      .then(res => {
        if (res.status === 201) {
          window.location.reload();
        }
      });
  };
  editInvoice = index => {
    const confirm = window.confirm(
      "Editing invoices is a bad accounting practice. Are you sure you want to continue?"
    );

    if (!confirm) return;
    const vendor = this.props.invoices[index].vendor;
    const poNumber = this.props.invoices[index].associatedPO;
    const invoiceNumber = this.props.invoices[index].number;
    this.props.history.push(
      `/receiving/po/${vendor}/${poNumber}/applyInvoice?invoice=${invoiceNumber}`
    );
  };
  handleQueryChange = newInvsToDisplay => {
    this.setState({ displayedInvs: newInvsToDisplay });
  };

  render() {
    const trs = this.state.displayedInvs.map((invoice, invoiceIndex) => {
      const tds = this.headers.map(header => {
        return (
          <td
            onClick={() => {
              this.loadInvoice(`${invoice.vendor}`, `${invoice.number}`);
            }}
            key={`${invoiceIndex}-${header[1]}`}>
            {header[1] === "postingDate"
              ? moment(invoice[header[1]]).format("M/D/YY")
              : invoice[header[1]]}
          </td>
        );
      });
      return (
        <tr key={`${invoiceIndex}-row`} style={{ cursor: "pointer" }}>
          {tds}
          <td className="text-center">
            <FontAwesomeIcon
              style={{ cursor: "pointer" }}
              onClick={() => {
                this.deleteInvoice(invoiceIndex);
              }}
              icon={faTimesCircle}
            />
          </td>
          <td className="text-center">
            <FontAwesomeIcon
              style={{ cursor: "pointer" }}
              onClick={() => {
                this.editInvoice(invoiceIndex);
              }}
              icon={faEdit}
            />
          </td>
        </tr>
      );
    });
    return (
      <Container>
        <CustomSearchBar
          headers={this.headers}
          toBeSearched={this.props.invoices}
          handleQueryChange={this.handleQueryChange}
        />
        <Table bordered striped hover size="sm">
          <thead>
            <tr>
              {this.headers.map(header => (
                <th key={`header-${header[0]}`}>{header[0]}</th>
              ))}
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>{trs}</tbody>
        </Table>
      </Container>
    );
  }
}
