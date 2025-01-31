import styles from "./DropdownList.module.css";
import { Cluster } from "../../constants/surveyConstants";
import BarChart from "../atoms/BarChart";
import * as utils from "../../utils/utils";
import Colorbox from "../atoms/Colorbox";
import DropdownManager from "./DropdownManager";

type DropdownListProps = {
  list: Cluster;
  index: number;
  toggleList: (index: number) => void;
  expanded: boolean;
  displayChart?: boolean; // display a chart for each list item.
  displayColorbox?: boolean; // display a color box for each list item.
};

/**
 * Dropdown list component to be used within a {@link DropdownManager}.
 */
export default function DropdownList({
  list,
  index,
  toggleList: toggleList,
  expanded,
  displayChart,
  displayColorbox,
}: DropdownListProps) {
  return (
    <div className={`${styles.container} ${expanded && styles.expanded}`}>
      <button className={styles.list_button} onClick={() => toggleList(index)}>
        {displayColorbox && <Colorbox label={list.name} color={list.color} />}
        <div className={styles.spacer}></div>
        <div className={styles.triangle}></div>
      </button>
      <ul className={styles.list}>
        {list.centroids.map((item) => (
          <li className={styles.item} key={item.id}>
            {displayChart && (
              <BarChart
                label={item.name}
                value={item.value}
                unit={utils.getUnit(item.name)}
              />
            )}
            {!displayChart && (
              <span className={styles.text}>{`${item.name}: ${
                Math.round(item.value * 100) / 100
              }`}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
