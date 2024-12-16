import { useEffect, useRef, useContext } from "react";
import { SelectedTileContext } from "./SelectedTileContext";

function Tile(props) {
  const tileIconRef = useRef(null);
  const { selectedTile, setSelectedTile } = useContext(SelectedTileContext);

  useEffect(() => {
    if (tileIconRef.current) {
      tileIconRef.current.style.backgroundImage = `url("${props.data.roofTextureIconPath}")`;
    }
  }, [props.data.roofTextureIconPath]);

  return (
    <div
      className="tile_container"
      onClick={() => {
        setSelectedTile(props.data.roofTextureName);
      }}
    >
      <div className="tile_header">
        <p>{props.data.roofTextureTitle}</p>
      </div>
      <div className="tile_details">
        <div ref={tileIconRef} className="tile_icon"></div>{" "}
        {/* Attach ref here */}
        <div className="tile_info">
          <p>{props.data.roofTextureDescription}</p>
        </div>
      </div>
    </div>
  );
}

export default Tile;
