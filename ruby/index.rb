#!/usr/bin/env ruby

require "bunny"

connection = Bunny.new
connection.start

channel    = connection.create_channel
queueIn    = channel.queue("in")
queueOut   = channel.queue("out")
prng       = Random.new
sysid      = ENV["SYSID"] || prng.rand(100)

puts " [!] Waiting for messages in #{queueIn.name}. To exit press CTRL+C"

queueIn.subscribe(:block => true) do |delivery_info, properties, body|
  puts " [I] Received #{body} @ #{properties.correlation_id}"

  msg = "{\"message\": \"#{body}\", \"taskID\": \"#{properties.correlation_id}\", \"sysid\": \"#{sysid}\"}"
  channel.default_exchange.publish(msg, :routing_key => queueOut.name, :correlation_id => properties.correlation_id)
  puts " [O] Sent #{msg}"

end
