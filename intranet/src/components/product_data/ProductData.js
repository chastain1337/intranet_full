// Any CUD functionality needs to be put behind an admin login

import React from "react";
import SKUSearch from "./SKUSearch";
import DefaultData from "./DefaultData";
import ExtraData from "./ExtraData";
import Buttons from "./Buttons";
import { Container } from "react-bootstrap";

// put default fields in state

class ProductData extends React.Component {
  state = {
    product: null,
    defaultFields: [],
    customFields: [],
    creatingSKU: false
  };

  originalProduct = null;
  extraFieldsToHide = ["_id", "__v"];

  updateDefaultFields = productObj => {
    return [
      // display name, value, technical name, required, readOnly
      ["SKU", productObj.sku, "sku", true, true],
      ["On Order", productObj.onOrder, "onOrder", false, true],
      ["Available", productObj.available, "available", false, true],
      [
        "Order From Min Amount",
        productObj.orderFromMinAmount,
        "orderFromMinAmount",
        false,
        true
      ],
      ["Quantity to Order", productObj.qtyToOrder, "qtyToOrder", false, true],
      ["Description", productObj.desc, "desc", false, false],
      ["Part Number", productObj.partNumber, "partNumber", true, false],
      ["Vendor", productObj.primaryVendor, "primaryVendor", true, false],
      ["Min", productObj.min, "min", false, false],
      ["Max", productObj.max, "max", false, false],
      ["Case Pack", productObj.case, "case", false, false],
      ["Last Unit Cost", productObj.luc, "luc", true, false],
      ["Length", productObj.length_in, "length_in", false, false],
      ["Width", productObj.width_in, "width_in", false, false],
      ["Height", productObj.height_in, "height_in", false, false],
      ["Weight", productObj.weight_oz, "weight_oz", false, false],
      ["Location", productObj.location, "location", false, false]
    ];
  };

  addNewField = (name, value) => {
    this.setState(prevState => {
      const _newProduct = { ...prevState.product };
      _newProduct[name] = value;
      return { product: _newProduct };
    });
  };

  removeField = name => {
    this.setState(prevState => {
      var newProduct = { ...prevState.product };
      delete newProduct[name];
      return { product: newProduct };
    });
  };

  getProduct = (productObj, creating) => {
    if (productObj) {
      const newDefaultFields = this.updateDefaultFields(productObj);

      this.setState(
        {
          originalProduct: productObj,
          product: productObj,
          defaultFields: newDefaultFields,
          creatingSKU: creating
        },
        () => {
          this.originalProduct = { ...productObj };
        }
      );
    }
  };

  updateField = (name, value) => {
    const newProductObj = { ...this.state.product };
    newProductObj[name] = value;
    this.setState({ product: newProductObj });
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.product) {
      const newProductObj = JSON.stringify(this.state.product);
      const prevProductObj = JSON.stringify(prevState.product);

      if (newProductObj !== prevProductObj) {
        const newDefaultFields = this.updateDefaultFields(this.state.product);
        this.setState({
          defaultFields: newDefaultFields
        });
      }
    }
  };

  cancelCreate = () => {
    this.setState({
      product: null,
      defaultFields: [],
      customFields: [],
      creatingSKU: false
    });
  };

  getDefaultFields = () => {
    return this.state.defaultFields;
  };

  render() {
    return (
      <Container className="border">
        <SKUSearch
          getProduct={this.getProduct}
          creating={this.state.creatingSKU}
          defaultFields={this.state.defaultFields}
        />
        <DefaultData
          product={this.state.product}
          defaultFields={this.state.defaultFields}
          creating={this.state.creatingSKU}
          updateField={this.updateField}
          originalProduct={this.originalProduct}
        />
        <ExtraData
          product={this.state.product}
          defaultFields={this.state.defaultFields}
          customFields={this.state.customFields}
          creating={this.state.creatingSKU}
          addNewField={this.addNewField}
          updateField={this.updateField}
          removeField={this.removeField}
          extraFieldsToHide={this.extraFieldsToHide}
        />
        <Buttons
          product={this.state.product}
          defaultFields={this.state.defaultFields}
          customFields={this.state.customFields}
          creating={this.state.creatingSKU}
          cancelCreate={this.cancelCreate}
          getDefaultFields={this.getDefaultFields}
          originalProduct={this.originalProduct}
          extraFieldsToHide={this.extraFieldsToHide}
        />
      </Container>
    );
  }
}

export default ProductData;
