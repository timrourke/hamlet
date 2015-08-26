class UsersController < ApplicationController

	def does_user_exist?(email)
		@user = User.find_by(:user_email => email.downcase.to_s )

		if @user
			return true
		else
			return false
		end
	end

	def confirmation_link_valid?(user)
		if user.email_confirmation_expiry > Time.now
			return true
		else
			return false
		end
	end

	def send_email_confirm_message(email_address, email_confirmation_route)
		#takes configuration as set in ./.config/mail_configuration.rb
		Pony.mail({
		  :to => email_address.to_s,
		  :from => MAIL_FROM_ADDRESS,
		  :via => :smtp,
		  :headers => { 'Content-Type' => 'text/html' },
		  :subject => 'Welcome to Hamlet.',
		  :via_options => {
		    :address        => MAIL_PROVIDER_HOST_ADDRESS,
		    :port           => MAIL_PROVIDER_HOST_PORT,
		    :enable_starttls_auto => true,
		    :user_name      => MAIL_USER_NAME,
		    :password       => MAIL_PASSWORD,
		    :authentication => :plain, # :plain, :login, :cram_md5, no auth by default
		    :domain         => "localhost.localdomain", # the HELO domain provided by the client to the server
		    :arguments			=> ''
		  },
		  :body => "<h1>Welcome to Hamlet.</h1><p>Thanks for registering!</p> <br> #{email_confirmation_route} <p>Go to <a href='#{email_confirmation_route}'>this link</a> to confirm your email address and create your account.</p><p>-The team at Hamlet.</p>"
		})
	end

	get '/errortest' do
		content_type :json
		status 500
		return_message = {
			:status => 'error',
			:message => "Sorry, there was a problem creating you as a user. Please try again."					
		}
		return_message.to_json
	end

	get '/' do
		#replace this eventually with a json object of all users
		@users = User.all.to_json
	end

	post '/' do
		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

		if self.does_user_exist?(@request_body['user_email'].downcase)
			#return early if user already exists
			content_type :json
			status 400
			return_message = {
				:status => 'error',
				:message => "Sorry, this email address is already registered. Please use a unique email address."					
			}
			return_message.to_json

		elsif (@request_body['user_password'].to_s != @request_body['user_password_confirm'].to_s)
			#return early if password doesn't match confirmation password
			content_type :json
			status 400
			return_message = {
				:status => 'error',
				:message => "Your passwords did not match. Please try again."
			}
			return_message.to_json

		else
			@new_user = User.new
			@new_user.user_name = @request_body['user_name']
			@new_user.user_email = @request_body['user_email'].downcase
			@new_user.is_admin = false #0 is false, 1 is true
			@new_user.created = Time.now
			@new_user.email_confirmed = false
			@new_user.email_confirmation_route = SecureRandom.uuid
			@new_user.email_confirmation_expiry = Time.now + 30*60

			@email_destination = @new_user.user_email
			#TODO: remove port in production, or otherwise normalize req uri
			@confirmation_route = request.host + ':' + request.port.to_s + '/users/confirm-email/' + @new_user.email_confirmation_route

			password_salt = BCrypt::Engine.generate_salt
			password_hash = BCrypt::Engine.hash_secret(@request_body['user_password'], password_salt)

			@new_user.password_salt = password_salt
			@new_user.password_hash = password_hash

			if @new_user.save

				send_email_confirm_message(@email_destination, @confirmation_route)
				
				content_type :json				
				status 201
				return_message = {
					:status => 'success',
					:message => "Thanks for signing up! Check your email inbox for a confirmation message."
				}
				return_message.to_json
			else
				content_type :json
				status 500
				return_message = {
					:status => 'error',
					:message => "Sorry, there was a problem creating you as a user. Please try again."					
				}
				return_message.to_json
			end
		end
	end

	post '/login' do
		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

	end

	get '/logout' do
		#See the following article for info about a sane approach
		#to caching JWT AUD/JTI info for use in expiring or blacklisting
		#a token: https://auth0.com/blog/2015/03/10/blacklist-json-web-token-api-keys/

		#Use hiredis to act as the key/value store for token AUD/JTI pairs
	end

	get '/:id' do
		#get single user
		@user = User.find(params[:id])

		if @user
			@user.to_json
		else
			content_type :json
			status 404
			return_message = {
				:status => 'error',
				:message => "Sorry, we couldn't find the requested user. Please try again."					
			}
			return_message.to_json
		end
	end

	put '/:id' do
		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)
		#update specific user
	end

	get '/confirm-email/:uuid' do
		@user = User.find_by(:email_confirmation_route => params[:uuid])

		if @user
			if @user.email_confirmed == true
				#user already confirmed.
				content_type :json
				status 400
				return_message = {
					:status => 'error',
					:message => "You have already confirmed your email. You may now log in."
				}
				return_message.to_json
			elsif confirmation_link_valid?(@user)
				#if confirmation link has not expired, save user as now confirmed.
				#also delete confirmation route from user to prevent retrying.
				@user.email_confirmed = true
				@user.email_confirmation_route = ""
				if @user.save
					#success, save user.
					content_type :json
					status 200
					return_message = {
						:status => 'success',
						:message => "Success! You have successfully confirmed your email. You may now log in."
					}
					return_message.to_json
				else
					#couldn't save user.
					content_type :json
					status 500
					return_message = {
						:status => 'error',
						:message => "Sorry, there was a problem registering your email address. Please check that the link you supplied was correct."
					}
					return_message.to_json
				end
			else
				#confirmation link has expired.
				content_type :json
				status 401
				return_message = {
					:status => 'error',
					:message => "Sorry, there was a problem registering your email address. Please check that the link you supplied was correct."
				}
				return_message.to_json
			end
		else
			#user not found by uuid.
			content_type :json
			status 404
			return_message = {
				:status => 'error',
				:message => "Sorry, there was a problem registering your email address. Please check that the link you supplied was correct."
			}
			return_message.to_json
		end
	end

	post '/request-new-confirmation-email' do	
		@user = User.find_by(:user_email => params[:user_email])

		if @user
			if @user.password_hash == BCrypt::Engine.hash_secret(params[:user_password], @user.password_salt)
				@user.modified = Time.now
				@user.email_confirmed = false
				@user.email_confirmation_route = SecureRandom.uuid
				@user.email_confirmation_expiry = Time.now + 30*60

				@email_destination = @user.user_email
				#TODO: remove port in production, or otherwise normalize req uri
				@confirmation_route = request.host + ':' + request.port.to_s + '/users/confirm-email/' + @user.email_confirmation_route

				if @user.save

					send_email_confirm_message(@email_destination, @confirmation_route)

					#Success, send user a new email confirmation link.
					content_type :json
					status 200
					return_message = {
						:status => 'success',
						:message => "Success! Check your email inbox for a confirmation message."
					}
					return_message.to_json
				else
					#DB/Server failure. Prompt user to try again.
					content_type :json
					status 500
					return_message = {
						:status => 'error',
						:message => "Sorry, we were unable to send a new confirmation email. Please try again."
					}
					return_message.to_json
				end
			else
				#Bad email/password.
				content_type :json
				status 401
				return_message = {
					:status => 'error',
					:message => "Your email address or password were incorrect. Please try again."
				}
				return_message.to_json
			end
		else
			#Couldn't find user.
			content_type :json
			status 401
			return_message = {
				:status => 'error',
				:message => "Your email address or password were incorrect. Please try again."
			}
			return_message.to_json
		end
	end

end