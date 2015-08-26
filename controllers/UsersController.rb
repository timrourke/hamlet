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

	get '/' do
		#replace this eventually with a json object of all users
		@users = User.all.to_json
	end

	post '/' do
		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)

		puts @request_body['user_email'].to_json

		if self.does_user_exist?(@request_body['user_email'].downcase)
			#return early if user already exists
			raise "Sorry, this email address is already registered. Please use a unique email address."

		elsif (@request_body['user_password'].to_s != @request_body['user_password_confirm'].to_s)
			#return early if password doesn't match confirmation password
			raise "Your passwords did not match. Please try again."

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
			@confirmation_route = request.host + ':' + request.port.to_s + '/api/users/confirm-email/' + @new_user.email_confirmation_route

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
end