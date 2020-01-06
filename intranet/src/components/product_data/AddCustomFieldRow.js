import React from "react";
import { Button } from "react-bootstrap";

export default class AddCustomFieldRow extends React.Component {
  state = {
    propName: "",
    propValue: ""
  };

  handleChangeName = e => {
    this.setState({ propName: e.target.value });
  };

  handleChangeValue = e => {
    this.setState({ propValue: e.target.value });
  };

  handleSave = async () => {
    if (this.propIsValid()) {
      const saveSucceeded = await this.props.handleFieldSave(
        this.state.propName,
        this.state.propValue
      );
      if (saveSucceeded) {
        this.setState({ propName: "", propValue: "" });
      }
    }
  };

  propIsValid = () => {
    if (this.state.propName !== "" && this.state.propValue !== "") {
      return true;
    } else {
      return false;
    }
  };
  render() {
    return (
      <tr>
        <td>
          <input
            placeholder="Custom Field Name"
            value={this.state.propName}
            onChange={this.handleChangeName}
          />
        </td>
        <td>
          <input
            placeholder="Custom Field Value"
            value={this.state.propValue}
            onChange={this.handleChangeValue}
          />
        </td>
        <td>
          <Button variant="success" size="sm" onClick={this.handleSave}>
            Save
          </Button>
        </td>
      </tr>
    );
  }
}
