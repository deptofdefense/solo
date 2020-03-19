import React from "react";
import { Switch, Route } from "react-router-dom";
import { GovBanner } from "@trussworks/react-uswds";
import { Navbar, HomeRoute, AuthRoute } from "components";
import {
  PostLogoutPage,
  StatusPage,
  LoginPage,
  HomePage,
  EnterReceiptPage,
  ConfirmationOfReceiptPage,
  AdminPage
} from "pages";

const Layout: React.FC = () => (
  <>
    <GovBanner />
    <Navbar />
    <Switch>
      <HomeRoute
        exact
        path="/"
        unAuthComponent={LoginPage}
        authComponent={StatusPage}
      />
      <AuthRoute
        exact
        path="/d6t"
        component={EnterReceiptPage}
        redirectUrl="/"
      />
      <AuthRoute
        exact
        path="/cor"
        component={ConfirmationOfReceiptPage}
        redirectUrl="/"
      />
      <AuthRoute
        exact
        path="/adminpage"
        component={AdminPage}
        redirectUrl="/"
      />
      <Route exact path="/testpage" component={HomePage} />
      <Route exact path="/postlogout" component={PostLogoutPage} />
    </Switch>
  </>
);

export default Layout;
