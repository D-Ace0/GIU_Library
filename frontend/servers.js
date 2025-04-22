// server.js
const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 3001

// serve static assets
app.use(express.static(path.join(__dirname, 'dist')))

// fallback to index.html for SPA
app.get('/*', (_, res) =>
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
)

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
)
