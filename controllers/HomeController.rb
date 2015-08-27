class HomeController < ApplicationController
	before do
		if headers[:'x-access-token'] != nil
			@token = headers[:'x-access-token']
			puts @token
		elsif params[:token]
			@token = params['token']
			puts @token
		end
	end

	get '/*' do
		pass if request.path_info == (%r{^(?!/assets$)} || %r{^(?!/api$)} || %r{^(?!/users$)}) 
    erb :index
	end
end