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
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = React.useState({ width: 0, x: 0, opacity: 0 });

  React.useLayoutEffect(() => {
    const activeItem = itemRefs.current[activeId];
    if (!activeItem) return;

    setIndicatorStyle({
      width: activeItem.offsetWidth,
      x: activeItem.offsetLeft,
      opacity: 1,
    });
  }, [activeId, items]);

  return (
    <Box sx={styles.container} className={className} data-name="Segmented control">
      <Box
        aria-hidden
        sx={{
          ...styles.indicator,
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.x}px)`,
          opacity: indicatorStyle.opacity,
        }}
      />
      {items.map((item) => (
        <Box
          key={item.id}
          component="button"
          ref={(node: HTMLButtonElement | null) => {
            itemRefs.current[item.id] = node;
          }}
          onClick={() => onChange(item.id)}
          sx={{
            ...styles.item,
            ...(activeId === item.id ? styles.itemActive : {}),
          }}
          data-name={item.label}
          aria-pressed={activeId === item.id}
        >
          {item.label}
        </Box>
      ))}
    </Box>
  );
}
