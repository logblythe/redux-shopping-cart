import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hook";
import styles from "./CartLink.module.css";
import { getMemoizedTotalCount, getotalCount } from "./cartSlice";

export function CartLink() {
  const total = useAppSelector(getMemoizedTotalCount);
  return (
    <Link to="/cart" className={styles.link}>
      <span className={styles.text}>
        🛒&nbsp;&nbsp;{total > 0 ? total : "Cart"}
      </span>
    </Link>
  );
}
