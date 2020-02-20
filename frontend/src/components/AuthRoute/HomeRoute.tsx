import React from "react";
import { Route, RouteProps } from "react-router-dom";
import useAuthContext from "../../context/AuthContext";

interface HomeRouteProps extends RouteProps {
  authComponent: React.ComponentType;
  unAuthComponent: React.ComponentType;
}

const HomeRoute: React.FC<HomeRouteProps> = ({
  authComponent,
  unAuthComponent,
  ...options
}) => {
  const { authenticated } = useAuthContext();
  return (
    <Route
      {...options}
      component={authenticated ? authComponent : unAuthComponent}
    />
  );
};

export default HomeRoute;
