import React from "react";
import moment from "moment";

export default class AllPOsTableRow extends React.Component {
  loadPO = e => {
    e.preventDefault();
    this.props.history.push(
      `/receiving/po/${this.props.po.vendor}/${this.props.po.number}/viewEdit`
    );
  };

  render() {
    return (
      <tr onClick={this.loadPO} style={{ cursor: "pointer" }}>
        {this.props.headers.map(header => (
          <td
            key={`${this.props.po.number}-${this.props.po.vendor}-${
              header[0]
            }`}>
            {header[1] === "orderDate"
              ? moment(this.props.po[header[1]]).format("M/D/YY")
              : this.props.po[header[1]]}
          </td>
        ))}
      </tr>
    );
  }
}
