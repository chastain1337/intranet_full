import React from "react";
import { Alert, Container } from "react-bootstrap";

// this only hides the error message component internally, componenets need a "handleClose"
// function to deal with hiding in the parent component
export default class ErrorMessage extends React.Component {
  state = {
    show: true
  };

  render() {
    return (
      <Container className="text-center my-1">
        <Alert
          style={{ display: "inline-block" }}
          variant="danger"
          show={this.state.show}
          onClose={() => {
            this.setState({ show: false });
          }}
          dismissible>
          {this.props.message}
        </Alert>
      </Container>
    );
  }
}
