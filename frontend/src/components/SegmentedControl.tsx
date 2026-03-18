"use client";

import * as React from "react";
import { Box, useTheme } from "@mui/material";
import { getSegmentedControlStyles } from "@/components/SegmentedControl.styles";

export interface SegmentedControlItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
}

export interface SegmentedControlProps {
  /** Array of items to display */
  items: SegmentedControlItem[];
  /** Currently active item ID */
  activeId: string;
  /** Callback when item is clicked */
  onChange: (id: string) => void;
  /** Optional CSS class name */
  className?: string;
}

export default function SegmentedControl({
  items,
  activeId,
  onChange,
  className,
}: SegmentedControlProps) {
  const theme = useTheme();
  const styles = getSegmentedControlStyles(theme);

  return (
    <Box sx={styles.container} className={className} data-name="Segmented control">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            ...styles.item,
            ...(activeId === item.id ? styles.itemActive : {}),
          }}
          data-name={item.label}
          aria-pressed={activeId === item.id}
        >
          {item.label}
        </button>
      ))}
    </Box>
  );
}
