export default function Camera(canvasContext, resolution, focalLength) {
  this.canvasContext = canvasContext
  this.resolution = resolution
  this.focalLength = focalLength
}

Camera.prototype.render = function (map, player) {
}
