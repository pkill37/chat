let render = function (component, initState = {}, mountNode) {
  initState.render = function(stateRepresentation, options = {}) {
    const start = (options.focus) ? document.getElementById(options.focus).selectionStart : 0;

    (document.getElementById(mountNode) || {}).innerHTML = stateRepresentation

    if (options.focus) {
      let f = document.getElementById(options.focus)
      f.selectionStart = start
      f.focus()
    }
  }

  let stateRepresentation = component(initState)

  initState.render((typeof stateRepresentation === 'function' ) ? stateRepresentation() : stateRepresentation)
}

let intent = function(i, f) {
  window[i || '_'] = f
}

let value = function(el) {
  return document.getElementById(el).value
}
