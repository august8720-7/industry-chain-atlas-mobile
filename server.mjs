// 零依赖静态服务器,仅供本地预览(serves 项目根目录)。位于项目根,根路径直达 prototype 主线。
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 脚本就在项目根:serve 其所在目录,不依赖启动时的 cwd
const root = path.dirname(fileURLToPath(import.meta.url))
const PORT = 5185
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.svg': 'image/svg+xml' }

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  // 用真正的重定向而非内部改写:index.html 用相对路径引用 tokens.css/pages/*.js,
  // 相对路径按浏览器地址栏解析,必须让地址栏落在 /prototype/ 下,否则全部 404。
  if (p === '/') { res.writeHead(302, { location: '/prototype/index.html' }); res.end(); return }
  const f = path.join(root, p)
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('404 ' + p); return
  }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream', 'access-control-allow-origin': '*', 'cache-control': 'no-cache' })
  fs.createReadStream(f).pipe(res)
}).listen(PORT, () => console.log('prototype → http://localhost:' + PORT + '/prototype/index.html'))
