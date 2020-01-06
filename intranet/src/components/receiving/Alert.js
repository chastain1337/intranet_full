import React from "react";
import { Toast, Container } from "react-bootstrap";

export default class CustomAlert extends React.Component {
  state = {
    show: true
  };

  render() {
    console.log("rendering error message");
    return (
      <Container className="text-center my-1">
        <Toast
          delay={3000}
          autohide
          style={{
            position: "absolute",
            top: 0,
            right: 0
          }}
          variant="warning"
          show={this.state.show}
          onClose={() => {
            this.props.hideMessage();
          }}>
          <Toast.Header />
          <Toast.Body>{this.props.message}</Toast.Body>
        </Toast>
      </Container>
    );
  }
}
