import forEach from 'lodash.foreach';
import { useEffect, useReducer } from 'react';
import useAnimationFrame from './useAnimationFrame';

function reducer(state, action) {
  switch (action.type) {
    case 'down':
      return { ...state, [action.key]: true };
    case 'up':
      return { ...state, [action.key]: false };
    default:
      return state;
  }
}

export default function useKeyPressing(handlers) {
  const [state, dispatch] = useReducer(reducer, {});

  useAnimationFrame((elapsed) => {
    // Execute the handler for all keys that are being pressed.
    forEach(handlers, (value, key) => {
      if (state[key]) {
        value(elapsed);
      }
    });
  });

  useEffect(() => {
    const keyNames = Object.keys(handlers);

    function handleKeyDown(event) {
      if (keyNames.includes(event.key)) {
        // setKeys(state => ({ ...state, [event.key]: true }));
        dispatch({ type: 'down', key: event.key });
      }
    }

    function handleKeyUp(event) {
      if (keyNames.includes(event.key)) {
        // setKeys(state => ({ ...state, [event.key]: false }));
        dispatch({ type: 'up', key: event.key });
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlers]);
}
