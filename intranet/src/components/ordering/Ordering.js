import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Jumbotron, Container, Card, Accordion } from "react-bootstrap";
import ConnectInventory from "./ConnectInventory";
import CalculateOrdering from "./CalculateOrdering";
import CompileOrdering from "./CompileOrdering";

class Ordering extends React.Component {
  state = {
    lastCalculated: ""
  };
  render() {
    return (
      <>
        <Jumbotron fluid className="text-center">
          <Container>
            <h1>ORDERING</h1>
            <p>Follow the steps below to compile ordering.</p>
            Last calculation: {this.state.lastCalculated}
          </Container>
        </Jumbotron>
        <Container>
          <Accordion>
            <ConnectInventory />
            <CalculateOrdering />
            <CompileOrdering />
          </Accordion>
        </Container>
      </>
    );
  }
}

export default Ordering;
