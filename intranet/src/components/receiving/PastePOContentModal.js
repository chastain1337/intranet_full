import React from "react";
import {
  Modal,
  Form,
  Button,
  Card,
  Col,
  Container,
  Accordion
} from "react-bootstrap";

export default class PastePOContentModal extends React.Component {
  state = {
    textBoxContent: ""
  };

  submitContent = () => {
    const editableHeaders = this.props.headers.filter(header => !header[2]);
    var content = this.state.textBoxContent.split("\n");

    const tabDelimited = content[0].search(/\t/) > 0;
    if (tabDelimited) {
      content = content.map(row => row.split("\t"));
    } else {
      content = content.map(row => row.split(","));
    }
    if (
      content[content.length - 1].length === 1 &&
      content[content.length - 1][0] === ""
    ) {
      content.splice(content.length - 1, 1);
    }
    // When mapping back through, lookup any values that are blank
    const rowObjects = [];

    // Delete all invalid SKUs
    const allSkusArr = this.props.products.map(product => product.sku);
    content = content.filter(contentRow => allSkusArr.includes(contentRow[0]));
    if (content.length === 0) return;

    content.forEach(contentRow => {
      let rowObj = {};
      editableHeaders.forEach((header, index) => {
        const prop = header[1];
        var value = contentRow[index];

        switch (prop) {
          case "qty_ordered":
            if (isNaN(value)) {
              value = 0;
            } else {
              value = parseInt(value);
            }
            break;
          case "part_number":
            if (!value || value === null || value === "") {
              value = this.props.products.find(
                product => product.sku === rowObj.sku
              )["partNumber"];
            }
            break;
          case "desc":
            if (!value || value === null || value === "") {
              value = this.props.products.find(
                product => product.sku === rowObj.sku
              )["desc"];
            }
            break;
          case "price_unit":
            if (isNaN(value) || !value) {
              value = this.props.products.find(
                product => product.sku === rowObj.sku
              )["luc"];
            }
            break;
          case "price_extended":
            value =
              Math.round(rowObj.qty_ordered * rowObj.price_unit * 100) / 100;
            break;
        }
        rowObj[prop] = value;
      });
      rowObj.qty_outstanding = rowObj.qty_ordered;
      rowObj.qty_recd = 0;
      rowObjects.push(rowObj);
    });

    this.props.updateRowsWithPastedValues(rowObjects);
  };

  handleChange = e => {
    this.setState({ textBoxContent: e.target.value });
  };
  render() {
    return (
      <Modal
        aria-labelledby="contained-modal-title-vcenter"
        size="lg"
        centered
        show={this.props.show}
        onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Paste Purchase Order Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Row>
              <Col>
                <Form.Control
                  as="textarea"
                  value={this.state.textBoxContent}
                  onChange={this.handleChange}
                  placeholder="Paste here..."
                  style={{ height: "200px" }}
                />
              </Col>
              <Col>
                <div style={{ height: "200px", overflow: "scroll" }}>
                  {this.state.textBoxContent
                    .replace(/\n/g, "\\n")
                    .replace(/\t/g, "\\t")}
                </div>
              </Col>
            </Form.Row>
          </Form.Group>
          <Accordion>
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="0">
                Show Help
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  Paste the Purchase Order content as comma or tab separated
                  values in the same order, excluding Q.Out and Q.Rec. You can
                  paste as many lines as you wish. New lines are identified by
                  the <code>\n</code> character. Tabs are identified by matching
                  the <code>\t</code> character. Blank fields can be indicated
                  by using two commas or two tabs. Blank fields in Part Number,
                  Description, and Unit Price will trigger a look-up of these
                  fields. If Total Price does not = Q.Ord * Unit Price it will
                  be calculated as such,
                  <i>
                    it is therefore reccomended to leave this field out and let
                    it auto-calculate.
                  </i>
                  See examples below:
                  <Card className="mt-1">
                    <code>
                      [sku,quantity,part_number,desc,unit_cost,extended_cost]
                      <br />
                      SKU1,5,PartNumber1,,4.71,23.55
                      <br />
                      SKU2,18,,,5.13
                      <br />
                      SKU3,11,PartNumber1,Desc1,0 SKU1,5,PartNumber1,,4.71,23.55
                    </code>
                  </Card>
                  or
                  <Card className="mt-1">
                    <code>
                      [sku \t quantity \t part_number \t desc \t unit_cost \t
                      extended_cost]
                      <br />
                      SKU1 \t 5 \t PartNumber1 \t "" \t 4.71 \t 23.55
                      <br />
                      SKU2 \t 18 \t "" \t "" \t 5.13
                      <br />
                      SKU3 \t 11 \t PartNumber1 \t Desc1 \t 0
                    </code>
                  </Card>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.submitContent}>Submit</Button>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
