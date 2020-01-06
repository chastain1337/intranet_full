import React, { useState } from "react";
import { Card, Accordion, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Axios from "axios";
import moment from "moment";

export default function CompileOrdering() {
  const [compilationStatus, setCompilationStatus] = useState("precompiled");
  const [ordersCreated, setOrdersCreated] = useState(-1);

  const compileInDatabase = () => {
    setCompilationStatus("compiling");
    Axios.get("http://localhost:4000/ordering/compile").then(res => {
      if (res.data.success) {
        setCompilationStatus("finished");
        setOrdersCreated(res.data.ordersCreated);
      }
    });
  };

  return (
    <Card>
      <Accordion.Toggle as={Card.Header} eventKey="2" className="text-center">
        3. Compile Ordering
      </Accordion.Toggle>
      <Accordion.Collapse eventKey="2">
        <Card.Body className="text-center">
          <p>
            Click the button to redirect to the ordering tab and display the
            results calculated in the previous step.
          </p>
          <Button
            className="mb-3"
            disabled={compilationStatus === "compiling"}
            onClick={compileInDatabase}>
            {compilationStatus === "precompiled"
              ? "Compile"
              : compilationStatus === "compiling"
              ? "Compiling"
              : "Compiled " + moment().format("M/D h:mma")}
          </Button>
          {ordersCreated > -1 ? (
            <>
              <p>
                {`${ordersCreated} unsubmitted order${
                  ordersCreated === 1 ? " was" : "s were"
                } created.`}
              </p>
              {ordersCreated > 0 ? (
                <>
                  <a href="/receiving/viewPOs?submitted=false">Click here</a> to
                  see {ordersCreated === 1 ? "it." : "them."}
                </>
              ) : null}
            </>
          ) : null}
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}
