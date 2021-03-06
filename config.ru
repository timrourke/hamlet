require 'sinatra/base'
use Rack::Deflater
# Load all controllers and models
require './controllers/_ApplicationController.rb'

Dir.glob('./{controllers,models}/*.rb').each{
	|file| require file
}

# set :show_exceptions, false

# error do
# 	content_type :json
# 	status 500

# 	e = env['sinatra.error']
# 	{:result => 'error', :message => e.message}.to_json
# end

map('/') { run HomeController }
map('/api/users') { run UsersController }
map('/api/comments') { run CommentsController }
