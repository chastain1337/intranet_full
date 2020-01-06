import React from "react";
import AllPOsTableRow from "./AllPOsTableRow";
import { Table } from "react-bootstrap";
import CustomSearchBar from "./CustomSearchBar";

export default class AllPOsTable extends React.Component {
  state = {
    displayedPOs: this.props.pos,
    filterQuery: "",
    selectedQueryHeader: ""
  };

  headers = [
    ["Date", "orderDate"],
    ["Vendor", "vendor"],
    ["PO Number", "number"],
    ["Qty", "total_qty"],
    ["Open Qty", "total_outstanding_qty"],
    ["Amount", "total_amount"],
    ["Open Amount", "total_outstanding_amount"]
  ];

  handleQueryChange = newPOsToDisplay => {
    this.setState({ displayedPOs: newPOsToDisplay });
  };

  render() {
    const rows = this.state.displayedPOs.map(po => {
      return (
        <AllPOsTableRow
          po={po}
          key={po.vendor + "_" + po.number}
          history={this.props.history}
          headers={this.headers}
        />
      );
    });
    return (
      <>
        <CustomSearchBar
          headers={this.headers}
          toBeSearched={this.props.pos}
          handleQueryChange={this.handleQueryChange}
        />
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              {this.headers.map(header => (
                <td key={`tableheader-${header[0]}`}>{header[0]}</td>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </>
    );
  }
}
