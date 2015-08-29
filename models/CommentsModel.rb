class Comment < ActiveRecord::Base
	def status=(status)
		@status = status.to_s
	end

	def status
		@status.to_s
	end

	def message=(message)
		@message = message.to_s
	end

	def message
		@message.to_s
	end

	def user=(user)
		@user = user.to_json
	end

	def user
		@user.to_json
	end
end