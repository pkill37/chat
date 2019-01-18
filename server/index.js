const PORT = process.env.PORT || 1337
const DEBUG = process.env.DEBUG || true

const WebSocket = require('ws')
const http = require('http')
const he = require('he')
const uuidv4 = require('uuid/v4')
const Pairs = require('./pairs')

const log = (message) => {
  if(DEBUG) {
    console.log('[' + new Date().toISOString() + '] ' + message)
  }
}

const pairs = new Pairs()

const httpServer = http.createServer((request, response) => {})
httpServer.listen(PORT, () => log(`Server is listening on port ${PORT}`))

const wsServer = new WebSocket.Server({ server: httpServer })
wsServer.on('connection', (ws, request) => {
  ws.ip = request.connection.remoteAddress
  ws.id = uuidv4()
  log(`New connection from origin with IP address ${ws.ip} has been given the UUID ${ws.id}.`)

  // Pair the new connection with the first unpaired existing client
  if(pairs.pair(wsServer.clients))
    log(pairs.toString())

  // Route messages to the respective paired client
  ws.on('message', (message) => {
    const from = ws
    const to = pairs.get(ws)

    if (to) {
      log(`Routing message from ${from.id} to ${to.id}`)
      const obj = { time: (new Date()).getTime(), text: he.encode(message) }
      const json = JSON.stringify({ type: 'message', data: obj })
      to.send(json)
    }
  })

  // Unpair clients when either closes
  ws.on('close', () => {
    log(`Peer ${ws.id} disconnected.`)
    pairs.delete(ws)

    // Repair the client that lost its pair with the first unpaired existing client
    log(`Attempting to repair clients...`)
    if(pairs.pair(wsServer.clients))
      log(pairs.toString())
  })
})
