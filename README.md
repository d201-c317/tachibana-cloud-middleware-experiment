## Proof of Concept: Design of Backend Middleware
## 概念実証：バックエンド・ミドルウェアの設計
## 概念驗證：後端系統設計

This Repository hosts two middleware component written in Ruby and Node.js.

このリポジトリは、Node.jsとRubyでプログラムされた2ミドルウェアが含まれています。

此存儲庫包含兩個使用Node.js和Ruby編寫的中間件。

#### Ruby
Middleware that execute tasks.
Currently, it just echoes back the message.

タスク実行のミドルウェア。
現在、メッセージを返信よりも何もできません。

執行任務的中間件。
現時它只能回傳接收到的信息。

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

1. Clone the Repository
2. Open at least 2 terminal windows
* Terminal 1
```
npm install
node ./node/index.js
```
* Terminal 2
```
cd ruby
bundler install
ruby index.js
```
* Terminal 3 and further
```
ruby ./ruby/index.js
```
3. Use HTTP POST method in your REST Client, Send this JSON payload as Raw to `http://127.0.0.1:3000/send`
```
{"message":"foo"}
```

4. Use any Web Browser, navigate to `http://127.0.0.1:3000/history`, you will see history of responded messages

5. To empty the history, navigate to `http://127.0.0.1:3000/clear`

![Screenshot](shot.png?raw=true "Screenshot")

## License
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## Acknowledgements
* Authors of RabbitMQ Tutorials
