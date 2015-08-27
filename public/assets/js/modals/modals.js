var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Modal Classes
 *
 */

hamlet.blueprints.ModalView = Backbone.View.extend({
	events: {
		'click .modal__dismiss': 'dismiss',
		'click .modal__requestNewConfirmationEmail': 'requestNewConfirmationEmail'
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
	},
	requestNewConfirmationEmail: function() {
		$('.overlay').removeClass('open');
		this.model.destroy();
		this.close();
		var modalObj = {
			heading: 'Request New Confirmation Email',
			body: 'Please submit your email address and password to request a new confirmation email.',
			form: $('#requestNewConfirmationEmailTemplate').html(),
			controls: [{
				class: 'modal__dismiss',
				value: 'Cancel'
			}]
		};

		renderModal(modalObj);
	}
});

hamlet.blueprints.Modal = Backbone.Model.extend({
	initialize: function() {
		console.log('A Modal has been born.');
	}
});