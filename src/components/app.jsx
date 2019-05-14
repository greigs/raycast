import React, { useState } from 'react';
import Map from '../utils/map';
import Player from '../utils/player';
import Scene from './scene';
import useCastRays from '../hooks/useCastRays';
import { fromDegrees } from '../utils/radians';

const fov = fromDegrees(60);
const map = new Map(64);
const player = new Player(160, 160, fromDegrees(0));
const resolution = 20;

export default function App() {
  const [showMinimap, setShowMinimap] = useState(true);
  const rays = useCastRays(player, map, fov, resolution);

  return (
        <Scene
          height={240}
          mapHeight={map.height}
          player={player}
          rays={rays}
          resolution={resolution}
          width={320}
        />
  );
}
