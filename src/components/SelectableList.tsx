import { useContext, useEffect, useRef, useState } from "react";
import styles from "./SelectableList.module.css";
import { MapContext } from "../context/MapContext";
import { MapAttribute, mapAttributes } from "../constants/mapConstants";
import * as mapbox from "../services/mapbox";

type SelectableListProps = {
  list: ListItem[];
  setAttribute?: (newAttribute: MapAttribute) => void;
  mappable?: boolean;
}

export type ListItem = {
  name: string;
  id: string;
}

export default function SelectableList({list, setAttribute, mappable}: SelectableListProps) {
  const [selectedItem, setSelectedItem] = useState<string>(list[0].name);
  const { map, parentLayer, color } = useContext(MapContext);

  useEffect(() => {
    // Update Mapping with the selected item on list update.
    setSelectedItem(list[0].name);
    updateMapping(list[0].name);
  }, [list])

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLLIElement>, index: number) => {

    // Highlight the selected item.
    const target = event.currentTarget as HTMLLIElement;
    itemRefs.current.forEach((item) => item?.classList.remove(styles.selected));
    target.classList.add(styles.selected);

    // Update the selected item.
    setSelectedItem(list[index].name);

    // Update Mapping with the selected item.
    updateMapping(list[index].name);
  }

  const updateMapping = (attributeName: string): void => {
    // Update Mapping with the selected item.
    if (map && mappable && parentLayer && color) {
      mapbox.updateLayerStyle(parentLayer, selectedItem, color, map);
    }
    // Update the attribute for map legned.
    if (setAttribute) {
      const newAttribute = mapAttributes.find((attribute) => attribute.name === attributeName);
      newAttribute ? setAttribute(newAttribute) : console.error("Attribute not found.");
    }
  }

  return (
    <ul className={styles.list}>
      {list.map((item, index) => (
        <li
          ref={(element) => itemRefs.current[index] = element} 
          className={`${styles.item} ${item.name === selectedItem && styles.selected}`}
          key={item.id}
          onClick={(event) => handleClick(event, index)}
        >
          <p className={styles.text}>{item.name}</p>
        </li>
      ))}
    </ul>
  );
}