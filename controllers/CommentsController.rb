class CommentsController < ApplicationController
	before do
		if headers['x-access-token'] != nil
			@token = headers['x-access-token']
			puts '-------------------------------------------Token is in the headers.'
			puts @token
		elsif params['token']
			@token = params['token']
			puts @token
		end
	end

	

	private

	def validate_token
		begin
			JWT.decode(@token, JWT_SECRET)
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