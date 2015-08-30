var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Comments Classes
 *
 *	IMPORTANT: Comments are initialized via the scene constructor.
 *
 */

hamlet.blueprints.Comment = Backbone.Model.extend({
	initialize: function() {
		console.log('A comment was born.');
	},
	defaults: {
		comment: '',
		upvotes: [''],
		downvotes: ['']
	}
});

hamlet.blueprints.Comments = Backbone.Collection.extend({
	initialize: function(model, options) {
		var self = this;
		console.log('A Comments collection was born.');
		this.act = options.act;
		this.scene = options.scene;
		this.fetch();
		this.on('update', function() {
			self.fetch();
		});
	},
	url: function() {
		return '/api/comments/act/' + this.act + '/scene/' + this.scene
	},
	model: hamlet.blueprints.Comment
});

hamlet.blueprints.CommentView = Backbone.View.extend({
	tagName: 'li',
	className: 'comment',
	events: {
		'click .comment__downvote': 'downvote',
		'click .comment__upvote': 'upvote',
		'click .comment__reply': 'reply',
		'click .comment__share': 'share'
	},
	initialize: function(options) {
		this.options = options;
		console.log('A comment view was born.');
		var self = this;
		this.template = _.template($('#commentTemplate').html());
		// this.model.on('sync', function() {
		// 	self.render();
		// });
		self.render();
	}, 
	render: function() {
		this.options.targetElement.append(this.$el.html(this.template(this.model.attributes)));
		return this;
	},
	downvote: function() {
		this.model.save({downvotes: (this.model.get('downvotes') - 1) }, {
			url: '/api/comments/downvote',
			wait: true,
			error: function(model, response, options) {
				console.log(model)
				console.log(response);
				// var statusCode = response.status;

				// switch (statusCode) {
				// 	default:
				// 		appendFormMessage(formId, response.responseJSON.status, response.responseJSON.message);
				// 		break;
				// }

				return false;
			}
		});
	},
	upvote: function() {
		this.model.save({upvotes: (this.model.get('upvotes') + 1) }, {
			url: '/api/comments/upvote',
			wait: true,
			error: function(model, response, options) {
				console.log(model)
				console.log(response);
				// var statusCode = response.status;

				// switch (statusCode) {
				// 	default:
				// 		appendFormMessage(formId, response.responseJSON.status, response.responseJSON.message);
				// 		break;
				// }

				return false;
			}
		});
	},
	reply: function() {
		alert('reply');
	},
	share: function() {
		alert('share');
	},
	close: function() {
		this.unbind();
		this.remove();
		this.$el.remove();
	}
});

hamlet.blueprints.CommentsView = Backbone.View.extend({
	initialize: function() {
		var self = this;
		console.log('A Comments View was born.');
		this.collection.on('sync', function() {
			self.render();
		});
		// this.collection.on('update', function() {
		// 	self.render();
		// });
	},
	render: function() {
		if (hamlet.active.commentItems) {
			_.each(hamlet.active.commentItems, function(view) {
				view.close();
			});
		}
		var self = this;

		if (this.collection.models.length > 0) {

			hamlet.comments = {};

			hamlet.active.commentItems = [];

			this.collection.each(function(model) {
				model.targetElement = '#line-' + model.get('act') + '-' + model.get('scene') + '-' + model.get('line') + '-' + model.get('subline');

				

				if ( ! $(model.targetElement + ' .comments .comments__list').length ) {
					$(model.targetElement).append($( '<div class="comments"><ul class="comments__list"></ul></div>' ));	
				}
				
				var commentItem = new hamlet.blueprints.CommentView({
					model: model,
					targetElement: $(model.targetElement + ' .comments .comments__list')
				}, this);

				hamlet.active.commentItems.push(commentItem);
				
				// hamlet.comments[model.get('act')] = hamlet.comments[model.get('act')] || [];
				// hamlet.comments[model.get('act')][model.get('scene')] = hamlet.comments[model.get('act')][model.get('scene')] || [];
				// hamlet.comments[model.get('act')][model.get('scene')][model.get('line')] = hamlet.comments[model.get('act')][model.get('scene')][model.get('line')] || [];

				// hamlet.comments[model.get('act')][model.get('scene')][model.get('line')].push(commentItem);
				//$('#line-' + model.get('act') + '-' + model.get('scene') + '-' + model.get('line') + '-' + model.get('subline')).append(commentItem.el);
			});

		}
		
		return this;
	}
});

hamlet.active.createComment = function(obj) {
	var formId = '#js-comment-form';

	$(formId).find('input, textarea').prop('disabled', true);

	if (obj.comment.trim() == '') {
		appendFormMessage(formId, 'error', 'Please be sure to include a comment.');
		return false;
	}

	hamlet.active.comments.create(obj, {
		url: '/api/comments',
		wait: true,

		success: function(model, response, options){
			appendFormMessage(formId, model.get('status'), model.get('message'));
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

hamlet.blueprints.CommentForm = Backbone.Model.extend({
	initialize: function() {
		console.log('A CommentForm model was born.');
	}
});

hamlet.blueprints.CommentFormView = Backbone.View.extend({
	events: {
		'click .commentForm__dismiss': 'dismiss',
		'click .commentForm__submit': 'submit',
		'submit': 'submit'
	},
	initialize: function() {
		console.log('A CommentFormView was born.');
		var self = this;
		this.template = _.template($('#commentFormTemplate').html());
		this.model.on('change', function() {
			self.render();
		});
		self.render();
	},
	render: function() {
		this.$el.append(this.template(this.model.attributes));
		return this;
	},
	dismiss: function() {
		this.$el.empty();
  	this.unbind();
	},
	submit: function(e) {
		e.preventDefault();

		console.log('comment submit triggered.');
		var obj = collectInputs(this.$el);

		hamlet.active.createComment(obj);
	}
})