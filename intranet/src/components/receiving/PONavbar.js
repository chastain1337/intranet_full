import React from "react";
import { Card, Nav, Button, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

export default class PONavbar extends React.Component {
  render() {
    return (
      <Card.Header>
        <Nav variant="tabs" defaultActiveKey={this.props.activeTab}>
          <Nav.Item>
            <LinkContainer to={"viewEdit"}>
              <Nav.Link eventKey="viewEdit">
                View / Edit
                {this.props.poChanged ? "*" : null}
              </Nav.Link>
            </LinkContainer>
          </Nav.Item>
          <Nav.Item>
            <LinkContainer to={"viewInvoices"}>
              <Nav.Link eventKey="viewInvoices">View Invoices</Nav.Link>
            </LinkContainer>
          </Nav.Item>
          <Nav.Item>
            <LinkContainer to={"applyInvoice"}>
              <Nav.Link eventKey="applyInvoice">Apply Invoice</Nav.Link>
            </LinkContainer>
          </Nav.Item>
        </Nav>
      </Card.Header>
    );
  }
}
