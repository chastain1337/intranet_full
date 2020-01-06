import React from "react";
import DefaultDataTable from "./DefaultDataTable";
import { Card } from "react-bootstrap";

export default class DefaultData extends React.Component {
  render() {
    if (this.props.product) {
      return (
        <Card>
          <Card.Header>Default Data</Card.Header>
          <Card.Body>
            <DefaultDataTable
              defaultFields={this.props.defaultFields}
              fetchOriginalPropValue={this.props.fetchOriginalPropValue}
              updateField={this.props.updateField}
              originalProduct={this.props.originalProduct}
            />
          </Card.Body>
        </Card>
      );
    } else return null;
  }
}
