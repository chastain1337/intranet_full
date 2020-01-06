import React, { useState } from "react";
import { Card, Accordion, Button, Spinner } from "react-bootstrap";
import Axios from "axios";
import moment from "moment";

export default function CalculateOrdering() {
  const [status, setStatus] = useState("unstarted");

  const calculateOrdering = () => {
    setStatus("loading");
    Axios.get("http://localhost:4000/ordering/calculate").then(res => {
      setStatus(res.data);
    });
  };

  return (
    <Card>
      <Accordion.Toggle as={Card.Header} eventKey="1" className="text-center">
        2. Calculate Ordering
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="1">
        <Card.Body className="text-center">
          <p>
            Click the button to connect all relevant databases and calculate
            which vendors and what parts need to be ordered.
          </p>
          <Button disabled={status === "loading"} onClick={calculateOrdering}>
            {status === "unstarted" ? (
              "Calculate"
            ) : status === "finished" ? (
              "Calculated " + moment().format("M/D h:mma")
            ) : (
              <>
                <Spinner size="sm" />
                Calculating
              </>
            )}
          </Button>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}
