CREATE DATABASE hamlet;

\c hamlet;

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	user_name varchar(255) NOT NULL,
	user_email varchar(255) UNIQUE,
	password_hash varchar(255),
	password_salt varchar(255),
	is_admin boolean NOT NULL,
	created timestamp NOT NULL,
  modified timestamp,
  email_confirmed boolean,
  email_confirmation_route varchar(50),
  email_confirmation_expiry timestamp
);