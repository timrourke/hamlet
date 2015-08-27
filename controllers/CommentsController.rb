class CommentsController < ApplicationController
	get '/' do
		@comments = Comment.all

		@comments.to_json
	end

	post '/' do
		validate_token

		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

		if (!@user = User.select('id, user_name, user_email, created, modified').find(@decoded_token[0]['user_id']))
			#return early if password doesn't match confirmation password
			return_message = {
				:status => 'error',
				:message => "Invalid user. Please sign up or log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json

		else
			
			@comment = Comment.new

			@comment.user_id = @user.id
			@comment.created = Time.now
			@comment.comment = @request_body['comment']
			@comment.act = 1
			@comment.scene = 1
			@comment.line = 1

			if @comment.save

				content_type :json				
				status 201
				return_message = {
					:status => 'success',
					:message => "Thanks for your comment, #{@user.user_name}!",
					:user => @user.to_json,
					:comment => @comment
				}
				return_message.to_json

			else
				#return error if saving to database fails
				return_message = {
					:status => 'error',
					:message => "Sorry! There was a problem saving your comment. Please try again."
				}
				halt 500, {
					'Content-Type' => 'application/json'
				}, return_message.to_json
			end

		end
	end
end