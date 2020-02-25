import React from "react";
import { render } from "test-utils";
import AuthRoute from "../AuthRoute";
import HomeRoute from "../HomeRoute";

const testAuthComponent = () => <div>auth component</div>;
const testUnauthComponent = () => <div>unauth component</div>;

describe("protected route components", () => {
  it("home route renders authComponent when user is authenticated", () => {
    const { queryByText } = render(
      <HomeRoute
        authComponent={testAuthComponent}
        unAuthComponent={testUnauthComponent}
      />,
      {
        authContext: {
          authenticated: true
        }
      }
    );
    expect(queryByText("auth component")).toBeInTheDocument();
  });

  it("home route renders unAuthComponent when user is not authenticated", () => {
    const { queryByText } = render(
      <HomeRoute
        authComponent={testAuthComponent}
        unAuthComponent={testUnauthComponent}
      />,
      {
        authContext: {
          authenticated: false
        }
      }
    );
    expect(queryByText("unauth component")).toBeInTheDocument();
  });

  it("auth route renders component when user is authenticated", () => {
    const { queryByText } = render(
      <AuthRoute component={testAuthComponent} redirectUrl="/" />,
      {
        authContext: {
          authenticated: true
        }
      }
    );
    expect(queryByText("auth component")).toBeInTheDocument();
  });

  it("auth route redirects to redirectUrl when user is not authenticated", async () => {
    const { queryByText } = render(
      <AuthRoute component={testAuthComponent} redirectUrl="/" />,
      {
        authContext: {
          authenticated: false
        }
      }
    );
    expect(queryByText("auth component")).not.toBeInTheDocument();
  });
});
