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
	var statusClass;

	switch (status) {
		case 'error':
			statusClass = 'form--error';
			break;
		case 'success':
			statusClass = 'form--success';
			break;
		default:
			statusClass = 'form--success';
			break;
	}

	var $form = $(formId);

	$form.addClass(statusClass);

	$form.children('.form__feedback').html(status.toProperCase() + '! ' + message);

	$form.find('input, textarea').prop('disabled', false);

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

var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Hamlet Play Navigation Classes
 *
 */

hamlet.blueprints.ActNavigationModel = Backbone.Model.extend({
	initialize: function() {
		console.log('new hamlet.ActNavigationModel instantiated');
	}
});

hamlet.blueprints.ActNavigationItemView = Backbone.View.extend({
	tagName: 'li',
	initialize: function() {
		var self = this;
		this.template = _.template($('#actNavigationItemViewTemplate').html());
		this.model.on('change', function() {
			self.render();
		});
		self.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes))
	}
});

hamlet.blueprints.ActsNavigationMenu = Backbone.Collection.extend({
	model: hamlet.blueprints.ActNavigationModel
});

hamlet.blueprints.ActsNavigationView = Backbone.View.extend({
	render: function() {
		var self = this;
		var actCounter = 1;
		this.collection.each(function(model) {
			model.set('actNumber', actCounter);
			var actNavigationItemView = new hamlet.blueprints.ActNavigationItemView({
				model: model
			}, this);
			self.$el.append(actNavigationItemView.el);
			actCounter++;
		});
	}
})

/*
 *	Hamlet Play Line and Scene Classes
 *
 */

hamlet.blueprints.LineModel = Backbone.Model.extend({
	initialize: function() {
		console.log('new hamlet.LineModel instantiated');
	}
});

hamlet.blueprints.Scene = Backbone.Collection.extend({
	model: hamlet.blueprints.LineModel
});

hamlet.blueprints.SceneView = Backbone.View.extend({
	initialize: function() {
		console.log('Initializing ActView.');
	},
	render: function() {
		var self = this;
		this.collection.each(function(model) {
			var lineView = new hamlet.blueprints.LineView({
				model: model
			}, this);
			self.$el.append(lineView.el);
		});
		return this;
	},
});

hamlet.blueprints.LineView = Backbone.View.extend({
	tagName: 'li',
	initialize: function() {
		var self = this;
		this.template = _.template($('#lineTemplate').html());
		this.model.on('change', function() {
			self.render();
		});
		self.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});

/*
 *	Modal Classes
 *
 */

hamlet.blueprints.ModalView = Backbone.View.extend({
	events: {
		'click .modal__dismiss': 'dismiss'
	},
	initialize: function() {
		var self = this;
		this.template = _.template($('#modalTemplate').html());
		this.model.on('change', function() {
			self.render();
		});
		self.render();
	},
	render: function() {
		this.$el.html(this.template(this.model.attributes));
		return this;
	},
	dismiss: function() {
		$('.overlay').removeClass('open');
		this.model.destroy();
		this.close();
	}
});

hamlet.blueprints.Modal = Backbone.Model.extend({
	initialize: function() {
		console.log('A Modal has been born.');
	}
});

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
 *	Router Definitions
 *
 */

hamlet.active.ActRouter = Backbone.Router.extend({
	routes: {
		"": "index",
		"users/confirm-email/:uuid": "confirmUser",
		"act/:act/scene/:scene": "act"
	},

	index: function() {
		
	},

	act: function(act, scene) {
		if (hamlet.active.sceneView) {
			hamlet.active.sceneView.close();	
		}

		var lines = acts[act-1].scenes[scene-1].lines;
		hamlet.active.scene = new hamlet.blueprints.Scene(lines);

		hamlet.active.sceneView = new hamlet.blueprints.SceneView({
			el: $('#act__container'),
			collection: hamlet.active.scene
		}).render();
	},

	confirmUser: function(uuid) {
		uuidRequest = {
			url: window.location.protocol + '//' + window.location.host + '/api/users/confirm-email/' + uuid,
			dataType: 'json',
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
					}]
				}

				renderModal(modalObj);
			}
		}

		$.ajax(uuidRequest);

		console.log(uuidRequest.url);

		
		
	}
});

// Use absolute URLs  to navigate to anything not in your Router.
var openLinkInTab = false;

// Only need this for pushState enabled browsers
if (Backbone.history) {
  $(document).keydown(function(event) {
    if (event.ctrlKey || event.keyCode === 91) {
      openLinkInTab = true;
    }
  });
  
  $(document).keyup(function(event) {
    openLinkInTab = false;
  });

  // Use delegation to avoid initial DOM selection and allow all matching elements to bubble
  $(document).on('click', "a", function(evt) {
    // Get the anchor href and protcol
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";

    // Ensure the protocol is not part of URL, meaning its relative.
    // Stop the event bubbling to ensure the link will not cause a page refresh.
    if (!openLinkInTab && href.slice(protocol.length) !== protocol) {
      evt.preventDefault();

      // Note by using Backbone.history.navigate, router events will not be
      // triggered.  If this is a problem, change this to navigate on your
      // router.
      Backbone.history.navigate(href, true);
    }
  });

}

$(document).on('ready', function() {

	new hamlet.active.ActRouter;
	Backbone.history.start({ pushState: true });

	//Get first scene of play
	var lines = acts[0].scenes[0].lines;

	//Init first scene class and view using first scene as entry point
	hamlet.active.scene = new hamlet.blueprints.Scene(lines);
	hamlet.active.sceneView = new hamlet.blueprints.SceneView({
		el: $('#act__container'),
		collection: hamlet.active.scene
	}).render();
	
	//Init scene navigation and view
	hamlet.active.actNavigationMenu = new hamlet.blueprints.ActsNavigationMenu(acts);
	hamlet.active.actsNavigationView = new hamlet.blueprints.ActsNavigationView({
		el: $('#play__navigation'),
		collection: hamlet.active.actNavigationMenu
	}).render();

	//Init user model
	hamlet.active.users = new hamlet.blueprints.Users({

	});

	$('#js-signup-form').on('submit', function(e) {

		e.preventDefault();

		var obj = collectInputs('#js-signup-form');

		hamlet.active.createUser(obj);

	});

});