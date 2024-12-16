import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import RoofViewer from "./components/RoofViewer";
import RoofDesigner from "./components/RoofDesigner";
import RoofEditor from "./components/RoofEditor";
import Navbar from "./components/Navbar";
import { FunctionContext } from "./components/FunctionContext";
import { SelectedTileContext } from "./components/SelectedTileContext";

function App() {
  const [roofDesignerAction, setRoofDesignerAction] = useState(() => () => {
    console.warn("roofDesignerAction is not set yet.");
  }); //() => () => {}
  const [selectedTile, setSelectedTile] = useState(null);

  return (
    <Router>
      <FunctionContext.Provider
        value={{ roofDesignerAction, setRoofDesignerAction }}
      >
        <SelectedTileContext.Provider value={{ selectedTile, setSelectedTile }}>
          {/* <Navbar /> */}
          <Routes>
            <Route path="/" element={<RoofViewer />} />
            {/* <Route path="/design" element={<RoofDesigner />} />
            <Route path="/para_editor" element={<RoofEditor />} /> */}
          </Routes>
        </SelectedTileContext.Provider>
      </FunctionContext.Provider>
    </Router>
  );
}

export default App;
