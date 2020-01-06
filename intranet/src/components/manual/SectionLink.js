import React from "react";
import NavDropdown from "react-bootstrap/NavDropdown";
import { LinkContainer } from "react-router-bootstrap";

export default class SectionLink extends React.Component {
  render() {
    return (
      <LinkContainer
        to={"/manual/" + this.props.chapterName + "/" + this.props.name}
      >
        <NavDropdown.Item>{this.props.name}</NavDropdown.Item>
      </LinkContainer>
    );
  }
}
