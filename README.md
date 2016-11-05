## Proof of Concept: Design of Backend Middleware
## 概念実証：バックエンド・ミドルウェアの設計
## 概念驗證：後端系統設計

This Repository hosts two middleware component written in Ruby and Node.js.

このリポジトリは、Node.jsとRubyでプログラムされた2ミドルウェアが含まれています。

此存儲庫包含兩個使用Node.js和Ruby編寫的中間件。

#### Ruby
Middleware that execute tasks.

タスク実行のミドルウェア。

執行任務的中間件。

#### Node.js
Middleware that act as REST API.

REST APIのミドルウェア。

REST API中間件。

### Requirements // システム必要条件 // 系統要求
* Ruby 2.3.0 w/ Bundler
* Node.js 6.3.1 w/ npm
* RabbitMQ
* Any REST Client
* Linux

### How To use? // 使い方 (英語のみ) // 食用方法 (English Only)

* Clone the Repository
* Open at least 2 terminal windows
 * Terminal 1 `npm install && node ./node/index.js`
 * Terminal 2 `cd ruby && bundler install && ruby index.rb`
 * Terminal 3 and further `ruby ./ruby/index.js`
* Use HTTP POST method in your REST Client, Send a RAW payload as follows to `http://127.0.0.1:3000/send`
* Get MD5 Hash of the payload
```
{"task":"hash","payload":"abc"}
```
* Reverse the payload string (abc => cba)
```
{"task":"rev","payload":"abc"}
```
* Echo back the payload
```
{"task":"echo","payload":"abc"}
```
* Use any Web Browser, navigate to `http://127.0.0.1:3000/history`, you will see history of messages, with response
* To empty the history, navigate to `http://127.0.0.1:3000/clear`

![Screenshot](shot.png?raw=true "Screenshot")

## License
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Acknowledgements
* Authors of RabbitMQ Tutorials
