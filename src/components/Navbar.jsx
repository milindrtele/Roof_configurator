import { Link } from "react-router-dom";
import Toolbar from "./Toolbar";

function Navbar(props) {
  return (
    <nav>
      <Link to="/">Viewer</Link>
      <Link to="/design">Designer</Link>
      <Link to="/para_editor">Editor</Link>
      <Toolbar />
    </nav>
  );
}

export default Navbar;
