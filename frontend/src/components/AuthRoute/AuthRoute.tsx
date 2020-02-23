import React from "react";
import { RouteProps, Redirect, Route } from "react-router-dom";
import useAuthContext from "context/AuthContext";

interface AuthRouteProps extends RouteProps {
  redirectUrl: string;
  component: React.ComponentType;
}

const AuthRoute: React.FC<AuthRouteProps> = ({
  redirectUrl,
  component,
  ...options
}) => {
  const RedirectComponent = () => <Redirect to={redirectUrl} />;
  const { authenticated } = useAuthContext();
  return (
    <Route
      {...options}
      component={authenticated ? component : RedirectComponent}
    />
  );
};

export default AuthRoute;
