import React from "react";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckSquare,
  faWindowClose,
  faHistory
} from "@fortawesome/free-solid-svg-icons";

export default class TableRow extends React.Component {
  state = {
    edit: false,
    propValue: this.props.propValue,
    newPropValue: this.props.propValue,
    showConfirmDeleteModal: false
  };

  deleteProp = () => {
    this.setState(
      { showConfirmDeleteModal: false },
      this.props.removeField(this.props.technicalPropName)
    );
  };

  enableEditing = e => {
    this.setState({
      edit: true,
      newPropValue: ""
    });
  };

  saveComponent = () => {
    // Pass the new prop and propname up to ProductData and reset the defaultFields value
    this.props.updateField(
      this.props.technicalPropName,
      this.state.newPropValue
    );
    this.setState({ edit: false, newPropValue: "" });
  };

  handleChange = e => {
    this.setState({
      newPropValue: e.target.value
    });
  };

  handleKeyPress = e => {
    if (e.keyCode == 13) {
      this.saveComponent();
    } else if (e.keyCode == 27) {
      this.cancel();
    }
  };

  cancel = () => {
    this.setState({ edit: false, newPropValue: "" });
  };

  revert = () => {
    const originalValue = this.props.originalProduct[
      this.props.technicalPropName
    ];
    this.setState({ propValue: originalValue, newPropValue: "", edit: false });
  };

  render() {
    if (this.state.edit) {
      return (
        <tr>
          <td>{this.props.propName}</td>
          <td>
            <input
              className="productPropEditInput"
              placeholder={this.state.propValue}
              value={this.state.newPropValue}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyPress}
              autoFocus
            />
            <Button
              variant="outline-secondary"
              className="ml-2"
              size="sm"
              onClick={this.saveComponent}>
              <FontAwesomeIcon icon={faCheckSquare} />
            </Button>
            <Button
              variant="outline-secondary"
              className="ml-2"
              size="sm"
              onClick={this.cancel}>
              <FontAwesomeIcon icon={faWindowClose} />
            </Button>
            <Button
              variant="outline-secondary"
              className="ml-2"
              size="sm"
              onClick={this.revert}>
              <FontAwesomeIcon icon={faHistory} />
            </Button>
          </td>
        </tr>
      );
    }
    return (
      <tr>
        <td onClick={this.props.readOnly ? null : this.enableEditing}>
          {this.props.requiredField
            ? `${this.props.propName} *`
            : this.props.propName}
        </td>
        <td onClick={this.props.readOnly ? null : this.enableEditing}>
          {this.state.propValue}
        </td>
        {this.props.customProp ? (
          <td>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                this.setState({ showConfirmDeleteModal: true });
              }}>
              Delete
            </Button>
          </td>
        ) : null}
        <Modal
          size="lg"
          show={this.state.showConfirmDeleteModal}
          onHide={() => {
            this.setState({ showConfirmDeleteModal: false });
          }}
          aria-labelledby="contained-modal-title-vcenter"
          centered>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Delete Property?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              This action will not take full effect until you choose, "Save
              Product" at the bottom, but it cannot be undone without refreshing
              the page.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                this.setState({ showConfirmDeleteModal: false });
              }}>
              Close
            </Button>

            <Button variant="danger" onClick={this.deleteProp}>
              Yes, remove property.
            </Button>
          </Modal.Footer>
        </Modal>
      </tr>
    );
  }
}
