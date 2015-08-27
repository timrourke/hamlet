var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	User Model Classes
 *
 */

hamlet.blueprints.User = Backbone.Model.extend({
	initialize: function() {
		console.log('A User model has been born.');
	}
});

hamlet.blueprints.Users = Backbone.Collection.extend({
	url: '/api/users',
	model: hamlet.blueprints.User,
	initialize: function() {
		console.log('A Users collection has been born.');
	}
});

hamlet.active.createUser = function(obj) {
	var formId = '#js-signup-form';

	$(formId).find('input, textarea').prop('disabled', true);

	if (!obj.user_name || !obj.user_email || !obj.user_password || !obj.user_password_confirm) {
		appendFormMessage(formId, 'error', 'You are missing a parameter!');
		return false;
	} else if (obj.user_password != obj.user_password_confirm) {
		appendFormMessage(formId, 'error', 'Your password must match your password confirmation!');
		return false;
	}

	hamlet.active.users.create(obj, {
		wait: true,

		success: function(model, response, options){
			appendFormMessage(formId, response.status, response.message);
		},
		error: function(model, response, options) {
			var statusCode = response.status;

			switch (statusCode) {
				default:
					appendFormMessage(formId, response.responseJSON.status, response.responseJSON.message);
					break;
			}

			return false;
		}
	});

	return true;
};

/*
 *	User Session Classes
 *
 */

hamlet.blueprints.CurrentUser = Backbone.Model.extend({
	initialize: function() {
		console.log('A CurrentUser has been born.');
	}
});

hamlet.active.logIn = function(obj) {
	var formId = '#js-login-form';

	$(formId).find('input, textarea').prop('disabled', true);

	if (obj.user_email == '' || obj.user_password == '') {
		appendFormMessage(formId, 'error', 'Please be sure to include your username and password.');
		return false;
	} 

	var token = getToken();

	if (token) {
		obj.token = token;
	}

	logInObj = {
		url: window.location.protocol + '//' + window.location.host + '/api/users/login',
		method: 'post',
		dataType: 'json',
		data: obj,
		success: function(response) {

			setToken(response.token);

			hamlet.active.currentUser = new hamlet.blueprints.CurrentUser(response);

			var modalObj = {
				heading: response.status.toProperCase(),
				body: response.message,
				controls: [{
					class: 'modal__dismiss',
					value: 'OK'
				}]
			}

			renderModal(modalObj);

			return true;
		},
		error: function(response) {
			var statusCode = response.status;
			appendFormMessage(formId, response.status, response.message);
			return false;
		}
	}

	$.ajax(logInObj);
}