import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import RoofViewer from "./components/RoofViewer";
import RoofDesigner from "./components/RoofDesigner";
import Navbar from "./components/Navbar";
import { FunctionContext } from "./components/FunctionContext";

function App() {
  const [roofDesignerAction, setRoofDesignerAction] = useState(() => () => {
    console.warn("roofDesignerAction is not set yet.");
  }); //() => () => {}
  return (
    <Router>
      <FunctionContext.Provider
        value={{ roofDesignerAction, setRoofDesignerAction }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<RoofViewer />} />
          <Route path="/design" element={<RoofDesigner />} />
        </Routes>
      </FunctionContext.Provider>
    </Router>
  );
}

export default App;
