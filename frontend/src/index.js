import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import { SeatProvider } from "./components/SeatSelect/SeatContext";

ReactDOM.render(
  <SeatProvider>
    <App />
  </SeatProvider>,
  document.getElementById("root")
);
