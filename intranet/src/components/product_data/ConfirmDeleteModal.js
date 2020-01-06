import React from "react";
import { Modal, Button } from "react-bootstrap";

export default class ConfirmDeleteModal extends React.Component {
  state = {
    firstConfirm: false
  };

  handleCloseClick = () => {
    this.props.onHide();
  };

  handleFirstConfirm = () => {
    this.setState({ firstConfirm: true });
  };

  handleFinalConfirm = () => {
    this.props.deleteConfirmed();
  };

  render() {
    return (
      <Modal
        size="lg"
        show={this.props.show}
        onHide={this.props.onHide}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.state.firstConfirm ? "Are You Sure?" : "Confirm Delete"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            {this.state.firstConfirm ? (
              <b>This action cannot be undone.</b>
            ) : (
              "Are you sure you want to delete this product?"
            )}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleCloseClick}>Close</Button>
          <>
            {this.state.firstConfirm ? (
              <Button variant="danger" onClick={this.handleFinalConfirm}>
                Yes, Delete Product Forever
              </Button>
            ) : (
              <Button variant="danger" onClick={this.handleFirstConfirm}>
                Delete Product
              </Button>
            )}
          </>
        </Modal.Footer>
      </Modal>
    );
  }
}
