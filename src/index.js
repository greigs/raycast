import Player from './utils/player';
import Map from './utils/map'    
import { fromDegrees } from './utils/radians';
import Color from 'color';
let root = document.getElementById('root')



const fov = fromDegrees(60)
const mapHeight = 64
const map = new Map(mapHeight)
const player = new Player(160, 160, fromDegrees(0))
const resolution = 20
const screenHeight = 240
const screenWidth = 320

const color="#0000FF"

//const rays = useCastRays(player, map, fov, resolution);

let rays = player.castRays(map, fov, resolution)

let sceneEls = 
    rays.map((ray, number) => {
        let distance = adjustDistance(ray, player)
        let height = Math.min(mapHeight / distance * 255, screenHeight)
        let width = screenWidth / resolution
        let top = (screenHeight - height) / 2
        let left = number * width
        let adjustedColor = Color(color).darken(distance / 460).hex()
        let el1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        el1.setAttribute('width', width)
        el1.setAttribute('height', Math.round(height))
        el1.setAttribute('x', Math.round(left))
        el1.setAttribute('y', Math.round(top))
        el1.setAttribute('fill',adjustedColor)
        return el1
    })

let svgroot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgroot.setAttribute('width',screenWidth)
svgroot.setAttribute('height',screenHeight)


sceneEls.forEach((el) => {
    svgroot.append(el)
})

root.append(svgroot)

//<rect width={styles.width} height={styles.height} fill={styles.backgroundColor} x={styles.left} y={styles.top}
function adjustDistance(ray, player) {
    return ray.distance * Math.cos(ray.angle - player.direction);
  }
  