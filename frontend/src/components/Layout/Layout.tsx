import React from "react";
import { Switch, Route } from "react-router-dom";
import OfficialSiteBanner from "../OfficialSiteBanner";
import Header from "../Header";
import HomePage from "components/HomePage";

const Layout: React.FC = () => (
  <>
    <OfficialSiteBanner />
    <Header />
    <Switch>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/about" render={() => <div>About Page</div>} />
    </Switch>
  </>
);

export default Layout;
