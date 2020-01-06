import React from "react";
import Panel from "./Panel";
import { StyledPanel } from "../Styles";

const Landing = () => {
  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <StyledPanel className="col">
          <Panel sectionId="manual" />
        </StyledPanel>
        <StyledPanel className="col mx-3">
          <Panel sectionId="ordering" />
        </StyledPanel>
      </div>
      <div className="row mb-3">
        <StyledPanel className="col">
          <Panel sectionId="productdata" />
        </StyledPanel>
        <StyledPanel className="col mx-3">
          <Panel disabled sectionId="storefront" />
        </StyledPanel>
      </div>
      <div className="row mb-3">
        <StyledPanel className="col">
          <Panel disabled sectionId="vendorinfo" />
        </StyledPanel>
        <StyledPanel className="col mx-3">
          <Panel sectionId="receiving" />
        </StyledPanel>
      </div>
    </div>
  );
};

export default Landing;
