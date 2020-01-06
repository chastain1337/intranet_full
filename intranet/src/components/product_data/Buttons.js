import React from "react";
import { Button, Card } from "react-bootstrap";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import AfterSaveProductModal from "./AfterSaveProductModal";
import axios from "axios";

export default class Buttons extends React.Component {
  state = {
    showConfirmDeleteModal: false,
    showAfterSaveProductModal: false,
    saveStatus: null,
    errMessage: null
  };
  raiseCustomError = (errCode, errMessage) => {
    return this.setState({
      saveStatus: errCode,
      errMessage: errMessage,
      showAfterSaveProductModal: true
    });
  };

  handleSave = async creating => {
    var newProduct = { ...this.props.product }; // Will replace entire skuobject in the database with this one, removing fields that aren't present, adding those that are

    if (creating) {
      console.log(`creating ${newProduct.sku}`);
    }

    // Validate vendor code
    var vendorCodes;
    // Validate that there IS  vendorCode

    // Get an array of all vendor codes
    await axios
      .get("http://localhost:4000/vendorinfo/allvendorcodes")
      .then(async res => {
        vendorCodes = res.data;
      })
      .catch(err => {
        return err;
      });

    // Check that the array contains the presetn vendor code
    if (!vendorCodes.includes(newProduct.primaryVendorCode)) {
      return this.raiseCustomError(
        999,
        `${newProduct.primaryVendorCode} is not a valid vendor.`
      );
    }

    // Validate other fields
    const fieldsThatShouldBeNumbers = [
      "min",
      "max",
      "case",
      "luc",
      "length_in",
      "width_in",
      "weight_oz",
      "height_in"
    ];

    for (var field of fieldsThatShouldBeNumbers) {
      if (newProduct[field]) {
        if (isNaN(parseInt(newProduct[field]))) {
          return this.raiseCustomError(
            999,
            `The value for ${field}, "${newProduct[field]}" is not a valid number.`
          );
        } else newProduct[field] = parseInt(newProduct[field]);
      }
    }

    await axios
      .post("http://localhost:4000/productdata/updateproduct", newProduct)
      .then(res => {
        this.setState({
          showAfterSaveProductModal: true,
          saveStatus: res.status
        });
      })
      .catch(err => {
        return err;
      });
  };

  handleDelete = () => {
    this.setState({ showConfirmDeleteModal: true });
  };

  handleCancelCreate = () => {
    this.props.cancelCreate();
  };

  deleteConfirmed = () => {
    const reqBody = { skuToDel: this.props.product.sku };
    axios
      .post("http://localhost:4000/productdata/deleteProduct", reqBody)
      .then(() => {
        window.location.reload();
      })
      .catch(err => {
        return err;
      });
  };

  hideConfirmDeleteModal = () => {
    this.setState({ showConfirmDeleteModal: false });
  };

  hideAfterSaveModal = () => {
    this.setState({ showAfterSaveProductModal: false });
  };

  render() {
    if (this.props.product) {
      return (
        <>
          <Card className="text-center">
            <Card.Body>
              <Button
                size="sm"
                onClick={() => {
                  this.handleSave(this.props.creating);
                }}
              >
                Save Product
              </Button>
              <>
                {this.props.creating ? (
                  <Button
                    size="sm"
                    onClick={this.handleCancelCreate}
                    className="ml-3"
                    variant="danger"
                  >
                    Cancel Creation
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={this.handleDelete}
                    className="ml-3"
                    variant="danger"
                  >
                    Delete Product
                  </Button>
                )}
              </>
            </Card.Body>
          </Card>
          <ConfirmDeleteModal
            deleteConfirmed={this.deleteConfirmed}
            show={this.state.showConfirmDeleteModal}
            onHide={this.hideConfirmDeleteModal}
          />
          <AfterSaveProductModal
            show={this.state.showAfterSaveProductModal}
            onHide={this.hideAfterSaveModal}
            status={this.state.saveStatus}
            errorMessage={this.state.errMessage}
          />
        </>
      );
    } else return null;
  }
}
