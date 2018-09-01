import React from 'react';
import Loop from '../utils/loop';
import Map from '../utils/map';
import Minimap from './minimap';
import Player from '../utils/player';
import Scene from './scene';
import Updater from './updater';
import toggleMinimap from '../updaters/toggle-minimap';
import { fromDegrees } from '../utils/radians';

const fov = fromDegrees(60);
const loop = new Loop();
const map = new Map(64);
const player = new Player(160, 160, fromDegrees(0));
const resolution = 320;

export default class App extends React.Component {
  state = { showMinimap: false }

  handleMinimapChange = () => {
    this.setState(toggleMinimap);
  }

  render() {
    const { showMinimap } = this.state;

    return (
      <Updater fov={fov} loop={loop} map={map} player={player} resolution={resolution}>
        {({ rays }) => (
          <div style={styles.container}>
            <div>
              <Scene
                height={400}
                mapHeight={map.height}
                player={player}
                rays={rays}
                resolution={resolution}
                width={740}
              />
              <span>Move using the w, s, a, d, ←, and → keys</span>
              <div>
                <label htmlFor="show_minimap">
                  Show minimap
                  <input id="show_minimap" onChange={this.handleMinimapChange} type="checkbox" value={showMinimap} />
                </label>
              </div>
            </div>
            {showMinimap && (
              <Minimap
                fov={fov}
                map={map}
                player={player}
                rays={rays}
                resolution={resolution}
                size={300}
              />
            )}
          </div>
        )}
      </Updater>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
  },
};
