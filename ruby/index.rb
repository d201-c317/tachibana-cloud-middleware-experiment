#!/usr/bin/env ruby

require "bunny"
require "json"

connection = Bunny.new
connection.start

channel    = connection.create_channel
queue_in   = channel.queue("in")
queue_out  = channel.queue("out")
prng       = Random.new
sysid      = ENV["SYSID"] || prng.rand(100)

puts " [!] Waiting for messages in #{queue_in.name}. To exit press CTRL+C"

queue_in.subscribe(block: true) do |_, properties, body|
  puts " [I] Received #{body} @ #{properties.correlation_id}"
  msg = { message: body, taskid: properties.correlation_id, sysid: sysid }
  channel.default_exchange.publish(JSON.generate(msg), routing_key: queue_out.name, correlation_id: properties.correlation_id)
  puts " [O] Sent #{msg}"
end
