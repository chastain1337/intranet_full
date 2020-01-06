import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

export default class HighestNavbar extends React.Component {
  links = [
    { linkName: "Home", linkURL: "", enabled: true },
    { linkName: "Manual", linkURL: "manual", enabled: true },
    { linkName: "Ordering", linkURL: "ordering", enabled: true },
    { linkName: "Product Data", linkURL: "productdata", enabled: true },
    { linkName: "Storefront", linkURL: "storefront", enabled: false },
    {
      linkName: "Vendor Info",
      linkURL: "vendorinfo",
      enabled: false
    },
    { linkName: "Receiving", linkURL: "receiving", enabled: true }
  ];

  render() {
    const Links = this.links.map(link => (
      <LinkContainer to={"/" + link.linkURL}>
        <Nav.Link disabled={!link.enabled} className="mx-2">
          {link.linkName}
        </Nav.Link>
      </LinkContainer>
    ));

    return (
      <Navbar
        variant="dark"
        style={{
          position: "absolute",
          left: "0",
          bottom: "0",
          right: "0",
          backgroundColor: "#024000"
        }}>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="m-auto">{Links}</Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
