let setAttr = true
Math.hypot = function(x, y){ return Math.sqrt(x*x + y*y) }
let infinityPoint = new Point(Infinity, Infinity)
let tmpPoint = new Point(0,0)

/* Point */
function Point(x, y) {
    this.x = x;
    this.y = y;
  }
  
  
  
  // Return the dist between this point and another.
  Point.prototype.dist = function (other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  };

/* Map */
 function Map(height) {
    this.height = height;
    this.size = 10;
   this.tmpx = 0
   this.tmpy = 0
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
    this.tmpx = Math.floor(point.x / this.height);
    this.tmpy = Math.floor(point.y / this.height);
    return this.isWithinBoundsxy(this.tmpx,this.tmpy) && this.grid[this.tmpy][this.tmpx] === 1;
  };
  
  Map.prototype.isWithinBounds = function (point) {
    this.tmpx = Math.floor(point.x / this.height);
    this.tmpy = Math.floor(point.y / this.height);
    return this.tmpx >= 0 && this.tmpx < this.size && this.tmpy >= 0 && this.tmpy < this.size;
  };

  Map.prototype.isWithinBoundsxy = function (x,y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  };
  
 

/* Radians */  
const twoPi = 2 * Math.PI;

// Convert degrees to radians.
function fromDegrees(degrees) {
  return degrees * Math.PI / 180;
}

// Ensure that radians are between 0 and 2π.
function normalize(radians) {
  const newAngle = radians % twoPi;
  return newAngle < 0 ? newAngle + twoPi : newAngle;
}

/* Ray */

function Ray(map, angle, origin) {
    this.origin = origin;
    this.angle = normalize(angle);
    this.dist = cast(map, this.angle, origin);
  }
  
  // Determine the dist travelled before hitting a wall.
  function cast(map, angle, origin) {
    // Determine the direction the ray is travelling.
    const up = angle > 0 && angle < Math.PI;
    const right = angle < (twoPi * 0.25) || angle > (twoPi * 0.75);
  
    // Determine the dist to the first horizontal wall.
    const horizontaldist = castHorizontal(map, origin, angle, up, right);
  
    // Determine the dist to the first vertical wall.
    const verticaldist = castVertical(map, origin, angle, up, right);
  
    // Return the shortest dist between the horizontal and vertical dists.
    return Math.min(horizontaldist, verticaldist);
  }
  
  // Determine the dist travelled before hitting a _horizontal_ wall.
  function castHorizontal(map, origin, angle, up, right) {
    // Calculate the coordinates of the first intersection with a grid boundary.
    const intersectionY = Math.floor(origin.y / map.height) * map.height + (up ? -0.01 : map.height);
    const intersectionX = origin.x + (origin.y - intersectionY) / Math.tan(angle);
    tmpPoint.x = intersectionX;
    tmpPoint.y = intersectionY;
  
    // Calculate the change in x and y coordinates needed to iterate across grid boundaries.
    const deltaY = up ? -map.height : map.height;
    const deltaX = Math.abs(map.height / Math.tan(angle)) * (right ? 1 : -1);
  
    // Find the nearest wall and return the dist to it.
    const wall = findWall(map, tmpPoint, deltaX, deltaY);
    return wall.dist(origin);
  }
  
  // Determine the dist travelled before hitting a _vertical_ wall.
  function castVertical(map, origin, angle, up, right) {
    // Calculate the coordinates of the first intersection with a grid boundary.
    const intersectionX = Math.floor(origin.x / map.height) * map.height + (right ? map.height : -0.01);
    const intersectionY = origin.y + (origin.x - intersectionX) * Math.tan(angle);
    tmpPoint.x = intersectionX;
    tmpPoint.y = intersectionY;
  
    // Calculate the change in x and y coordinates needed to iterate across grid boundaries.
    const deltaX = right ? map.height : -map.height;
    const deltaY = Math.abs(map.height * Math.tan(angle)) * (up ? -1 : 1);
  
    // Find the nearest wall and return the dist to it.
    const wall = findWall(map, tmpPoint, deltaX, deltaY);
    return wall.dist(origin);
  }
  
  // Process each step the ray takes until encountering a wall or the bounds of the map.
  function findWall(map, position, deltaX, deltaY) {
    // If the ray is no longer within the bounds of the map, return a point infinitely far away.
    if (!map.isWithinBounds(position)) {
      return infinityPoint;
    }
  
    // If the ray has hit a wall, return its position.
    if (map.isWall(position)) {
      return position;
    }
    position.x += deltaX;
    position.y += deltaY;
    // No wall has been encountered. Iterate to the next grid boundary and check again.
    return findWall(map, position, deltaX, deltaY);
  }
  

  /* Player */

  
const stepdist = 1.4; // per 16ms
const turnRotation = 0.025; // per 16ms

function Player(x, y, direction) {
  this.position = new Point(x, y);
  this.direction = direction;
}

// Determine the dist to walls the user can see by casting rays of light from the player's
// eyes and figuring out where they intersect with a wall. The `resolution` is the number of rays
// to cast, and `fov` determines how spread apart they will be.
Player.prototype.castRays = function (map, fov, resolution) {
  // If the field of view is 60 degrees and the resolution is 320, there is 60 / 320 degrees
  // between each ray.
  const angleBetweenRays = fov / resolution;

  const p = this;
  // The player's direction is the center of the screen, and the left edge of the screen is half
  // the field of view to the left. In our coordinate system, angles increase as we turn counter-
  // clockwise, so we add to player's current direction.
  const startAngle = this.direction + fov / 2;

  // Generate the angle for each ray starting from the left and sweeping to the right screen edge.
  //const rayAngles = new Array(resolution).fill(0).map((_, index) => startAngle - index * angleBetweenRays);
  const arr = Array.apply(null, Array(resolution)).map(Number.prototype.valueOf,0);
  const rayAngles2 = arr.map(function(_, index){return startAngle - index * angleBetweenRays});
  // Calculate the dist from each ray to the nearest wall.
  return rayAngles2.map(function(angle,index){ return new Ray(map, angle, p.position)});
};

Player.prototype.castRays2 = function (map, fov, resolution, rays) {
  // If the field of view is 60 degrees and the resolution is 320, there is 60 / 320 degrees
  // between each ray.
  const angleBetweenRays = fov / resolution;

  const p = this;
  // The player's direction is the center of the screen, and the left edge of the screen is half
  // the field of view to the left. In our coordinate system, angles increase as we turn counter-
  // clockwise, so we add to player's current direction.
  const startAngle = this.direction + fov / 2;

  // Generate the angle for each ray starting from the left and sweeping to the right screen edge.
  //const rayAngles = new Array(resolution).fill(0).map((_, index) => startAngle - index * angleBetweenRays);
  rays.forEach(function(ray, index){
     ray.map = map
     ray.angle = startAngle - index * angleBetweenRays
     ray.position = p.position
     ray.angle = normalize(ray.angle);
     ray.dist = cast(map, ray.angle, ray.origin);

  })
};

Player.prototype.turnRight = function (elapsed) {
  this.direction -= turnRotation * elapsed / 16;
};

Player.prototype.turnLeft = function (elapsed) {
  this.direction += turnRotation * elapsed / 16;
};

Player.prototype.moveForward = function (map, elapsed) {
  const deltaX = stepdist * (elapsed / 16) * Math.cos(this.direction);
  const deltaY = stepdist * (elapsed / 16) * Math.sin(this.direction);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(deltaX, 0), deltaX),
    adjustDelta(map, this.position.add(0, -deltaY), -deltaY),
  );
};

Player.prototype.moveBackward = function (map, elapsed) {
  const deltaX = stepdist * (elapsed / 16) * Math.cos(this.direction);
  const deltaY = stepdist * (elapsed / 16) * Math.sin(this.direction);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(-deltaX, 0), -deltaX),
    adjustDelta(map, this.position.add(0, deltaY), deltaY),
  );
};

// Step to the left, which is the same as stepping forward but rotated 90 degrees to the left.
Player.prototype.moveLeft = function (map, elapsed) {
  const deltaX = stepdist * (elapsed / 16) * Math.cos(this.direction + Math.PI / 2);
  const deltaY = stepdist * (elapsed / 16) * Math.sin(this.direction + Math.PI / 2);

  this.position = this.position.add(
    adjustDelta(map, this.position.add(deltaX, 0), deltaX),
    adjustDelta(map, this.position.add(0, -deltaY), -deltaY),
  );
};

// Step to the right, which is the same as stepping backward but rotated 90 degrees to the left.
Player.prototype.moveRight = function (map, elapsed) {
  const deltaX = stepdist * (elapsed / 16) * Math.cos(this.direction + Math.PI / 2);
  const deltaY = stepdist * (elapsed / 16) * Math.sin(this.direction + Math.PI / 2);

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



/* Main */

function adjustdist(ray, player) {
    return ray.dist * Math.cos(ray.angle - player.direction);
}


const subtractLight = function(color, amount){
    let cc = parseInt(color,16) - amount;
    let c = (cc < 0) ? 0 : (cc);
    c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
    return c;
}
  
  
const darken = (color, amount) =>{
    color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
    amount = Math.round(amount * 255);
    return `#${subtractLight(color.substring(0,2), amount)}${subtractLight(color.substring(2,4), amount)}${subtractLight(color.substring(4,6), amount)}`;
}


const fov = fromDegrees(60)
const mapHeight = 64
const map = new Map(mapHeight)
const player = new Player(160, 160, fromDegrees(0))
const resolution = 15
const screenHeight = 300
const screenWidth = 300

//let color="#FF0000"
let frames= []

let rays = player.castRays(map, fov, resolution)
let els = rays.map(function(_, number){return document.getElementById(number + 'r')})

var dist = adjustdist(rays[0], player)
var height = Math.min(mapHeight / dist * 255, screenHeight)
var width = screenWidth / resolution
var top1 = ((screenHeight - height) / 2)
var left = (0 * width)
//var adjustedColor = darken(color, dist / 460)
var el1 = els[0]

rays.forEach(function(ray, number) {
  
  dist = adjustdist(rays[number], player)
 height = Math.min(mapHeight / dist * 255, screenHeight)
 width = screenWidth / resolution
 top1 = ((screenHeight - height) / 2)
 left = (number * width)
 //adjustedColor = darken(color, dist / 460)
 el1 = els[number]
  el1.width = Math.round(width)
  //el1.height = Math.round(height)
  el1.x = Math.round(left)
  //el1.y = Math.round(top1)
  //el1.style.fill = adjustedColor
  if (setAttr){
    //el1.setAttribute('width', Math.round(width))
    el1.setAttribute('width', Math.round(width))
    //el1.setAttribute('x', Math.round(left))
    el1.setAttribute('x', Math.round(left))
    //el1.setAttribute('fill',adjustedColor)
  }

})




function callback(timestamp) {
  // Perform animation frame logic here
 
  player.turnLeft(100)
  player.castRays2(map, fov, resolution, rays)

  
  width = screenWidth / resolution
  rays.forEach(function(ray, number) {
    
    dist = adjustdist(ray, player)
    height = Math.min(mapHeight / dist * 255, screenHeight)
    
    top1 = ((screenHeight - height) / 2)
    //left = (number * width)
    //adjustedColor = darken(color, dist / 460)
    el1 = els[number]
    //el1.width = Math.floor(width)
    el1.height = Math.floor(height)
    //el1.x = Math.floor(left)
    el1.y = Math.floor(top1)
    //el1.style.fill = adjustedColor
    if (setAttr){
      //el1.setAttribute('width', Math.round(width))
      el1.setAttribute('height', Math.round(height))
      //el1.setAttribute('x', Math.round(left))
      el1.setAttribute('y', Math.round(top1))
      //el1.setAttribute('fill',adjustedColor)
    }
})
  // Request next frame
  requestAnimationFrame(callback);
}

requestAnimationFrame(callback);