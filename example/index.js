'use strict'

/**
 * Module dependencies.
 */

const Primitive = require('../')
const normals = require('angle-normals')
const Camera = require('regl-camera')
const bunny = require('bunny')
const clamp = require('clamp')
const regl = require('multi-regl')()

// primitives
const Icosphere = require('primitive-icosphere')
const Capsule = require('primitive-capsule')
const Sphere = require('primitive-sphere')
const Torus = require('primitive-torus')
const Cube = require('primitive-cube')

// vertex shader
const vert = `
precision mediump float;
uniform mat4 projection, view;
attribute vec3 position, normal;
varying vec3 vnormal;
void main () {
  vnormal = normal;
  gl_Position = projection * view * vec4(position, 1.0);
}
`

// fragment shader
const frag = `
precision mediump float;
varying vec3 vnormal;
void main () {
  gl_FragColor = vec4(abs(vnormal), 1.0);
}
`

// dom query helper
const dom = (s) => document.querySelector(s)

// regl camera position
const position = [0, 0, 0]

// regl contexts
const context = {
  icosphere: regl(dom('#icosphere')),
  capsule: regl(dom('#capsule')),
  sphere: regl(dom('#sphere')),
  torus: regl(dom('#torus')),
  bunny: regl(dom('#bunny')),
  cube: regl(dom('#cube')),
}

// one camera per context
const cameras = {
  icosphere: Camera(context.icosphere, {center: position, mouse: false, fov: Math.PI / 3}),
  capsule: Camera(context.capsule, {center: position, mouse: false, fov: Math.PI / 3}),
  sphere: Camera(context.sphere, {center: position, mouse: false, fov: Math.PI / 3}),
  bunny: Camera(context.bunny, {center: [0, 2.5, 0], mouse: false, fov: Math.PI / 3}),
  torus: Camera(context.torus, {center: position, mouse: false, fov: Math.PI / 3}),
  cube: Camera(context.cube, {center: position, mouse: false, fov: Math.PI / 3}),
}

// geometry
const geometry = {
  icosphere: Icosphere(),
  capsule: Capsule(),
  sphere: Sphere(1, {segments: 16}),
  torus: Torus(),
  bunny: bunny,
  cube: Cube(),
}

// regl primitives
const primitives = {
  icosphere: Primitive(context.icosphere, geometry.icosphere, {vert, frag}),
  capsule: Primitive(context.capsule, geometry.capsule, {vert, frag}),
  sphere: Primitive(context.sphere, geometry.sphere, {vert, frag}),
  torus: Primitive(context.torus, geometry.torus, {vert, frag}),
  bunny: Primitive(context.bunny, Object.assign(geometry.bunny, {
    normals: normals(bunny.cells, bunny.positions)
  }), {vert, frag}),
  cube: Primitive(context.cube, geometry.cube, {vert, frag}),
}

// export for console usage
Object.assign(window, {
  primitives,
  geometry,
  position,
  cameras,
  context,
  dom,
})

for (let key in context) {
  const primitive = primitives[key]
  const camera = cameras[key]
  const ctx = context[key]
  let theta = 0

  // render loop !
  ctx.frame(({time}) => {
    ctx.clear({ color: [0, 0, 0, 0], depth: true })
    camera({theta: (theta += camera.theta + 0.01)}, () => {
      if ('function' == typeof primitive) {
        primitive()
      }
    })
  })
}
