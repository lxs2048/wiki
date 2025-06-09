import React, { CSSProperties } from "react";
import styles from "./styles.module.scss";
import clsx from "clsx";

type NotificationType = {
  show?: boolean;
  title?: string;
  changeShow: React.Dispatch<boolean>;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  errorIcon?:Boolean;
};

export default function Notification({
  show = false,
  title,
  changeShow,
  wrapperClassName,
  wrapperStyle,
  errorIcon
}: NotificationType): JSX.Element | null {
  return (
    <div
      className={clsx(
        styles.cardWrapper,
        show ? styles.show : styles.hidden,
        wrapperClassName
      )}
      style={wrapperStyle}
    >
      <div className={styles.contentWrapper}>
        {!errorIcon?'✅':'❌'}
        <div className={styles.title}>{title}</div>
        <svg
          className={styles.closeBtn}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          onClick={() => {
            changeShow(false);
          }}
        >
          <path d="M10.05 23.95a1 1 0 0 0 1.414 0L17 18.414l5.536 5.536a1 1 0 0 0 1.414-1.414L18.414 17l5.536-5.536a1 1 0 0 0-1.414-1.414L17 15.586l-5.536-5.536a1 1 0 0 0-1.414 1.414L15.586 17l-5.536 5.536a1 1 0 0 0 0 1.414z" />
        </svg>
      </div>
    </div>
  );
}
