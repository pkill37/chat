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

let ChatApp = function({render}) {
  let state = { messages: [], message: '', render }

  if (!window.WebSocket) {
      console.log('no websocket support')
  }

  var connection = new WebSocket('ws://127.0.0.1:1337')
  connection.onopen = function () {
    console.log('open')
  }

  connection.onerror = (error) => {
    console.log('error')
  }

  connection.onmessage = (message) => {
    let json
    try {
      json = JSON.parse(message.data)
      console.log('Received', json)
    } catch (e) {
      console.log('Invalid JSON: ', message.data)
      return
    }
  }

  intent("addMessage", function(e) {
    const newMessage = {
      text: value("message"),
      id: Date.now()
    }
    state.messages.push(newMessage)
    connection.send(newMessage.text)
    state.message= ''
    state.render(representation())
    return false
  })

  let representation = () => `
      <div>
        <h4>Chat</h4>
        ${ChatMessages({messages:state.messages})}
        <form onsubmit="addMessage()">
          <input id="message" value=${state.message}>
          <button>Send</button>
        </form>
      </div>`

  return representation
}

let ChatMessages = ({messages, onclick}) => `
    <ul>
      ${messages.map(message => `<li key="${message.id}" ${(onclick) ? `onclick="${onclick}(${message.id})"` : ``}>${message.text}</li>`)}
    </ul>`

render(ChatApp, {}, "chat")
