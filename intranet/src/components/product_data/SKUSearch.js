import React from "react";
import { InputGroup, FormControl, Button } from "react-bootstrap";
import { StyledSKUSearch } from "../../Styles";
import axios from "axios";
import SKUSearchButtons from "./SKUSearchButtons";
import ErrorMessage from "./ErrorMessage";

export default class SKUSearch extends React.Component {
  state = {
    product: "",
    showError: false,
    errorMessage: null
  };

  handleChange = e => {
    this.setState({
      product: e.target.value
    });
  };

  handleCreateSKU = async () => {
    // Check if SKU already exists in DB
    const skuObject = await this.fetchSKU(this.state.product);
    if (skuObject.sku) return alert(`${this.state.product} is already a SKU.`);

    var skuObj = {};
    // Set the default values to '' except for SKU
    this.props.defaultFields.forEach(field => {
      skuObj[field[2]] = "";
    });
    skuObj.sku = this.state.product;

    this.props.getProduct(skuObj, true);
  };

  handleKeyPress = e => {
    if (e.keyCode === 13) {
      this.handleSearch();
    }
  };

  fetchSKU = async skuToSeach => {
    var skuObject;
    await axios
      .get("http://localhost:4000/productdata/getproduct?sku=" + skuToSeach)
      .then(async res => {
        skuObject = res.data;
      })
      .catch(err => {
        skuObject = {};
        this.setState({ showError: true, errorMessage: err.message });
      });
    return skuObject;
  };

  handleSearch = async () => {
    var skuToSeach = this.state.product
      .trim()
      .replace(/(.+x )|(-.+)/g, "")
      .toUpperCase();
    if (skuToSeach.length === 0) return;

    const skuObject = await this.fetchSKU(skuToSeach);
    // If the previosu function showed the error message, no need to do it again
    if (this.state.showError) return;

    // If there is no SKU than skuObject is an error
    if (!skuObject.sku) {
      return alert(
        "SKU " + skuToSeach + " does not exist or could not be found."
      );
    }

    // // Convert vendorCode to a string instead of object ; don't need the whole vendor object, just the code.
    // var _vendorCode;
    // try {
    //   _vendorCode = skuObject.primaryVendor.vendorCode;
    // } catch (e) {
    //   _vendorCode = "";
    // }
    // delete skuObject.primaryVendor;
    // skuObject.primaryVendorCode = _vendorCode;
    // Pass it up, not creating
    this.props.getProduct(skuObject, false);
  };

  render() {
    if (this.props.creating) return null;
    return (
      <StyledSKUSearch>
        {this.state.showError ? (
          <ErrorMessage message={this.state.errorMessage} />
        ) : null}
        <InputGroup className="my-3 ">
          <FormControl
            placeholder="Enter SKU"
            aria-label="Enter SKU"
            aria-describedby="basic-addon2"
            value={this.state.product}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyPress}
          />
          <SKUSearchButtons
            creating={this.props.creating}
            handleSearch={this.handleSearch}
            handleCreateSKU={this.handleCreateSKU}
          />
        </InputGroup>
      </StyledSKUSearch>
    );
  }
}
