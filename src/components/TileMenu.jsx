import { useEffect, useState, useRef } from "react";
import Tile from "./Tile";

function TileMenu(props) {
  const [tileData, setTileData] = useState(null);
  const menuContainerRef = useRef(null);
  const show_hide_buttonRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);

  // Fetch texture data from JSON file
  async function findTextureData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch texture data:", error);
      return null;
    }
  }

  useEffect(() => {
    findTextureData(props.url).then((data) => setTileData(data));
  }, [props.url]);

  useEffect(() => {
    console.log(tileData);
  }, [tileData]);

  useEffect(() => {
    if (showMenu) {
      show_hide_buttonRef.current.style.transform = "rotate(90deg)";
      menuContainerRef.current.style.left = "0%";
    } else {
      show_hide_buttonRef.current.style.transform = "rotate(-90deg)";
      menuContainerRef.current.style.left = "-30vw";
    }
  }, [showMenu]);

  return (
    <div className="tile_menu_container" ref={menuContainerRef}>
      <div
        className="show_hide_button"
        ref={show_hide_buttonRef}
        onClick={() => {
          setShowMenu((preValue) => !preValue);
        }}
      ></div>
      {tileData &&
        tileData.map((tile, index) => <Tile key={index} data={tile} />)}
    </div>
  );
}

export default TileMenu;
