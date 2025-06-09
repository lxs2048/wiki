import React, { CSSProperties } from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import { GridItemType } from "@site/src/data";

type GridListProps = {
  data?: Array<GridItemType>;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
};

// TODO - Card Design

export default function GridList({
  data = [],
  wrapperClassName,
  wrapperStyle,
}: GridListProps): JSX.Element {
  return (
    <div
      style={wrapperStyle}
      className={clsx(styles.listWrapper, wrapperClassName)}
    >
      {data.filter(i=>!i.hide).map((item) => {
        return (
          <Link target={'_blank'} key={item.title} className={styles.cardWrapper} to={item.link}>
            <img
              src={item.src}
              className={clsx(styles.image)}
              alt={item.title}
            />
            <div
              className={clsx(
                styles.title
              )}
            >
              {item.title}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
