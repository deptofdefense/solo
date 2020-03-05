import React from "react";
import { Switch, Route } from "react-router-dom";
import { OfficialSiteBanner } from "solo-uswds";
import {
  HomePage,
  PostLogoutPage,
  Navbar,
  LoginPage,
  HomeRoute,
  StatusPage
} from "components";

const Layout: React.FC = () => (
  <>
    <OfficialSiteBanner />
    <Navbar />
    <Switch>
      <HomeRoute
        exact
        path="/"
        unAuthComponent={LoginPage}
        authComponent={StatusPage}
      />
      <Route exact path="/testpage" component={HomePage} />
      <Route exact path="/postlogout" component={PostLogoutPage} />
    </Switch>
  </>
);

export default Layout;
