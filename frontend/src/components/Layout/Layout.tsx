import React from "react";
import { Switch, Route } from "react-router-dom";
import OfficialSiteBanner from "components/OfficialSiteBanner";
import { HomeRoute } from "components/AuthRoute";
import Header from "components/Header";
import LoginPage from "components/LoginPage";
import HomePage from "components/HomePage";
import PostLogoutPage from "components/PostLogoutPage";

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
      <Route exact path="/postlogout" component={PostLogoutPage} />
    </Switch>
  </>
);

export default Layout;
