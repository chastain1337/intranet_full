import React from "react";
import NavBarLink from "./NavBarLink";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Container } from "react-bootstrap";

export default class ReceivingNavBar extends React.Component {
  links = [
    { linkName: "Create PO", linkURL: "createPO" },
    { linkName: "View POs", linkURL: "viewPOs?submitted=true" },
    { linkName: "Create INV", linkURL: "createInvoice" },
    { linkName: "View INVs", linkURL: "viewInvoices" },
    {
      linkName: "View Pending POs",
      linkURL: "viewPOs?submitted=false"
    },
    { linkName: "Bulk Create POs", linkURL: "bulkCreatePOs" }
  ];
  render() {
    const Links = this.links.map(link => (
      <NavBarLink
        displayName={link.linkName}
        linkUrl={link.linkURL}
        key={link.linkName}
      />
    ));

    return (
      <Container>
        <Navbar variant="dark" bg="dark" expand="lg">
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="m-auto">{Links}</Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    );
  }
}
