import React from "react";

export default class POContentTableHeader extends React.Component {
  render() {
    const headerTHs = this.props.headers.map(header => (
      <th key={header[0]}>{header[0]}</th>
    )); // index 0 is display header, whereas 1 is technical name from db
    return (
      <thead>
        <tr>
          {headerTHs}
          <th className="text-center">Add</th>
          <th className="text-center">Del</th>
        </tr>
      </thead>
    );
  }
}
