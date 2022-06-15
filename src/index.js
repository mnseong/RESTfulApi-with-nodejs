// @ts-check

const http = require('http')
const { routes } = require('./api')

const server = http.createServer((req, res) => {
  async function main() {
    const route = routes.find(
      (route) =>
        req.url &&
        req.method &&
        route.url.test(req.url) &&
        route.method == req.method
    )
    if (!req.url || !route) {
      res.statusCode = 404
      res.end('Not found.')
      return
    }
    const regexpResult = route.url.exec(req.url)
    if (!regexpResult) {
      res.statusCode = 404
      res.end('Not found.')
      return
    }
    /** @type {Object.<string, *> | undefined} */
    const reqBody =
      (req.headers['content-type'] === 'application/json' &&
        (await new Promise((resolve, reject) => {
          req.setEncoding('utf-8')
          req.on('data', (data) => {
            try {
              resolve(JSON.parse(data))
            } catch {
              reject(new Error('Ill-formed json'))
            }
          })
        }))) ||
      undefined
    // console.log(body)

    // 여기서 부터는 Route가 있다고 TypeScript에서 판단
    const result = await route.callback(regexpResult, reqBody)
    res.statusCode = result.statusCode
    if (typeof result.body === 'string') {
      res.end(result.body)
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(result.body))
    }
  }
  main()
})
const PORT = 4000
server.listen(PORT, () => {
  console.log('The server is listening at port: ${PORT}')
})
