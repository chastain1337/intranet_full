import React from "react";
import { InputGroup, Button } from "react-bootstrap";

export default class SKUSearchButtons extends React.Component {
  render() {
    return (
      <>
        {this.props.creating ? null : (
          <InputGroup.Append>
            <Button
              variant="outline-secondary"
              onClick={this.props.handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outline-success"
              onClick={this.props.handleCreateSKU}
            >
              Create
            </Button>
          </InputGroup.Append>
        )}
      </>
    );
  }
}
