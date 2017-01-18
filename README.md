## Proof of Concept: Design of Backend Middleware
## 概念実証：バックエンド・ミドルウェアの設計
## 概念驗證：後端系統設計

[ ![Codeship Status for jm1666/nowhere-cloud-middleware-experiment](https://codeship.com/projects/74a8ecd0-8cbf-0134-aa3c-3ecc7e716f4a/status?branch=master)](https://codeship.com/projects/184819)

This Repository hosts two middleware component written in Ruby and Node.js.

このリポジトリは、Node.jsとRubyでプログラムされた2ミドルウェアが含まれています。

此存儲庫包含兩個使用Node.js和Ruby編寫的中間件。

---

This version uses RabbitMQ as Message Broker.

このバージョンは、Message Broker として RabbitMQ を使用しています。

此版本使用 RabbitMQ 作為Message Broker。

---

#### Ruby
Middleware that execute tasks.

タスク実行のミドルウェア。

執行任務的中間件。

#### Node.js
Middleware that act as REST API.

REST APIのミドルウェア。

REST API中間件。

### Requirements // システム必要条件 // 系統要求
* Ruby > 2.3.0 w/ Bundler
* Node.js 6.3.1 w/ npm (ES6/ECMAScript 6/ES2015 サポートが必要です) (ECMAScript 6 必要)
* RabbitMQ
* A web browser that support modern web technologies. (Google Chrome / Chromium / Firefox 推奨) (建議使用 Google Chomre / Chromium / Firefox)
* Linux (M$ Windows から残念です、申し訳ございません) (不支援 M$ Windows)

### How To use? // 使い方 (英語のみ) // 食用方法 (English Only)

__To specify a remote RabbitMQ, prepend environment variable `AMQP_URI="amqp://your.rabbitmq.tld"` to `ruby index.rb` and `node index.js`, where `your.rabbitmq.tld` is the IP or domain name to your RabbitMQ Instance.__

__To specify an alternative port of the API, prepend environment variable like `PORT=3001` to `node index.js`, where `3001` is the desired port number__

__To use the web UI with alternative port of API, prepend environment variable like `APIPORT=3001` to  `node bin/www`, where `3001` is the desired port number__

1. Clone the Repository
2. Open 3 terminal windows
 * Terminal 1 `cd node` then `npm install` finally `node index.js`
 * Terminal 2 `cd ruby` then `bundler install` finally `ruby index.rb`
 * Terminal 3 `cd node-webui` then `npm install` finally `node bin/www`
3. Open a web browser, navigate to `http://127.0.0.1:3000/` and try! (The web UI is quite basic, so no Documentations)
4. Use any Web Browser, navigate to `http://127.0.0.1:3000/history`, you will see history of messages, with response
5. To reset the environment, either navigate to `http://127.0.0.1:3001/clear` or just restart the API process.
6. To exit, Strike <kbd>CTRL</kbd>+<kbd>C</kbd> __TWICE__

If you just be simple, use any REST Client, send a JSON, with following payload, to `http://127.0.0.1:3001/send`

```json
{
    "task": "", // echo, rev, hash, revhash, hello. All other tasks will be dropped by the backend dyno.
    "payload": "Any String"
}
```

![Screenshot](shot.png?raw=true "Screenshot")

## Acknowledgements
* Authors of RabbitMQ Tutorials
* Developer of [amqplib](https://github.com/squaremo/amqp.node)
* Developer of [Bunny](https://github.com/ruby-amqp/bunny)

## TODO
* jRuby Version? (Migrate to March Hare)
* REST API Server in other programming language?

## Documentations
* [Node.js API](node/README.md)
* [Ruby Processor](https://rawgit.com/nowhere-cloud/middleware-experiment/master/ruby/doc/index.html)

### Footnote
* All Chinese (Traditional Script) and Japanese descriptions in this document are Machine-Translated Results. While Japanese results are interpreted afterwards, quality of Chinese descriptions are not assured.
