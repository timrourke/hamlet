var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Hamlet About Classes
 *
 */

hamlet.blueprints.HomePageView = Backbone.View.extend({
	el: $('.site-header__wrapper'),
	initialize: function() {
		var self = this;
		this.template = _.template($('#homePageHeaderTemplate').html());
	},
	render: function(sceneInfo) {
		this.$el.html(this.template({
			act: sceneInfo.act,
			scene: sceneInfo.scene
		}))
	}
});