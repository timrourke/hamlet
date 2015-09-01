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
		var self = this;
		console.log('A CurrentUser has been born.');
		hamlet.active.currentUserView = new hamlet.blueprints.CurrentUserView({
			model: self
		});
	}
});

hamlet.blueprints.CurrentUserView = Backbone.View.extend({
	el: $('.currentUser-panel'),
	initialize: function() {
		var self = this;
		this.template = _.template($('#currentUserViewTemplate').html());
		this.model.on('change', function() {
			self.render();
		});
		self.render();
	},
	render: function() {
		var self = this;
		this.$el.prepend(this.template(this.model.attributes))
	}
});

hamlet.active.logIn = function(obj) {
	var formId = '#js-login-form';

	$(formId).find('input, textarea').prop('disabled', true);

	if (obj.user_email == '' || obj.user_password == '') {
		appendFormMessage(formId, 'error', 'Please be sure to include your username and password.');
		return false;
	} 

	logInObj = {
		url: window.location.protocol + '//' + window.location.host + '/api/users/login',
		method: 'post',
		dataType: 'json',
		data: obj,
		success: function(response) {

			setToken(response.token);

			$('body').removeClass('js-pushMenu--open');
  		$('.pushMenu .utility-nav, .pushMenu .form__signup').removeClass('open');

			hamlet.active.currentUser = new hamlet.blueprints.CurrentUser(response.user);

			setUser(response.user);

			$(formId).find('input:not(input[type="submit"]), textarea').val('');
			$(formId).find('input, textarea').prop('disabled', false);

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
			appendFormMessage(formId, response.responseJSON.status, response.responseJSON.message);
			return false;
		}
	}

	$.ajax(logInObj);
}

hamlet.active.logOut = function() {

	logOutObj = {
		url: window.location.protocol + '//' + window.location.host + '/api/users/logout',
		dataType: 'json',
		success: function(response) {

			setToken(null);

			console.log('logging out')

			if (typeof hamlet.active.currentUser != 'undefined') {
				hamlet.active.currentUserView.close();
				hamlet.active.currentUser.trigger('destroy');
			}

			setUser(null);

			return true;
		},
		error: function(error) {
			console.log(error);
			return false;
		}
	}

	$.ajax(logOutObj);
}