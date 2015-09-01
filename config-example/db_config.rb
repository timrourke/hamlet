#Configure your database with proper credentials here
ActiveRecord::Base.establish_connection(
        :adapter        => 'postgresql',
        :database       => 'hamlet',
)