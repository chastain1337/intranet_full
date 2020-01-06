import React from "react";
import { Modal, Button } from "react-bootstrap";

export default class AfterSaveProductModal extends React.Component {
  render() {
    var message;

    if (this.props.status === 201) {
      message = "The product was updated successfully.";
    } else if (this.props.status === 999) {
      message = this.props.errorMessage;
    } else if (this.props.status === 500) {
      message = "A server error has occured.";
    } else {
      message =
        "The product was not successfullly updated. An unknown error occured.";
    }

    return (
      <Modal
        size="lg"
        show={this.props.show}
        onHide={this.props.onHide}
        aria-labelledby="contained-modal-title-vcenter"
        centered>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.status === 201 ? "Success!" : "Update Failed"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="link"
            onClick={() => {
              this.props.onHide();
            }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
