const WebSocket = require("ws")
const express = require("express")
const http = require("http")

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

app.use(express.static("public")) // Serve static files

let votes = {}

let next_id = 0

let is_voting = false

wss.on("connection", (ws) => {
  console.log("A new client connected")
  ws.my_id = next_id
  next_id++

  ws.on("message", (message) => {
    message = Number(message)
    console.log(`Received: ${message}`)
    if (message === "get") {
      // Send back the vote summary as JSON
      ws.send(
        JSON.stringify({
          type: "vote_counts",
          left,
          right,
        })
      )

      return
    }
    if (message != 0 && message != 1 && message != -1) return
    votes[ws.my_id] = message
    console.log(votes)
  })

  ws.on("close", () => {
    console.log("Client disconnected")
    delete votes[ws.my_id]
  })
})

app.get("/get_votes", (req, res) => {
  let left = 0
  let right = 0

  for (const clientId in votes) {
    const direction = votes[clientId]
    if (direction === -1) left++
    if (direction === 1) right++
  }

  res.json({ left, right })
})

app.get("/start_game", (req, res) => {
  is_voting = false
  votes = {}
  console.log("Starting game")
})

app.get("/start_vote", (req, res) => {
  is_voting = true
  votes = {}
  console.log("Starting vote")
})
app.get("/stop_vote", (req, res) => {
  is_voting = false
  votes = {}
  console.log("Stopping vote")
})

server.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
)
