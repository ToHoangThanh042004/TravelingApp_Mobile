const jsonServer = require("json-server")
const server = jsonServer.create()
const router = jsonServer.router("db.json")
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.post("/auth/otp", (req, res) => {
  const { phone } = req.body
  res.json({ success: true, otp: "123456" })
})

server.post("/auth/verify", (req, res) => {
  const { phone, otp } = req.body

  if (otp !== "123456") {
    return res.status(401).json({ success: false, message: "Invalid OTP" })
  }

  const users = router.db.get("users")
  let user = users.find({ phone }).value()

  if (!user) {
    user = { id: Date.now(), phone, createdAt: new Date().toISOString() }
    users.push(user).write()
  }

  res.json({ success: true, user })
})

server.use(router)
server.listen(3001, '0.0.0.0', () => {
  console.log("✅ JSON Server running at http://192.168.1.18:3001")
  console.log("📱 Access from other devices on the network")
})
