import React from "react";
import TableRow from "./ProductDataTableRow";
import AddCustomFieldRow from "./AddCustomFieldRow";
import CustomFieldsAdded from "./CustomFieldsAdded";
import { Table } from "react-bootstrap";

export default class ExtraDataTable extends React.Component {
  handleFieldSave = async (newName, newValue) => {
    const productAttributes = Object.keys(this.props.product);
    const shortenedName = newName.replace(/([^0-9a-zA-Z_])+/g, "");
    if (productAttributes.includes(newName)) {
      alert("No duplicate property names.");
      return false;
    } else if (newName.length !== shortenedName.length) {
      alert(
        "Property names may only contain numbers, letters, and underscores. Try: " +
          shortenedName
      );
      return false;
    }
    this.props.addNewField(newName, newValue);
    return true;
  };

  handleDelete = propName => {
    this.props.removeCustomField(propName);
  };

  render() {
    const productProps = Object.keys(this.props.product);
    const defaultFieldNames = this.props.defaultFields.map(field => field[2]);
    const propsToInclude = productProps.filter(
      propName =>
        !defaultFieldNames.includes(propName) &&
        !this.props.extraFieldsToHide.includes(propName)
    );

    const customFieldsComponents = this.props.customFields.map(
      (field, index) => {
        return (
          <CustomFieldsAdded
            key={index.toString() + "-" + field.customPropName}
            propName={field.customPropName}
            propValue={field.customPropValue}
            handleDelete={this.handleDelete}
          />
        );
      }
    );

    const tableRows = propsToInclude.map(propName => {
      return (
        <TableRow
          propName={propName}
          propValue={this.props.product[propName]}
          key={propName + "-" + this.props.product[propName]}
          technicalPropName={propName}
          creating={this.props.creating}
          updateField={this.props.updateField}
          customProp={true}
          removeField={this.props.removeField}
        />
      );
    });

    return (
      <Table striped bordered hover size="sm">
        <tbody>
          {tableRows}
          {customFieldsComponents}
          <AddCustomFieldRow handleFieldSave={this.handleFieldSave} />
        </tbody>
      </Table>
    );
  }
}
