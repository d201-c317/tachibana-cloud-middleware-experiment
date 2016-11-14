## Proof of Concept: Design of Backend Middleware
## 概念実証：バックエンド・ミドルウェアの設計
## 概念驗證：後端系統設計

This Repository hosts two middleware component written in Ruby and Node.js.

このリポジトリは、Node.jsとRubyでプログラムされた2ミドルウェアが含まれています。

此存儲庫包含兩個使用Node.js和Ruby編寫的中間件。

---

This version uses RabbitMQ as Message Broker.

此版本使用 RabbitMQ 作為Message Broker。

このバージョンは、Message Broker として RabbitMQ を使用しています。

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
* Ruby 2.3.1 w/ Bundler
* Node.js 6.3.1 w/ npm
* RabbitMQ
* Any REST Client
* Linux

### How To use? // 使い方 (英語のみ) // 食用方法 (English Only)

__To specify a remote RabbitMQ, prepend environment variable `AMQP_URI="amqp://your.rabbitmq.tld"` to `ruby index.rb` and `node index.js`, where `your.rabbitmq.tld` is the IP or domain name to your RabbitMQ Instance.__

__To specify an alternative port of the API, prepend environment variable like `PORT=3000` to `node index.js`, where `3000` is the desired port number__

1. Clone the Repository
2. Open at least 2 terminal windows
 * Terminal 1 (REST API) `cd node` then `npm install` finally `node index.js`
 * Terminal 2 `cd ruby` then `bundler install` finally `ruby index.rb`
 * Terminal 3 and further `ruby index.js`
3. Use HTTP POST method in your REST Client, Send a RAW payload as follows to `http://127.0.0.1:3000/send`
 * Get MD5 Hash of the payload `{"task":"hash","payload":"abc"}`
 * Reverse the payload string (abc => cba) `{"task":"rev","payload":"abc"}`
 * Echo back the payload `{"task":"echo","payload":"abc"}`
4. Use any Web Browser, navigate to `http://127.0.0.1:3000/history`, you will see history of messages, with response
5. To empty the history, navigate to `http://127.0.0.1:3000/clear`
6. To exit, Strike <kbd>CTRL</kbd>+<kbd>C</kbd> __TWICE__

![Screenshot](shot.png?raw=true "Screenshot")

## License
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Acknowledgements
* Authors of RabbitMQ Tutorials
* Developer of [amqplib](https://github.com/squaremo/amqp.node)
* Developer of [Bunny](https://github.com/ruby-amqp/bunny)

## TODO
* jRuby Version? (Migrate to March Hare)
* REST API Server in other programming language?
