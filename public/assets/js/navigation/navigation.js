var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Hamlet Play Navigation Classes
 *
 */

$('body').on('click', '.js-pushMenu__toggle', function(e) {
  e.preventDefault();
  $('body').toggleClass('js-pushMenu--open');
});

$('body').on('click', '.form__login-button', function(e) {
  e.preventDefault();
  $('.pushMenu .utility-nav').addClass('open');
});

$('body').on('click', '.form__back-button', function(e) {
  e.preventDefault();
  $('.pushMenu .utility-nav').removeClass('open');
});

hamlet.blueprints.ActNavigationModel = Backbone.Model.extend({
	initialize: function() {
		console.log('new hamlet.ActNavigationModel instantiated');
	}
});

hamlet.blueprints.ActNavigationItemView = Backbone.View.extend({
	tagName: 'li',
	className: 'pushMenu__act',
	events: {
		'click': 'clickEvent'
	},
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
	},
	clickEvent: function(e) {
		var self = this;

		console.log(e.target)

		if (!$(e.target).hasClass('pushMenu__header')) {
			return;
		}

		if (this.$el.hasClass('open')) {
			this.$el.removeClass('open');
			self.$el.find('.pushMenu__sub-item').velocity({
				height: 0
			});
			return;
		}

		$('.pushMenu__act').removeClass('open');
		this.$el.addClass('open');
		$('.pushMenu__sub-item').velocity({
			height: 0
		});
		self.$el.find('.pushMenu__sub-item').velocity({
			height: '4.125em'
		});

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
});