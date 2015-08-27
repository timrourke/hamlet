var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Hamlet Play Classes
 *
 */

hamlet.blueprints.Act = Backbone.Model.extend({
	initialize: function() {
		var self = this;
		console.log('A new act has been born.');
		var scenes = this.get('scenes');
		_.each(scenes, function(scene) {
			var actNumber = self.get('act');
			var sceneNumber = scene.scene;
			var lineNumber = 1;
			scene.act = actNumber;
			_.each(scene.lines, function(line) {
				line.act = actNumber;
				line.scene = sceneNumber;
				line.lineNumber = lineNumber;
				lineNumber++;
			});
		});
		return this;
	}
});

hamlet.blueprints.Acts = Backbone.Collection.extend({
	model: hamlet.blueprints.Act,
	initialize: function() {
		console.log('A new collection of acts has been born.');
	}
});

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
	model: hamlet.blueprints.LineModel,
	initialize: function() {
	}
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
		var lines = this.model.get('line');
		lines = lines.split('<br>');
		this.model.set('lines', lines);
		this.$el.html(this.template(this.model.attributes));
		return this;
	}
});