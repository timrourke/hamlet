class CommentsController < ApplicationController
	get '/' do
		@comments = Comment.joins('INNER JOIN users ON users.id = comments.user_id').select('users.user_name, comments.id, comments.created, comments.modified, comments.act, comments.scene, comments.line, comments.subline, comments.comment, comments.upvotes, comments.downvotes').order('comments.act ASC, comments.scene ASC, comments.line ASC, comments.subline ASC, comments.created DESC').all

		@comments.to_json
	end

	get '/act/:act' do
		@comments = Comment.joins('INNER JOIN users ON users.id = comments.user_id').where(comments: { act: params[:act] }).select('users.user_name, comments.id, comments.created, comments.modified, comments.act, comments.scene, comments.line, comments.subline, comments.comment, comments.upvotes, comments.downvotes').order('comments.act ASC, comments.scene ASC, comments.line ASC, comments.subline ASC, comments.created DESC').all

		@comments.to_json
	end

	get '/act/:act/scene/:scene' do
		@comments = Comment.joins('INNER JOIN users ON users.id = comments.user_id').where(comments: { act: params[:act], scene: params[:scene] }).select('users.user_name, comments.id, comments.created, comments.modified, comments.act, comments.scene, comments.line, comments.subline, comments.comment, comments.upvotes, comments.downvotes').order('comments.act ASC, comments.scene ASC, comments.line ASC, comments.subline ASC, comments.created DESC').all

		@comments.to_json
	end

	get '/act/:act/scene/:scene/line/:line' do
		@comments = Comment.joins('INNER JOIN users ON users.id = comments.user_id').where(comments: { act: params[:act], scene: params[:scene], line: params[:line] }).select('users.user_name, comments.id, comments.created, comments.modified, comments.act, comments.scene, comments.line, comments.subline, comments.comment, comments.upvotes, comments.downvotes').order('comments.act ASC, comments.scene ASC, comments.line ASC, comments.subline ASC, comments.created DESC').all

		@comments.to_json
	end

	post '/' do
		validate_token

		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

		if (!@user = User.select('id, user_name, user_email, created, modified').find(@decoded_token[0]['user_id']))
			#return early if no user found
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
			@comment.act = @request_body['act']
			@comment.scene = @request_body['scene']
			@comment.line = @request_body['line_number']
			@comment.subline = @request_body['subline_number']

			if @comment.save

				content_type :json				
				status 201

				@comment.status = 'success'
				@comment.message = "Thanks for your comment, #{@user.user_name}!"
				@comment.user = @user.to_json

				return_message = {
					:user_id => @comment.user_id,
					:created => @comment.created,
					:comment => @comment.comment,
					:act => @comment.act,
					:scene => @comment.scene,
					:line => @comment.line,
					:subline => @comment.subline,
					:status	=> @comment.status,
					:message => @comment.message,
					:user => @comment.user,
					:user_name => @user.user_name
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

	put '/upvote' do
		validate_token

		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

		if (!@user = User.select('id, user_name, user_email, created, modified').find(@decoded_token[0]['user_id']))
			#return early if no user found
			return_message = {
				:status => 'error',
				:message => "Invalid user. Please sign up or log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json

		else

			@comment = Comment.find(@request_body['id'])

			@upvotes = @comment.upvotes.to_a
			@downvotes = @comment.downvotes.to_a

			if !@upvotes.include?(@user.id)
				@upvotes.push(@user.id)
				
				if @downvotes.include?(@user.id)
					@downvotes.delete(@user.id)
				end

				@comment.upvotes = @upvotes
				@comment.downvotes = @downvotes

				if @comment.save

					content_type :json				
					status 200

					# return_message = {
					# 	:id => @comment.id,
					# 	:user_id => @comment.user_id,
					# 	:created => @comment.created,
					# 	:modified => @comment.modified,
					# 	:act => @comment.act,
					# 	:scene => @comment.scene,
					# 	:line => @comment.line,
					# 	:subline => @comment.subline,
					# 	:comment => @comment.comment,
					# 	:upvotes => @comment.upvotes.to_a.length,
					# 	:downvotes => @comment.downvotes.to_a.length
					# }

					# return_message.to_json

					@comment.to_json
				else
					#return early if comment not saved
					return_message = {
						:status => 'error',
						:message => "Sorry, your vote was unsuccessful. Please try again."
					}
					halt 500, {
						'Content-Type' => 'application/json'
					}, return_message.to_json
				end
			else
				#user has already upvoted this comment, return unmodified comment.
				content_type :json				
				status 200
				@comment.to_json
			end
			
		end
	end

	put '/downvote' do
		validate_token

		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

		if (!@user = User.select('id, user_name, user_email, created, modified').find(@decoded_token[0]['user_id']))
			#return early if no user found
			return_message = {
				:status => 'error',
				:message => "Invalid user. Please sign up or log in and try again."
			}
			halt 401, {
				'Content-Type' => 'application/json'
			}, return_message.to_json

		else

			@comment = Comment.find(@request_body['id'])

			@upvotes = @comment.upvotes.to_a
			@downvotes = @comment.downvotes.to_a

			if !@downvotes.include?(@user.id)
				@downvotes.push(@user.id)

				if @upvotes.include?(@user.id)
					@upvotes.delete(@user.id)
				end

				@comment.upvotes = @upvotes
				@comment.downvotes = @downvotes

				if @comment.save

					content_type :json				
					status 200

					# return_message = {
					# 	:id => @comment.id,
					# 	:user_id => @comment.user_id,
					# 	:created => @comment.created,
					# 	:modified => @comment.modified,
					# 	:act => @comment.act,
					# 	:scene => @comment.scene,
					# 	:line => @comment.line,
					# 	:subline => @comment.subline,
					# 	:comment => @comment.comment,
					# 	:upvotes => @comment.upvotes.to_a.length,
					# 	:downvotes => @comment.downvotes.to_a.length
					# }

					# return_message.to_json

					@comment.to_json
				else
					#return early if comment not saved
					return_message = {
						:status => 'error',
						:message => "Sorry, your vote was unsuccessful. Please try again."
					}
					halt 500, {
						'Content-Type' => 'application/json'
					}, return_message.to_json
				end
			else
				#user has already upvoted this comment, return unmodified comment.
				content_type :json				
				status 200
				@comment.to_json
			end
			
		end
	end
end