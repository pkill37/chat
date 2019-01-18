const PORT = process.env.PORT || 1337
const WebSocket = require('ws')
const http = require('http')
const he = require('he')
const uuidv4 = require('uuid/v4')
const Pairs = require('./pairs')
const utils = require('./utils')

const pairs = new Pairs()

const httpServer = http.createServer((request, response) => {})
httpServer.listen(PORT, () => utils.info(`Server is listening on port ${PORT}`))

const wsServer = new WebSocket.Server({ server: httpServer })
wsServer.on('connection', (ws, request) => {
  // Accept new client
  ws.ip = request.connection.remoteAddress
  ws.id = uuidv4()
  utils.info(`New connection from origin with IP address ${ws.ip} has been given the UUID ${ws.id}.`)

  // Pair the new connection with the first unpaired existing client
  if(pairs.pair(wsServer.clients)) {
    utils.success(`Pairing successful! ${pairs.toString()}`)
  } else {
    utils.warning(`Pairing unsuccessful! ${pairs.toString()}`)
  }

  // Route messages to the respective paired client
  ws.on('message', (message) => {
    const from = ws
    const to = pairs.get(ws)

    if (to) {
      utils.success(`Routing message from ${from.id} to ${to.id}.`)
      const obj = { time: (new Date()).getTime(), text: he.encode(message) }
      const json = JSON.stringify({ type: 'message', data: obj })
      to.send(json)
    } else {
      utils.error(`Could not route message from ${from.id} to undefined destination.`)
    }
  })

  // Unpair clients when either closes
  ws.on('close', () => {
    pairs.delete(ws)
    utils.info(`Client ${ws.id} disconnected. Attempting to repair the orphan client with another client...`)

    // Attempt to repair the client that lost its pair with the first unpaired existing client
    if(pairs.pair(wsServer.clients)) {
      utils.success(`Pairing successful! ${pairs.toString()}`)
    } else {
      utils.warning(`Pairing unsuccessful! ${pairs.toString()}`)
    }
  })
})
