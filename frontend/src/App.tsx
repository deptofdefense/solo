import React from "react";
import { BrowserRouter } from "react-router-dom";

import "./styles.scss";
import Layout from "./components/Layout";

const App: React.FC = () => (
  <BrowserRouter>
    <Layout />
  </BrowserRouter>
);

export default App;
