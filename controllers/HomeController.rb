class HomeController < ApplicationController
	get '/*' do
		pass if request.path_info == (%r{^(?!/assets$)} || %r{^(?!/api$)} || %r{^(?!/users$)}) 
    erb :index
	end
end