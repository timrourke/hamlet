# Hamlet

![https://raw.githubusercontent.com/timrourke/hamlet/master/header.jpg](https://raw.githubusercontent.com/timrourke/hamlet/master/header.jpg)

See the project online at [hamlet.timstack.com](hamlet.timstack.com).

Hamlet, cleverly named after the play of which it is the subject, is a Backbone.js application built with a RESTful Sinatra JSON API backend.

## The challenge: A social e-reading application

Using Shakespeare's masterpiece as its subject, Hamlet is an attempt to build a modern e-reader application with social features, an uncluttered reading experience, and a modern interface. Conceived and built to solve one problem well, the scope of the application's design is limited to creating an enriched reading experience for a great work of literature that is often read in groups and discussed as it is read.

Commenting is the primary feaure of the application. Users may create an account and create comments on each individual line of the play, and then upvote or downvote comments for their perceived quality.

## There's something rotten in the state of Denmark

The most difficult aspect of building this project was making the best use of Backbone.js. Backbone by its very nature is a very light-weight, low-level JavaScript MVC framework that is quite unopinionated. For a newcomer to this framework, the learning curve of the API is fairly short, but the user is left to construct their own approach to application structure, inter-component messaging, and global state management.

Beware the sirens of stateful DOM might beckon your craft onto the rocky lee.

## Halmet 2.0

In a second pass, I would like to rearchitect the application's components to take better advantage of Backbone.js's inbuilt messaging interface. In addition, the following features have yet to be addressed in full:

- Replies to comments
- Dynamic sorting of comments upon upvoting/downvoting
- A richer social experience with personalized profiles and chat
- Greater navigational clarity
- Deeper exploration of securing JWTs

## Technologies used

- [Backbone.js](http://backbonejs.org/) (depends on [Underscore.js](http://underscorejs.org/) and [jQuery](https://jquery.com/))
- [Sinatra](http://www.sinatrarb.com/) (RESTful JSON API)
- [Gulp.js](http://gulpjs.com/) (frontend development automation)
- Self-hosted on [Digital Ocean](https://www.digitalocean.com/) using [Unicorn](http://unicorn.bogomips.org/)
- [JWT](http://jwt.io/)-based authentication
- [hiredis-rb](https://github.com/redis/hiredis-rb) - a Ruby wrapper for [hiredis](https://github.com/redis/hiredis), used for a high-performance key/value store for managing JWTs

## Interesting gems used

- [jwt](https://github.com/jwt/ruby-jwt) - a JSON Web Token implementation in Ruby
- [pony](https://github.com/benprew/pony) - The express way to send mail from Ruby.
- [hiredis](https://github.com/redis/hiredis-rb) Ruby wrapper for [hiredis](https://github.com/redis/hiredis)

## Installation instructions

1. Git clone into an empty directory.
2. Run `bundle install && npm install && bower install` with appropriate permissions.
3. Using the `config-example/` folder as a guide, create a folder in the root of the project called `.config/`. This folder is ignored by git by default to prevent publishing login credentials to GitHub or a public environment. Use the included example files as a template and complete with config parameters appropriate for your environment.
4. Run a redis server and a postgresql server, ideally as daemonized services.
5. Open the postgres terminal (`psql` in terminal) and run your migration by using the following command: `\i "/path/to/project/migrations/migrations.sql"`
6. Quit postgres and run `bundle exec rackup` in the root folder of the project
7. Navigate to `localhost:9292`, or whatever URL you've configured Rack/Unicorn/etc. to serve the project to.
8. Read Hamlet and cry into your sherry.
