import React from "react";
import {
  Form,
  Container,
  Col,
  Button,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import axios from "axios";
import ErrorMessage from "./ErrorMessage";

export default class CreatePO extends React.Component {
  state = {
    createButtonEnabled: false,
    poNumber: "",
    vendorCode: "",
    showErrorMessage: false,
    errorMessage: null
  };

  poNumberChange = e => {
    this.setState({ poNumber: e.target.value.toUpperCase() });
  };
  vendorCodeChange = e => {
    this.setState({ vendorCode: e.target.value.toUpperCase() });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.state.poNumber !== prevState.poNumber ||
      this.state.vendorCode !== prevState.vendorCode
    ) {
      var bothFieldsAreValid = false;
      if (this.vendorCodeIsValid() && this.poNumberIsValid()) {
        bothFieldsAreValid = true;
      }

      if (bothFieldsAreValid && !this.state.createButtonEnabled) {
        this.toggleCreateButton(true);
      }

      if (!bothFieldsAreValid && this.state.createButtonEnabled) {
        this.toggleCreateButton(false);
      }
    }
  };

  poNumberIsValid = () => {
    const shortenedNo = this.state.poNumber.replace(
      /([^0-9a-zA-Z_\.\-])+/g,
      ""
    );
    if (
      shortenedNo.length !== this.state.poNumber.length ||
      this.state.poNumber.trim().length < 5
    )
      return false;
    else return true;
  };

  vendorCodeIsValid = () => {
    if (this.props.vendorCodes.includes(this.state.vendorCode)) return true;
    else return false;
  };

  toggleCreateButton = buttonVisible => {
    this.setState({ createButtonEnabled: buttonVisible });
  };

  savePO = async e => {
    e.preventDefault();
    if (
      this.props.pos.some(
        po =>
          po.vendor === this.state.vendorCode &&
          po.number === this.state.poNumber
      )
    ) {
      return this.setState({
        errorMessage: "This PO Number already exists for this vendor.",
        showErrorMessage: true
      });
    }

    e.preventDefault();
    const poObject = {
      number: this.state.poNumber,
      vendor: this.state.vendorCode
    };

    const response = await axios
      .post("http://localhost:4000/receiving/po", poObject)
      .then(res => {
        return res.data;
      })
      .catch(err => {
        return this.setState({
          showErrorMessage: true,
          errorMessage: `There was an error creating the PO. ${err}`
        });
      });
    if (response.success === true) {
      window.location =
        "/receiving/po/" +
        this.state.vendorCode +
        "/" +
        this.state.poNumber +
        "/viewEdit";
    } else {
      this.setState({
        showErrorMessage: true,
        errorMessage: response.message
      });
    }
  };

  render() {
    return (
      <>
        {this.state.showErrorMessage ? (
          <ErrorMessage message={this.state.errorMessage} />
        ) : null}
        <Container className="my-3 px-4 ">
          <Form>
            <Form.Row>
              <Col xs={8}>
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip>
                      At least 5 characters, alphanumeric + periods, dashes,
                      underscores.
                    </Tooltip>
                  }>
                  <Form.Control
                    size="lg"
                    type="text"
                    placeholder="Purchase Order Number"
                    className="mr-3"
                    onChange={this.poNumberChange}
                    value={this.state.poNumber}
                  />
                </OverlayTrigger>
              </Col>
            </Form.Row>
            <Form.Row>
              <Col xs={4}>
                <Form.Control
                  className="my-2"
                  size="lg"
                  type="text"
                  placeholder="Vendor Code"
                  onChange={this.vendorCodeChange}
                  value={this.state.vendorCode}
                />
              </Col>
            </Form.Row>
            <Form.Row>
              <Col xs={3}>
                <Button
                  type="submit"
                  disabled={!this.state.createButtonEnabled}
                  onClick={this.savePO}>
                  Create
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </>
    );
  }
}
