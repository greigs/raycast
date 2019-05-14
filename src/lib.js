/* Point */
export function Point(x, y) {
    this.x = x;
    this.y = y;
  }
  
  // Return a new point with the values incremented by the passed-in values.
  Point.prototype.add = function (x, y) {
    return new Point(this.x + x, this.y + y);
  };
  
  // Return the distance between this point and another.
  Point.prototype.distance = function (other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  };

/* Map */
 export function Map(height) {
    this.height = height;
    this.size = 10;
    this.grid = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
  }
  
  Map.prototype.isWall = function (point) {
    const gridCoordinates = toGrid(point, this.height);
    return this.isWithinBounds(point) && this.grid[gridCoordinates.y][gridCoordinates.x] === 1;
  };
  
  Map.prototype.isWithinBounds = function (point) {
    const gridCoordinates = toGrid(point, this.height);
    return gridCoordinates.x >= 0 && gridCoordinates.x < this.size && gridCoordinates.y >= 0 && gridCoordinates.y < this.size;
  };
  
  // Convert unit coordinates to grid coordinates. Each grid coordinate can be broken up into
  // some number of smaller "unit" coordinates.
  function toGrid(point, unitsPerGrid) {
    return new Point(Math.floor(point.x / unitsPerGrid), Math.floor(point.y / unitsPerGrid));
  }

/* Radians */  
export const twoPi = 2 * Math.PI;

// Convert degrees to radians.
export function fromDegrees(degrees) {
  return degrees * Math.PI / 180;
}

// Ensure that radians are between 0 and 2π.
export function normalize(radians) {
  const newAngle = radians % twoPi;
  return newAngle < 0 ? newAngle + twoPi : newAngle;
}

/* Ray */

export function Ray(map, angle, origin) {
    this.origin = origin;
    this.angle = normalize(angle);
    this.distance = cast(map, this.angle, origin);
  }
  
  // Determine the distance travelled before hitting a wall.
  function cast(map, angle, origin) {
    // Determine the direction the ray is travelling.
    const up = angle > 0 && angle < Math.PI;
    const right = angle < (twoPi * 0.25) || angle > (twoPi * 0.75);
  
    // Determine the distance to the first horizontal wall.
    const horizontalDistance = castHorizontal(map, origin, angle, up, right);
  
    // Determine the distance to the first vertical wall.
    const verticalDistance = castVertical(map, origin, angle, up, right);
  
    // Return the shortest distance between the horizontal and vertical distances.
    return Math.min(horizontalDistance, verticalDistance);
  }
  
  // Determine the distance travelled before hitting a _horizontal_ wall.
  function castHorizontal(map, origin, angle, up, right) {
    // Calculate the coordinates of the first intersection with a grid boundary.
    const intersectionY = Math.floor(origin.y / map.height) * map.height + (up ? -0.01 : map.height);
    const intersectionX = origin.x + (origin.y - intersectionY) / Math.tan(angle);
    const intersection = new Point(intersectionX, intersectionY);
  
    // Calculate the change in x and y coordinates needed to iterate across grid boundaries.
    const deltaY = up ? -map.height : map.height;
    const deltaX = Math.abs(map.height / Math.tan(angle)) * (right ? 1 : -1);
  
    // Find the nearest wall and return the distance to it.
    const wall = findWall(map, intersection, deltaX, deltaY);
    return wall.distance(origin);
  }
  
  // Determine the distance travelled before hitting a _vertical_ wall.
  function castVertical(map, origin, angle, up, right) {
    // Calculate the coordinates of the first intersection with a grid boundary.
    const intersectionX = Math.floor(origin.x / map.height) * map.height + (right ? map.height : -0.01);
    const intersectionY = origin.y + (origin.x - intersectionX) * Math.tan(angle);
    const intersection = new Point(intersectionX, intersectionY);
  
    // Calculate the change in x and y coordinates needed to iterate across grid boundaries.
    const deltaX = right ? map.height : -map.height;
    const deltaY = Math.abs(map.height * Math.tan(angle)) * (up ? -1 : 1);
  
    // Find the nearest wall and return the distance to it.
    const wall = findWall(map, intersection, deltaX, deltaY);
    return wall.distance(origin);
  }
  
  // Process each step the ray takes until encountering a wall or the bounds of the map.
  function findWall(map, position, deltaX, deltaY) {
    // If the ray is no longer within the bounds of the map, return a point infinitely far away.
    if (!map.isWithinBounds(position)) {
      return new Point(Infinity, Infinity);
    }
  
    // If the ray has hit a wall, return its position.
    if (map.isWall(position)) {
      return position;
    }
  
    // No wall has been encountered. Iterate to the next grid boundary and check again.
    return findWall(map, position.add(deltaX, deltaY), deltaX, deltaY);
  }
  

  /* Player */

  
const stepDistance = 1.4; // per 16ms
const turnRotation = 0.025; // per 16ms

export function Player(x, y, direction) {
  this.position = new Point(x, y);
  this.direction = direction;
}

// Determine the distance to walls the user can see by casting rays of light from the player's
// eyes and figuring out where they intersect with a wall. The `resolution` is the number of rays
// to cast, and `fov` determines how spread apart they will be.
Player.prototype.castRays = function (map, fov, resolution) {
  // If the field of view is 60 degrees and the resolution is 320, there is 60 / 320 degrees
  // between each ray.
  const angleBetweenRays = fov / resolution;

  // The player's direction is the center of the screen, and the left edge of the screen is half
  // the field of view to the left. In our coordinate system, angles increase as we turn counter-
  // clockwise, so we add to player's current direction.
  const startAngle = this.direction + fov / 2;

  // Generate the angle for each ray starting from the left and sweeping to the right screen edge.
  const rayAngles = new Array(resolution).fill(0).map((_, index) => startAngle - index * angleBetweenRays);

  // Calculate the distance from each ray to the nearest wall.
  return rayAngles.map(angle => new Ray(map, angle, this.position));
};

Player.prototype.turnRight = function (elapsed) {
  this.direction -= turnRotation * elapsed / 16;
};

Player.prototype.turnLeft = function (elapsed) {
  this.direction += turnRotation * elapsed / 16;
};

Player.prototype.moveForward = function (map, elapsed) {
  const deltaX = stepDistance * (elapsed / 16) * Math.cos(this.direction);
  const deltaY = stepDistance * (elapsed / 16) * Math.sin(this.direction);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(deltaX, 0), deltaX),
    adjustDelta(map, this.position.add(0, -deltaY), -deltaY),
  );
};

Player.prototype.moveBackward = function (map, elapsed) {
  const deltaX = stepDistance * (elapsed / 16) * Math.cos(this.direction);
  const deltaY = stepDistance * (elapsed / 16) * Math.sin(this.direction);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(-deltaX, 0), -deltaX),
    adjustDelta(map, this.position.add(0, deltaY), deltaY),
  );
};

// Step to the left, which is the same as stepping forward but rotated 90 degrees to the left.
Player.prototype.moveLeft = function (map, elapsed) {
  const deltaX = stepDistance * (elapsed / 16) * Math.cos(this.direction + Math.PI / 2);
  const deltaY = stepDistance * (elapsed / 16) * Math.sin(this.direction + Math.PI / 2);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(deltaX, 0), deltaX),
    adjustDelta(map, this.position.add(0, -deltaY), -deltaY),
  );
};

// Step to the right, which is the same as stepping backward but rotated 90 degrees to the left.
Player.prototype.moveRight = function (map, elapsed) {
  const deltaX = stepDistance * (elapsed / 16) * Math.cos(this.direction + Math.PI / 2);
  const deltaY = stepDistance * (elapsed / 16) * Math.sin(this.direction + Math.PI / 2);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(-deltaX, 0), -deltaX),
    adjustDelta(map, this.position.add(0, deltaY), deltaY),
  );
};

// Perform collision-detection to determine if a proposed new position for the player is a valid
// one. If it is, return the proposed delta. Otherwise, return 0.
function adjustDelta(map, proposed, delta) {
  return map.isWall(proposed) ? 0 : delta;
}

