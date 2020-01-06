import React from "react";
import { Table } from "react-bootstrap";
import TableRow from "./ProductDataTableRow";

export default class DefaultDataTable extends React.Component {
  render() {
    const tableRows = this.props.defaultFields.map(field => {
      return (
        <TableRow
          propName={field[0]}
          technicalPropName={field[2]}
          propValue={field[1]}
          key={field[0] + "-" + field[1]}
          fetchOriginalPropValue={this.props.fetchOriginalPropValue}
          updateField={this.props.updateField}
          originalProduct={this.props.originalProduct}
          requiredField={field[3]}
          readOnly={field[4]}
        />
      );
    });
    return (
      <Table striped bordered hover size="sm">
        <tbody>{tableRows}</tbody>
      </Table>
    );
  }
}
