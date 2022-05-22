const app = require('./app')

const port = 3999;

app.listen(port, () => {
  console.log(`Server running. Use our API on port: ${port}`)
})
