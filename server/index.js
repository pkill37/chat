const PORT = process.env.PORT || 1337
const WebSocket = require('ws')
const http = require('http')
const he = require('he')
const uuidv4 = require('uuid/v4')
const BiMap = require('bidirectional-map')

const log = (message) => console.log('[' + new Date().toISOString() + '] ' + message)

const printPairs = (pairs) => {
    log(`${pairs.size} current pairs`)
    for(let [c1,c2] of pairs.entries()) {
        console.log(`\t- ${c1.id} <---> ${c2.id}`)
    }
}

const pairs = new BiMap()

const httpServer = http.createServer((request, response) => {})
httpServer.listen(PORT, () => log(`Server is listening on port ${PORT}`))

const wsServer = new WebSocket.Server({ server: httpServer })
wsServer.on('connection', (ws, request) => {
  ws.ip = request.connection.remoteAddress
  ws.id = uuidv4()
  log(`New connection from origin ${ws.ip} has been given the ID ${ws.id}.`)

  // Pair the new connection with the first unpaired existing client
  for (let client of wsServer.clients) {
    if (client !== ws && client.readyState === WebSocket.OPEN && pairs.getKey(client) === undefined && pairs.get(client) === undefined) {
      pairs.set(ws, client)
      printPairs(pairs)
      break
    }
  }

  // Route messages to the respective paired client
  ws.on('message', (message) => {
    log(`Routing message from ${ws.id} to ${pairs.get(ws).id}`)

    // Send message to the paired client
    const obj = { time: (new Date()).getTime(), text: he.encode(message) }
    const json = JSON.stringify({ type: 'message', data: obj })
  })

  // Unpair clients when either closes
  ws.on('close', () => {
    log(`Peer ${ws.id} disconnected.`)
    pairs.delete(ws)
    printPairs(pairs)
  })
})
