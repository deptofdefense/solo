import React from "react";
import { BrowserRouter } from "react-router-dom";

import UserContextProvider from "context/AuthContextProvider";
import { Layout } from "pages";
import "./styles.scss";

const App: React.FC = () => (
  <UserContextProvider>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </UserContextProvider>
);

export default App;
