import React from "react";
import { Alert, Container } from "react-bootstrap";

export default class ErrorMessage extends React.Component {
  state = {
    show: true
  };

  render() {
    console.log("rendering error message");
    return (
      <Container className="text-center my-1">
        <Alert
          style={{ display: "inline-block" }}
          variant="danger"
          show={this.state.show}
          onClose={() => {
            this.setState({ show: false });
          }}
          dismissible
        >
          {this.props.message}
        </Alert>
      </Container>
    );
  }
}
