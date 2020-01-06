import React from "react";
import { Route } from "react-router-dom";
import ManualNavBar from "./ManualNavBar";
import ManualPage from "./ManualPage";
import axios from "axios";

class Manual extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toc: []
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:4000/manual/tableofcontents")
      .then(res => {
        this.setState({
          toc: res.data
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    if (this.state.toc.length !== 0) {
      return (
        <>
          <ManualNavBar toc={this.state.toc} />
          <Route
            path="/manual/:chapter/:section"
            render={props => <ManualPage {...props} toc={this.state.toc} />}
          />
        </>
      );
    } else return null;
  }
}

export default Manual;
