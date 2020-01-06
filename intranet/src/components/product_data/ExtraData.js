import React from "react";
import ExtraDataTable from "./ExtraDataTable";
import { Card, Accordion } from "react-bootstrap";
import { StyledProductExtraDataAccordionToggle } from "../../Styles";

export default class EditData extends React.Component {
  render() {
    if (this.props.product) {
      return (
        <Accordion className="my-3">
          <Card>
            <StyledProductExtraDataAccordionToggle>
              <Accordion.Toggle as={Card.Header} eventKey="0">
                Extra Data
              </Accordion.Toggle>
            </StyledProductExtraDataAccordionToggle>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <ExtraDataTable
                  defaultFields={this.props.defaultFields}
                  product={this.props.product}
                  customFields={this.props.customFields}
                  updateField={this.props.updateField}
                  removeField={this.props.removeField}
                  extraFieldsToHide={this.props.extraFieldsToHide}
                  addNewField={this.props.addNewField}
                />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      );
    } else return null;
  }
}
