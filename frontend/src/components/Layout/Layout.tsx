import React from "react";
import { Switch, Route } from "react-router-dom";
import OfficialSiteBanner from "../OfficialSiteBanner";
import { HomeRoute } from "../AuthRoute";
import Header from "../Header";
import LoginPage from "../LoginPage";
import HomePage from "../HomePage";

const Layout: React.FC = () => (
  <>
    <OfficialSiteBanner />
    <Header />
    <Switch>
      <HomeRoute
        exact
        path="/"
        unAuthComponent={LoginPage}
        authComponent={HomePage}
      />
      <Route exact path="/about" render={() => <div>About Page</div>} />
    </Switch>
  </>
);

export default Layout;
