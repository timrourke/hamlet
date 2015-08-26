class HomeController < ApplicationController
	get '/*' do
		pass if request.path_info == (%r{^(?!/assets$)} || %r{^(?!/api$)}) 
    erb :index
	end
end