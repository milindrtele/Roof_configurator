import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import RoofViewer from "./components/RoofViewer";
import RoofDesigner from "./components/RoofDesigner";
import RoofEditor from "./components/RoofEditor";
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
          <Route path="/para_editor" element={<RoofEditor />} />
        </Routes>
      </FunctionContext.Provider>
    </Router>
  );
}

export default App;
