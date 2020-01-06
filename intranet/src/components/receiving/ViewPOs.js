import React from "react";
import ErrorMessage from "./ErrorMessage";
import AllPOsTable from "./AllPOsTable";
import { Container } from "react-bootstrap";

export default class ViewPOs extends React.Component {
  state = {
    errorMessage: null
  };

  componentDidMount = () => {};

  render() {
    return (
      <>
        {this.props.allPOs ? (
          this.state.errorMessage ? (
            <ErrorMessage message={this.state.errorMessage} />
          ) : (
            <Container>
              <AllPOsTable
                pos={this.props.allPOs}
                history={this.props.history}
              />
            </Container>
          )
        ) : (
          <div>Loading Purchase Orders...</div>
        )}
      </>
    );
  }
}
