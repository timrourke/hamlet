class HomeController < ApplicationController
	get '/*' do
		pass if request.path_info == %r{^(?!/assets$)}
    erb :index
	end
end