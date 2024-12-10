import { useState, useRef, useEffect, useContext } from "react";
import Toolbar from "./Toolbar";
import { FunctionContext } from "./FunctionContext";

function Navbar() {
  const { roofDesignerAction } = useContext(FunctionContext);

  const handleClick = (button_name) => {
    roofDesignerAction(button_name);
  };

  return (
    <div className="tool_bar_parent">
      <button
        id="extrude"
        className="button"
        onClick={() => {
          handleClick("extrude");
        }}
      >
        <p>extrude</p>
      </button>
    </div>
  );
}

export default Navbar;
