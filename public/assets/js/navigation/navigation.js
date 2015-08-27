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
});