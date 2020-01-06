import React from "react";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

export default class NavBarLink extends React.Component {
  render() {
    return (
      <LinkContainer to={"/receiving/" + this.props.linkUrl}>
        <Nav.Link className="mx-2">{this.props.displayName}</Nav.Link>
      </LinkContainer>
    );
  }
}
