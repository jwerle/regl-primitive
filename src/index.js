'use strict'

/**
 * Module dependencies.
 */
const isArray = Array.isArray

/**
 * Predicate to determine if input x is
 * array like.
 *
 * @private
 * @param {Mixed} x
 * @return {Boolean}
 */

function isArrayLike(x) {
  return isArray(x) || x.length
}

/**
 * Type expecation error helper.
 *
 * @private
 * @param {String} what
 * @param {String} type
 * @param {Mixed} input
 * @return {TypeError}
 */

function TypeExpectationError(what, type, input) {
  return new TypeError('Expecting '+what+' to be a '+type+'. Got '+ typeof input)
}

/**
 * Creates a regl draw command from a simplicial complex
 * with optional attributes.
 *
 * @public
 * @default
 * @param {Function} regl
 * @param {Object} complex
 * @param {Object?} configuration
 */

module.exports = createREGLPrimitive
function createREGLPrimitive(regl, complex, configuration) {
  if (!regl || 'function' != typeof regl) {
    throw TypeExpectationError('regl', 'function', regl)
  }

  if (!complex || 'object' != typeof complex) {
    throw TypeExpectationError('complex', 'object', complex)
  }

  if (configuration && 'object' != typeof configuration) {
    throw TypeExpectationError('configuration', 'object', configuration)
  }

  if (false == isArrayLike(complex.positions)) {
    throw TypeExpectationError('complex.positions', 'array', complex.positions)
  }

  if (complex.normals && false == isArrayLike(complex.normals)) {
    throw TypeExpectationError('complex.normals', 'array', complex.normals)
  }

  if (complex.cells && false == isArrayLike(complex.cells)) {
    throw TypeExpectationError('complex.cells', 'array', complex.cells)
  }

  if (complex.uvs && false == isArrayLike(complex.uvs)) {
    throw TypeExpectationError('complex.uvs', 'array', complex.uvs)
  }

  /**
   * Initial regl draw command state derived from
   * optional input configuration.
   */

  const state = Object.assign({
    attributes: {},
    uniforms: {}
  }, configuration)

  /**
   * Sets attribute on regl state if
   * truthy.
   */

  function attribute(k, x) {
    if (x) { state.attributes[k] = x }
  }

  /**
   * Sets uniform on regl state if
   * truthy.
   */

  function uniform(k, x) {
    if (x) { state.uniforms[k] = x }
  }

  /**
   * Sets a state property.
   */

  function set(k, v) {
    if (undefined !== v) {
      if ('object' == typeof v && 'object' == typeof state[k]) {
        Object.assign(state[k], v)
      } else {
        state[k] = v
      }
    }
  }

  /**
   * Configures regl state.
   */

  function configure(k) {
    if (configuration && configuration[k]) {
      set(k, configuration[k])
    }
  }

  // sets regl draw command attributes
  attribute('position', complex.positions)
  attribute('normal', complex.normals)
  attribute('uv', complex.uvs)

  // set regl draw command uniforms

  // configure regl draw command state
  set('elements', complex.cells)

  return regl(state)
}
