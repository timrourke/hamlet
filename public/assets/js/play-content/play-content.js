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
	},
	defaults: {
		commentCount: 0
	}
});

hamlet.blueprints.Scene = Backbone.Collection.extend({
	model: hamlet.blueprints.LineModel,
	initialize: function(model, options) {
		var self = this;
		console.log('A new Scene collection has been born.');
		this.act = options.act;
		this.scene = options.scene;
		//Init Comments
		if (hamlet.active.commentsView) {
			hamlet.active.commentsView.close()
		}
		hamlet.active.comments = new hamlet.blueprints.Comments({},{
			act: self.act,
			scene: self.scene
		});
		hamlet.active.commentsView = new hamlet.blueprints.CommentsView({
			collection: hamlet.active.comments
		});
	}
});

hamlet.blueprints.SceneView = Backbone.View.extend({
	initialize: function() {
		console.log('Initializing SceneView.');
	},
	render: function() {
		var self = this;
		this.collection.each(function(model) {
			var lineView = new hamlet.blueprints.LineView({
				model: model
			}, this);
			self.$el.append(lineView.el);
		});
		self.$el.velocity('transition.slideLeftIn');
		return this;
	}
});

hamlet.blueprints.LineView = Backbone.View.extend({
	tagName: 'li',
	events: {
		'click .js-comment-toggle': 'showComments',
		'click .js-commentForm-toggle': 'showCommentsForm',
		'click .line__single-line': 'toggleCommentFormToggle',
		'click .js-hide-comments': 'hideComments'
	},
	initialize: function() {
		var self = this;
		this.template = _.template($('#lineTemplate').html());
		this.model.on('change', function(event, options) {
			if (!options.skipRender) {
				self.render();	
			}
		});
		this.model.on('change:commentCount', function() {
			self.$el.find('.commentCount__indicator').html( self.model.get('commentCount'));
		});
		self.render();
	},
	render: function() {
		var lines = this.model.get('line');
		lines = lines.split('<br>');
		this.model.set('lines', lines);
		this.model.set('cid', this.model.cid);
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	showComments: function(evt) {
		this.$el.find('.comment, span.js-commentForm-toggle, span.js-hide-comments').velocity('transition.slideUpIn', {
			display: 'block'
		});
	},
	showCommentsForm: function(evt) {
		//return early unless 'dismiss' button is clicked.
		//prevents undesired closing of comment form modal.
		this.model.set('commentsOpen', true, {
			skipRender: true
		});
		if (this.model.get('commentCount') > 0 && !$(evt.target).hasClass('js-commentForm-toggle')) {
			return;
		}
		if (hamlet.active.commentFormView) {
			hamlet.active.commentFormView.close();
		}
		var self = this;

		var subline_number = $(this.el).find('.line__single-line').data('subline_number');

		this.model.attributes.subline_number = subline_number;
		hamlet.active.commentForm = new hamlet.blueprints.CommentForm(this.model.attributes);
		hamlet.active.commentFormView = new hamlet.blueprints.CommentFormView({
			el: $(this.el).find(evt.target).parent().parent().parent().find('.line__comment'),
			model: hamlet.active.commentForm
		});
	},
	toggleCommentFormToggle: function(evt) {
		if ($(evt.target).hasClass('line__single-line')) {
			this.$el.find('.commentForm-toggle').toggleClass('open');		
		}
	},
	hideComments: function() {
		$('.commentForm-toggle').removeClass('open');
		this.model.set('commentsOpen', false, {
			skipRender: true
		});
		this.$el.find('.comment, span.js-commentForm-toggle, span.js-hide-comments').velocity('transition.slideUpOut');
	}
});