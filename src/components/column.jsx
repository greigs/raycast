import Color from 'color';
import React from 'react';

export default function Column({
  color,
  distance,
  mapHeight,
  number,
  resolution,
  screenHeight,
  screenWidth,
}) {
  const height = Math.min(mapHeight / distance * 255, screenHeight);
  const width = screenWidth / resolution;
  const top = (screenHeight - height) / 2;
  const adjustedColor = Color(color).darken(distance / 460).hex();
  const styles = {
    backgroundColor: adjustedColor,
    height : Math.round(height),
    left: Math.round(number * width),
    width: Math.round(width),
    position: 'absolute',
    top : Math.round(top),
  };

  return <rect width={styles.width} height={styles.height} fill={styles.backgroundColor} x={styles.left} y={styles.top} />;
}
