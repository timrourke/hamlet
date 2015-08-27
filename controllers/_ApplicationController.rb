class ApplicationController < Sinatra::Base
	require 'bundler'
	Bundler.require()

	Dir.glob('./.config/*.rb').each{
		|file| require file
	}

	ActiveRecord::Base.establish_connection(
		:adapter	=> 'postgresql',
		:database	=> 'hamlet'
	)

	set :views, File.expand_path('../../views', __FILE__)
	set :public_folder, File.expand_path('../../public', __FILE__)

	before do
		if headers['x-access-token'] != nil
			@token = headers['x-access-token']
		elsif params['token']
			@token = params['token']
		elsif env['HTTP_X_ACCESS_CONTROL'] != nil
			@token = env['HTTP_X_ACCESS_CONTROL']
			puts @token
		end
	end

	private

	def validate_token
		begin
			@decoded_token = JWT.decode(@token, JWT_SECRET)
    rescue JWT::DecodeError
      return_message = {
				:status => 'error',
				:message => "You must be logged in to perform this action. Please sign up or log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json
    rescue JWT::ExpiredSignature
      content_type :json
			status 401
			return_message = {
				:status => 'error',
				:message => "Yousession has expired. Please log in and try again."
			}
			return_message.to_json
    end
	end

end