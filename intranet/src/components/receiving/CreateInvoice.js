import React from "react";
import { Container, FormControl, Dropdown } from "react-bootstrap";

export default class CreateInvoice extends React.Component {
  state = { selectedVendor: null, selectedPO: null };

  handleVendorChoose = e => {
    const filteredPOs = this.props.pos
      .map(po => {
        if (po.vendor === this.props.vendors[e]) return po.number;
      })
      .filter(poNumber => poNumber);

    this.setState({
      selectedVendor: this.props.vendors[e],
      poNumbersList: filteredPOs
    });
  };

  handlePOChoose = e => {
    this.props.history.push(
      `/receiving/po/${this.state.selectedVendor}/${this.state.poNumbersList[e]}/applyInvoice`
    );
  };

  render() {
    var PoDropdownItems;
    const vendors = this.props.vendors.map((vendor, index) => (
      <Dropdown.Item
        key={`${vendor}-${index}`}
        onSelect={this.handleVendorChoose}
        eventKey={`${index}`}>
        {vendor}
      </Dropdown.Item>
    ));

    if (this.state.poNumbersList) {
      PoDropdownItems = this.state.poNumbersList.map((po, index) => (
        <Dropdown.Item
          key={`${po}-${index}`}
          onSelect={this.handlePOChoose}
          eventKey={`${index}`}>
          {po}
        </Dropdown.Item>
      ));
    }

    return (
      <Container className="text-center">
        <Dropdown>
          <Dropdown.Toggle id="vendor-dropdown" className="my-2">
            {this.state.selectedVendor
              ? this.state.selectedVendor
              : "Choose Vendor"}
          </Dropdown.Toggle>
          <Dropdown.Menu as={CustomMenu}>{vendors}</Dropdown.Menu>
        </Dropdown>

        {this.state.selectedVendor ? (
          <Dropdown>
            <Dropdown.Toggle id="po-dropdown" className="my-2">
              Choose Purchase Order
            </Dropdown.Toggle>
            <Dropdown.Menu as={CustomMenu}>{PoDropdownItems}</Dropdown.Menu>
          </Dropdown>
        ) : null}
      </Container>
    );
  }
}

class CustomMenu extends React.Component {
  state = { value: "" };

  handleChange = e => {
    this.setState({ value: e.target.value.toUpperCase().trim() });
  };

  render() {
    const {
      children,
      style,
      className,
      "aria-labelledby": labeledBy
    } = this.props;

    const value = this.state.value;

    return (
      <div style={style} className={className} aria-labelledby={labeledBy}>
        <FormControl
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={this.handleChange}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child, index) =>
              !value || child.props.children.toUpperCase().startsWith(value)
          )}
        </ul>
      </div>
    );
  }
}
