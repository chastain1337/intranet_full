import React, { useState } from "react";
import { Card, Accordion, Button, Spinner } from "react-bootstrap";
import Axios from "axios";

export default function ConnectInventory() {
  const [file, setFile] = useState(null);
  const [uploadResults, setUploadResults] = useState("");

  const handleUpload = e => {
    setFile(e.target.files[0]);
  };

  const uploadFile = () => {
    if (!file) return;
    setUploadResults({ waiting: true });
    Axios.post("http://localhost:4000/ordering/inventoryFile", file).then(
      res => {
        setUploadResults(res.data);
      }
    );
  };

  return (
    <Card>
      <Accordion.Toggle as={Card.Header} eventKey="0" className="text-center">
        1. Connect Inventory File
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="0">
        <Card.Body>
          <p>
            <strong>
              Upload an inventory file to establish the currently available
              inventories of each product.
            </strong>
          </p>
          <p>
            Any products not included in the inventory file will retain their
            previous available inventory. The file must be a CSV containing rows
            of "SKU,Qty" combinations. Any invalid SKUs or non-integer
            quantities will be ignored. This file should contain the{" "}
            <i>available</i>, not <i>on-hand</i> quantities of each product.
          </p>
          {uploadResults.finished ? null : (
            <div className="input-group">
              <div className="input-group-prepend">
                <Button
                  variant="success"
                  onClick={uploadFile}
                  disabled={uploadResults.waiting}>
                  {uploadResults.waiting ? (
                    <>
                      <Spinner animation="border" variant="success" size="sm" />{" "}
                      Loading
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
              <div className="custom-file">
                <input
                  type="file"
                  className="custom-file-input"
                  aria-describedby="inputGroupFileAddon01"
                  onChange={handleUpload}
                  disabled={uploadResults.waiting}
                />
                <label className="custom-file-label">
                  {file ? file.name : "Choose file"}
                </label>
              </div>
            </div>
          )}
          {uploadResults.finished ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Successes: {uploadResults.succ.length}</th>
                    <th>Failures: {uploadResults.fail.length}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <textarea
                        rows="6"
                        readOnly
                        value={
                          uploadResults.succ.length > 0
                            ? uploadResults.succ.reduce(
                                (string, sku) => string + "\n" + sku
                              )
                            : ""
                        }
                      />
                    </td>
                    <td>
                      <textarea
                        readOnly
                        rows="6"
                        value={
                          uploadResults.fail.length > 0
                            ? uploadResults.fail.reduce(
                                (string, sku) => string + "\n" + sku
                              )
                            : ""
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : null}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}
