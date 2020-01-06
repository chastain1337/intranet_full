import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Landing from "./Landing";
import Manual from "./manual/Manual";
import Ordering from "./ordering/Ordering";
import ProductData from "./product_data/ProductData";
import Storefront from "./storefront/Storefront";
import VendorInfo from "./vendor_info/VendorInfo";
import Receiving from "./receiving/Receiving";
import HighestNavbar from "./HighestNavbar";
import NotFound from "./NotFound";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route path="/manual" component={Manual} />
        <Route path="/ordering" component={Ordering} />
        <Route path="/productdata" component={ProductData} />
        <Route path="/storefront" component={Storefront} />
        <Route path="/vendorinfo" component={VendorInfo} />
        <Route path="/receiving" component={Receiving} />
        <Route component={NotFound} />
      </Switch>
      <HighestNavbar />
    </BrowserRouter>
  );
}

export default App;
