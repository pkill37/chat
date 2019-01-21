const BiMap = require('bidirectional-map')
const WebSocket = require('ws')

module.exports = class Pairs {
  constructor() {
    this.bimap = new BiMap()
  }

  set(e1, e2) {
    this.bimap.set(e1, e2)
  }

  get(e) {
    return this.bimap.has(e) ? this.bimap.get(e) : this.bimap.getKey(e)
  }

  delete(e) {
    this.bimap.delete(e)
    this.bimap.deleteValue(e)
  }

  has(e) {
    return this.bimap.has(e) || this.bimap.hasValue(e)
  }

  // naive O(n^2) pairing algorithm can likely be improved
  pair(clients) {
    for (let client1 of clients) {
      if (client1.readyState === WebSocket.OPEN && !this.has(client1)) {
        for (let client2 of clients) {
          if (client1 !== client2 && client2.readyState === WebSocket.OPEN && !this.has(client2)) {
            this.set(client2, client1)
            return true
          }
        }
      }
    }

    return false
  }

  toString() {
    let str = ``
    str += `${this.bimap.size} current pairs { `
      for(let [c1,c2] of this.bimap.entries()) {
        str += `${c1.id}: ${c2.id}, `
      }
      str += `}`
    return str
  }
}
