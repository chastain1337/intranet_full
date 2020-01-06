import React from "react";
import { Button } from "react-bootstrap";

export default class CustomFieldsAdded extends React.Component {
  render() {
    return (
      <tr>
        <td>{this.props.propName}</td>
        <td>{this.props.propValue}</td>
        <td>
          <Button
            className="ml-2"
            size="sm"
            onClick={() => {
              this.props.handleDelete(this.props.propName);
            }}
            variant="danger"
          >
            Delete
          </Button>
        </td>
      </tr>
    );
  }
}
