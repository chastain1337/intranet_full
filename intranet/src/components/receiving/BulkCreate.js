import React, { useState } from "react";
import {
  Form,
  Col,
  Container,
  Card,
  Button,
  ProgressBar
} from "react-bootstrap";
import moment from "moment";
import Axios from "axios";

// Needs props: header, products, vendors
// optional: prefilledContent, forwardToPO

// To bulk create: paste data
//  parse data
//     create PO

export default function BulkCreate(props) {
  const [textBoxContent, setTextBoxContent] = useState(
    props.prefilledContent ? props.prefilledContent : ""
  );
  const [dataIsValid, setDataIsValid] = useState(false);
  const [validContent, setValidContent] = useState([]);
  const [contentIndexesOfVendors, setContentIndexesOfVendors] = useState([]);
  const [progress, setProgress] = useState(0);

  const validateData = () => {
    var content = textBoxContent.split("\n");
    let _contentIndexesOfVendors = [];
    const skusArray = props.products.map(product => product.sku);
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

    if (content.length === 0) return;
    content.forEach((row, index) => {
      if (!skusArray.includes(row[0]) && !props.vendors.includes(row[0])) {
        return window.alert(
          `Validation failed at row ${index + 1}. Vendor or SKU ${
            row[0]
          } is invalid. `
        );
      } // that cell is valid

      if (skusArray.includes(row[0])) {
        // this is a sku, validate that the following cell is a valid integer
        if (!Number.isInteger(Number(row[1]))) {
          return window.alert(
            `Validation failed on row ${index + 1}. ${
              row[1]
            } is not a valid integer.`
          );
        }
      } else {
        // this is a vendor, validate the Order Date
        _contentIndexesOfVendors.push(index);
        if (!moment(row[2], "MM/DD/YY").isValid()) {
          return window.alert(
            `Validation failed on row ${index + 1}. ${
              row[2]
            } is not a valid date.`
          );
        }
      }
    });

    // Check that the last line is a SKU and not a vendor (prevents blank POs)
    if (!skusArray.includes(content[content.length - 1][0]))
      return alert(
        "Final row is not a valid Purchase Order row. Cannot create empty Purchase Orders."
      );

    setValidContent(content);
    setContentIndexesOfVendors(_contentIndexesOfVendors);
    return setDataIsValid(true);
  };

  const submitContent = () => {
    /* Create multiple POObj's:
        - Make a post request to createPO to create it... (.then())
        -...then make a post request to updatePO with the necessary fields
        
      */

    let poObjs = [];
    let poObj = {};
    validContent.forEach((row, index) => {
      if (contentIndexesOfVendors.includes(index)) {
        if (index !== 0) {
          // calculate the totals of the po object and push it onto the array as it is done
          poObj.total_qty =
            Math.round(
              poObj.content.reduce((total, row) => {
                return total + Number(row.qty_ordered);
              }, 0) * 100
            ) / 100;
          poObj.total_outstanding_qty = poObj.total_qty;
          poObj.total_amount =
            Math.round(
              poObj.content.reduce((total, row) => {
                return total + Number(row.price_extended);
              }, 0) * 100
            ) / 100;

          poObj.total_outstanding_amount = poObj.total_amount;
          poObjs.push(poObj);
        }
        poObj = {
          number: row[1],
          vendor: row[0],
          orderDate: moment().format("M/D/YY"),
          dateCreated: Date.now(),
          content: []
        };
      } else {
        // this is a content row
        const productObject = props.products.find(prod => prod.sku === row[0]);
        poObj.content.push({
          sku: row[0],
          qty_ordered: Number(row[1]),
          line_id: `${Date.now()}-${index}`,
          part_number: productObject.partNumber,
          desc: productObject.desc,
          qty_outstanding: Number(row[1]),
          qty_recd: 0,
          price_unit: productObject.luc,
          price_extended: Math.round(productObject.luc * row[1] * 100) / 100
        });
      }
    });
    poObj.total_qty =
      Math.round(
        poObj.content.reduce((total, row) => {
          return total + Number(row.qty_ordered);
        }, 0) * 100
      ) / 100;
    poObj.total_outstanding_qty = poObj.total_qty;
    poObj.total_amount =
      Math.round(
        poObj.content.reduce((total, row) => {
          return total + Number(row.price_extended);
        }, 0) * 100
      ) / 100;

    poObj.total_outstanding_amount = poObj.total_amount;
    poObjs.push(poObj); // push the last one
    console.log(poObjs);

    const requests = poObjs.map(async (PO, index) => {
      await Axios.post("http://localhost:4000/receiving/bulkCreate", PO).then(
        res => {
          setProgress(((index + 1) / poObjs.length) * 100);
          return res.data;
        }
      );
    });

    Promise.all(requests).then(() => {
      console.log(requests);
      window.location = "/receiving/viewPOs";
    });
  };

  const handleTextBoxChange = e => {
    if (dataIsValid) setDataIsValid(false);
    setTextBoxContent(e.target.value.replace(/([^\\\0-9a-z A-Z_\.\-])+/g, ""));
  };

  return (
    <Container>
      <Card>
        <Card.Header>Paste Content</Card.Header>
        <Card.Body className="text-center">
          <Form.Group>
            <Form.Row>
              <Col>
                <Form.Control
                  as="textarea"
                  value={textBoxContent}
                  onChange={handleTextBoxChange}
                  placeholder="Paste here..."
                  style={{ height: "200px" }}
                />
              </Col>
              <Col>
                <div style={{ height: "200px", overflow: "scroll" }}>
                  {textBoxContent.replace(/\n/g, "\\n").replace(/\t/g, "\\t")}
                </div>
              </Col>
            </Form.Row>
          </Form.Group>
          <Button onClick={validateData} variant="secondary" className="mr-2">
            Validate
          </Button>
          <Button
            disabled={!dataIsValid}
            variant="success"
            onClick={submitContent}>
            Submit
          </Button>
          <ProgressBar className="mt-2" now={progress} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Header>Instructions</Card.Header>
        <Card.Body>
          <p>
            Paste the content for one or more Purchase Orders into the box on
            the left in either comma or tab separated values in "SKU,Qty"
            format. Begin each new purchase order with "Vendor,PO Number,Order
            Date (mm/dd/yy)". If any line begins with a valid vendor, all
            following lines until the next valid vendor will be counted in that
            Purchase Order. See example below.
          </p>
          <code>
            WTAS,WTZ19.11.08,11/08/19
            <br />
            SKU00 32,15
            <br />
            KTXZ,KTXZ19.11.08,11/08/19
            <br />
            SKU00 24,39
            <br />
            SKU00 92,13
            <br />
          </code>
        </Card.Body>
      </Card>
    </Container>
  );
}
