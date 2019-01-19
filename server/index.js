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
    // Notify both clients that they've been paired
    for(let p of [ws, pairs.get(ws)])
      if(p)
        p.send(JSON.stringify({ type: 'pair' }))
    utils.success(`Pairing successful! ${pairs.toString()}`)
  } else {
    utils.warning(`Pairing unsuccessful! ${pairs.toString()}`)
  }

  // Route messages
  ws.on('message', (message) => {
    const from = ws
    const to = pairs.get(ws)

    // Build packet
    const packet = JSON.stringify({ type: 'message', time: (new Date()).getTime(), text: he.encode(message) })

    // Send packet to destination
    if (to) {
      utils.success(`Routing message from ${from.id} to ${to.id}.`)
      to.send(packet)
    } else {
      utils.error(`Could not route message from origin ${from.id} to undefined destination.`)
    }

    // Send (processed) copy back to origin
    if (from) {
      from.send(packet)
    } else {
      utils.error(`Could not re-route message back to origin ${from.id}.`)
    }
  })

  // Unpair clients when either closes and notify the other party
  ws.on('close', () => {
    const unpaired = pairs.get(ws)
    if(unpaired) {
        pairs.delete(ws)
        unpaired.send(JSON.stringify({ type: 'unpair' }))
        utils.info(`Client ${ws.id} disconnected. Attempting to repair the orphan client with another client...`)
    }

    // Repair orphan with existing clients (thus avoiding waiting for a new connection)
    if(pairs.pair(wsServer.clients)) {
      for(let p of [unpaired, pairs.get(unpaired)])
        if(p)
          p.send(JSON.stringify({ type: 'pair' }))
      utils.success(`Pairing successful! ${pairs.toString()}`)
    } else {
      utils.warning(`Pairing unsuccessful! ${pairs.toString()}`)
    }
  })
})
