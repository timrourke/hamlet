var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

$.ajaxSetup({
	headers: {
		'x-access-control': window.localStorage.getItem('token')
	}
});

function setToken(token) {

	return (function(token) {
		console.log('running closure to set token.')
		
		window.localStorage.setItem('token', token);

		$.ajaxSetup({
			headers: {
				'x-access-control': window.localStorage.getItem('token')
			}
		});

	})(token);
}

function getToken() {
	return window.localStorage.getItem('token');
}

//Add toProperCase() method to String prototype for easy case manipulation
//Credit: http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

//Form input helper - parses form for inputs and textareas and
//packages them into a POJO for submission via Backbone's AJAX
function collectInputs(formId) {
	var $inputs = $(formId).find('input, textarea');
	var result = {};

	$inputs.each(function(i) {
		if ( $(this).attr('name') ) {
			var keyName = $(this).attr('name');
			result[keyName.toString()] = $(this).val();
		}
	});

	return result;
}

function appendFormMessage(formId, status, message) {
	var $form = $(formId);

	switch (status) {
		case 'error':
			$form.removeClass('form--success').addClass('form--error');
			$form.velocity('callout.shake');
			$form.find('input, textarea').prop('disabled', false);
			break;
		case 'success':
			$form.addClass('form--success').removeClass('form--error');
			$form.velocity('transition.slideUpOut', {
				complete: function() {
					$form.remove();
				}
			});
			break;
		default:
			
			break;
	}

	$form.children('.form__feedback').html(status.toProperCase() + '! ' + message);

	return true;
}

function renderModal(modalObj) {
	$('.overlay').addClass('open');

	hamlet.active.modal = new hamlet.blueprints.Modal(modalObj);
	hamlet.active.modalView = new hamlet.blueprints.ModalView({
		el: $('.overlay'),
		model: hamlet.active.modal
	}).render();
}

Backbone.View.prototype.close = function () {
  this.$el.empty();
  this.unbind();
};

hamlet.active.requestNewConfirmationEmail = function(obj) {
	var formId = '#js-request-new-confirmation-email-form';

	$(formId).find('input, textarea').prop('disabled', true);

	if (obj.user_email == '' || obj.user_password == '') {
		appendFormMessage(formId, 'error', 'Please be sure to provide your email address and password.');
		return false;
	}

	reqNewConfEmailObj = {
		url: window.location.protocol + '//' + window.location.host + '/api/users/request-new-confirmation-email',
		method: 'POST',
		dataType: 'json',
		data: obj,
		success: function(response) {
			console.log(response);
			var modalObj = {
				heading: response.status.toProperCase(),
				body: response.message,
				controls: [{
					class: 'modal__dismiss',
					value: 'OK'
				}]
			}

			renderModal(modalObj);
		},
		error: function(error) {
			console.log(error);
			var modalObj = {
				heading: error.responseJSON.status.toProperCase(),
				body: error.responseJSON.message,
				controls: [{
					class: 'modal__dismiss',
					value: 'OK'
				},{
					class: 'modal__requestNewConfirmationEmail',
					value: 'Request New Confirmation Email'
				}]
			}

			renderModal(modalObj);
		}
	}

	$.ajax(reqNewConfEmailObj);

	return true;
};

$(document).on('ready', function() {

	//Init play
	hamlet.active.acts = new hamlet.blueprints.Acts(acts);

	//Init router
	new hamlet.active.ActRouter;
	Backbone.history.start({ pushState: true });
	
	//Init scene navigation and view
	hamlet.active.actNavigationMenu = new hamlet.blueprints.ActsNavigationMenu(acts);
	hamlet.active.actsNavigationView = new hamlet.blueprints.ActsNavigationView({
		el: $('#play__navigation'),
		collection: hamlet.active.actNavigationMenu
	}).render();

	//Init user model
	hamlet.active.users = new hamlet.blueprints.Users({});

	/*
	 *	Register form submit handlers
	 *
	 */

	$('#js-logout').on('click', function(e) {
		e.preventDefault();

		hamlet.active.logOut();
	});

	$('#js-login-form').on('submit', function(e) {
		e.preventDefault();

		var obj = collectInputs('#js-login-form');

		hamlet.active.logIn(obj);
	});

	$('#js-signup-form').on('submit', function(e) {
		e.preventDefault();

		var obj = collectInputs('#js-signup-form');

		hamlet.active.createUser(obj);
	});

	$('body').on('submit', '#js-comment-form', function(e) {
		e.preventDefault();

		var obj = collectInputs('#js-comment-form');

		hamlet.active.createComment(obj);
	});

	$('body').on('submit', '#js-request-new-confirmation-email-form', function(e) {
		e.preventDefault();

		var obj = collectInputs('#js-request-new-confirmation-email-form');

		hamlet.active.requestNewConfirmationEmail(obj);
	});

});