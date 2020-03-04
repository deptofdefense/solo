import React from "react";
import { Switch, Route } from "react-router-dom";
import { OfficialSiteBanner } from "solo-uswds";
import {
  HomePage,
  PostLogoutPage,
  Navbar,
  LoginPage,
  HomeRoute
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
        authComponent={HomePage}
      />
      <Route exact path="/about" render={() => <div>About Page</div>} />
      <Route exact path="/postlogout" component={PostLogoutPage} />
    </Switch>
  </>
);

export default Layout;
