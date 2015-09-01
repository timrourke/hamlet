# Set the working application directory
# working_directory "/path/to/your/app"
working_directory "/var/www/hamlet"  #where Gemfile, config.ru, app.rb are in

# Unicorn PID file location
# pid "/path/to/pids/unicorn.pid"
pid "/var/www/hamlet/tmp/pids/unicorn.pid"

# Path to logs
# stderr_path "/path/to/logs/unicorn.log"
# stdout_path "/path/to/logs/unicorn.log"
stderr_path "/var/www/hamlet/logs/unicorn.log" #errors logged here
stdout_path "/var/www/hamlet/logs/unicorn.log" #output logged here

# Unicorn socket
# listen "/tmp/unicorn.[app name].sock"
listen "/tmp/unicorn.hamlet.sock" #socket

# Number of processes
# worker_processes 4
worker_processes 2

# Time-out
timeout 30
