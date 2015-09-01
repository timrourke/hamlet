var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Hamlet About Classes
 *
 */

hamlet.blueprints.AboutPageView = Backbone.View.extend({
	el: $('.site-header__wrapper'),
	initialize: function() {
		var self = this;
		this.template = _.template($('#aboutPageHeaderTemplate').html());
	},
	render: function() {
		this.$el.html(this.template())
	}
});