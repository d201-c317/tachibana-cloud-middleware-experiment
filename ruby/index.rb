#!/usr/bin/env ruby

require "bunny"
require "json"
require "digest/md5"


# Class: Rabbit
# A class to maintain a list of function to communicate with RabbitMQ via Bunny gem. You Probably Don't wan't to touch this.
class Rabbit
  # Initialize by start connection
  def initialize
    @connection = Bunny.new(ENV["AMQP_URI"] || "amqp://localhost")
    @connection.start
    @channel = @connection.create_channel
  end

  # Message Queue Listener and Job Dispatcher
  def listen
    puts " [!] Waiting for messages. To exit press CTRL+C"
    queue_in.subscribe(block: true) do |_, properties, body|
      puts " [*] RECV @ #{properties.correlation_id}"
      Thread.new { Processor.process(body, properties.correlation_id) }
    end
  end

  # Message Queue Publisher
  def publish(message, corr)
    @channel.default_exchange.publish(message, routing_key: queue_out.name, correlation_id: corr)
    puts " [x] SENT @ #{corr}"
    @channel.close
    @connection.close
  end

  private

  # Set up the incoming queue
  def queue_in
    @channel.queue("in", durable: true)
  end

  # Set up the outgoing queue
  def queue_out
    @channel.queue("out", durable: true)
  end
end


# Class: Tools
# A Class To maintain a set of functions.
class Tools
  # Generate Random Number
  def self.random
    prng = Random.new
    prng.rand(100)
  end

  # MD5 Hash
  def self.md5
    Digest::MD5.new
  end

  # Reverse the string
  def self.reverse(string)
    string.to_s.reverse!
  end
end


# Class: Processor
# The main work logic.
class Processor
  # Process the Stuff.
  def self.process(message, msg_id)
    rabbit = Rabbit.new
    parsed = JSON.parse(message)
    puts " [x] Task : #{parsed['task']}"
    case parsed["task"]
    when "echo"
      payload = parsed["payload"]
    when "hash"
      payload = Tools.md5.hexdigest(parsed["payload"])
    when "rev"
      payload = Tools.reverse(parsed["payload"])
    when "revhash"
      payload = Tools.md5.hexdigest(Tools.reverse(parsed["payload"]))
    when "hello"
      payload = "hello world"
    else
      payload = ""
    end
    msg = JSON.generate(payload: payload, seq: parsed["id"], taskid: parsed["uuid"])
    rabbit.publish(msg, msg_id)
  end
end

rabbit = Rabbit.new
rabbit.listen
