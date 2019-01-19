let App = function({render}) {
  let state = {
    messages: [],
    message: '',
    paired: false,
    render: render,
  }

  // Confirm user wants to close app
  window.addEventListener('beforeunload', function (e) {
    e.preventDefault()
    e.returnValue = ''
  })

  let ws = new WebSocket('ws://127.0.0.1:1337')
  ws.onmessage = (message) => recvMessageHandler(JSON.parse(message.data))

  let representation = () => {
    if (!state.paired) {
        return `<div><p>Waiting to pair...</p></div>`
    } else if (!window.WebSocket) {
        return `<div><p>WebSocket is not supported...</p></div>`
    } else {
        return `<div>
            <h4>Chat</h4>
            ${state.messages.map(message => `<p>[${message.time}] ${message.text}</p>`)}
            <form onsubmit="sendMessage()">
                <input id="message" value=${state.message}>
                <button>Send</button>
            </form>
        </div>`
    }
  }

  let sendMessageHandler = (newMessage) => {
    ws.send(newMessage)
    state.message= ''
    state.render(representation())
    return false
  }

  let recvMessageHandler = (newMessage) => {
    if(newMessage.type === "message") {
      state.messages.push(newMessage)
    } else if(newMessage.type === "pair") {
      state.messages = []
      state.paired = true
    } else if(newMessage.type === "unpair") {
      state.messages = []
      state.paired = false
    }

    state.render(representation())
    return false
  }

  intent("sendMessage", function(e) {
    sendMessageHandler(value("message"))
  })

  return representation
}

render(App, {}, "app")
