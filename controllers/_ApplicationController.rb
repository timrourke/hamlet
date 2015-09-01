class ApplicationController < Sinatra::Base
	require 'bundler'
	Bundler.require()

	Dir.glob('./.config/*.rb').each{
		|file| require file
	}

	set :views, File.expand_path('../../views', __FILE__)
	set :public_folder, File.expand_path('../../public', __FILE__)

	before do
		if headers['x-access-token'] != nil
			@token = headers['x-access-token']
		elsif params['token']
			@token = params['token']
		elsif env['HTTP_X_ACCESS_CONTROL'] != nil
			@token = env['HTTP_X_ACCESS_CONTROL']
			puts '-------------------------token in header-------------------------'
			puts @token
		else
			@token = nil
		end
	end

	def replace_token(token)
		@token = token
	end

	private

	def validate_token
		begin
			@predecoded_token = JWT.decode(@token, JWT_SECRET, false)
			puts 'predecoded_token ---------------------------------------------------------------'
			puts @predecoded_token
			@decoded_token = JWT.decode(@token, JWT_SECRET, true, { 'iat' => @predecoded_token[0]['iat'], 'jti' => @predecoded_token[0]['jti'], :verify_jti => true })
			puts 'decoded_token ---------------------------------------------------------------'
			puts @decoded_token
			@stored_jti = JSON.parse(HiredisController.redis_read_token_id(@decoded_token[0]['user_id']))

			if (@stored_jti[1] != @decoded_token[0]['jti'])
				puts @stored_jti[1]
				puts @decoded_token[0]['jti']
				return_message = {
					:status => 'error',
					:message => "Invalid JTI. Please log in and try again."
				}
				halt 401, {
					'Content-Type' => 'application/json'
				}, return_message.to_json
			end
		rescue JWT::ExpiredSignature
			return_message = {
				:status => 'error',
				:message => "Your session has expired. Please log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json
    rescue JWT::DecodeError
      return_message = {
				:status => 'error',
				:message => "You must be logged in to perform this action. Please sign up or log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json
		rescue JWT::InvalidJtiError
		  # Handle invalid token, e.g. logout user or deny access
		  puts '------------JWT INVALID ERROR----------------------------------------------------------------------------------------------------'
		  return_message = {
				:status => 'error',
				:message => "You must be logged in to perform this action. Please sign up or log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json
    end
	end

end
