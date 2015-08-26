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
		redirect '/'
	end

	post '/login' do
		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)
		
	end

	post '/signup' do
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
	end

	put '/:id' do
		request.body.rewind
		@request_body = JSON.parse(request.body.read.to_s)
		#update specific user
	end
end