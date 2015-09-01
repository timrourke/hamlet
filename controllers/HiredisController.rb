class HiredisController < ApplicationController
	@hiredis = Hiredis::Connection.new
	@hiredis.connect('127.0.0.1', 6379)

	def self.redis_write(key, value)
		@hiredis.write ["SET", key.to_s, value.to_s]
		@hiredis.read
	end

	def self.redis_read(key)
		@hiredis.write ["GET", key.to_s]
		@hiredis.read
	end

	def self.redis_save_token_id(user_id, iat, jti)
		redis_write(user_id, [iat, jti].to_json)
		puts '------------------------putsing redis token store value-------'
		puts JSON.parse(redis_read(user_id))
	end

	def self.redis_read_token_id(user_id)
		redis_read(user_id)
	end
end