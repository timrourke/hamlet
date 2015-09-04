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
	initialize: function(model, options) {
		console.log('A comment was born.');
		this.parentModel = options.parentModel;
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
		self.fetch();
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
		'click .comment__share': 'share',
		'click .comment__edit': 'edit',
		'edited': 'render'
	},
	initialize: function(options) {
		this.options = options;
		console.log('A comment view was born.');
		var self = this;
		this.template = _.template($('#commentTemplate').html());
		// this.model.on('sync', function() {
		// 	self.render();
		// });
		this.model.on('update add', function() {
			console.log(this.model);
			self.render();
		});
		self.render();
	}, 
	render: function() {
		var self = this;

		this.options.targetElement.append(this.$el.html(this.template(this.model.attributes)));

		if (typeof this.model.get('targetElementModel') != 'undefined' && this.model.get('targetElementModel').get('commentsOpen')) {
			this.options.targetElement.parent().parent().find('.comment, span.js-commentForm-toggle, span.js-hide-comments').css({
		 		'display':'block'
		 	});
		}

		return this;
	},
	downvote: function(e) {
		e.preventDefault();
		
		this.model.save({downvotes: (this.model.get('downvotes') - 1) }, {
			url: '/api/comments/downvote',
			wait: true,
			error: function(model, response, options) {
				return false;
			}
		});

		return false;
	},
	upvote: function(e) {
		e.preventDefault();
		
		this.model.save({upvotes: (this.model.get('upvotes') + 1) }, {
			url: '/api/comments/upvote',
			wait: true,
			error: function(model, response, options) {
				return false;
			}
		});

		return false;
	},
	reply: function() {
		return false;
	},
	share: function() {
		return false;
	},
	edit: function(evt) {
		this.model.set('formCssId', 'js-comment-form--edit')
		var editingCommentForm = new hamlet.blueprints.CommentForm(this.model.toJSON());
		new hamlet.blueprints.CommentFormView({
			model: editingCommentForm,
			el: this.el
		});

		return false;
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
		//self.render();
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

				var targetElementModel = hamlet.active.scene.get({ cid: $(model.targetElement).attr('data-cid') });

				if (typeof targetElementModel != 'undefined') {
					model.set('subline_number', model.get('subline'));
					model.set('lineNumber', targetElementModel.get('lineNumber'));
					model.set('line', model.get('lineNumber'));
					//model.set('lineNumber', targetElementModel.get('lineNumber'));
					var commentCount = targetElementModel.get('commentCount');	
				}

				var commentLengthInDom = $(model.targetElement + ' li.comment').length + 1;

				if ( !$(model.targetElement + ' .comments__list').length ) {
					$(model.targetElement).addClass('js-line__hasComment');
					$(model.targetElement).append($( '<div class="comments"><span class="js-commentForm-toggle commentForm-toggle">Add a Comment +</span><span class="js-hide-comments">Hide Comments</span><ul class="comments__list"></ul></div>' ));
					if (typeof targetElementModel != 'undefined') {
						targetElementModel.set('commentCount', 1, {
							skipRender: true
						});
					}
				}
				
				if (typeof targetElementModel != 'undefined') {
					targetElementModel.set('commentCount', commentLengthInDom, {
						skipRender: true
					});
				}
								
				var commentItem = new hamlet.blueprints.CommentView({
					model: model,
					targetElement: $(model.targetElement + ' .comments .comments__list')
				}, this);

				hamlet.active.commentItems.push(commentItem);

				if (typeof targetElementModel != 'undefined') {
					model.set('targetElementModel', targetElementModel, {
						skipRender: true
					});
				}
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
		method: 'post',
		wait: true,

		success: function(model, response, options){
			appendFormMessage(formId, model.get('status'), model.get('message'));
			return false;
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

hamlet.active.editComment = function(model) {
	var formId = '#js-comment-form--edit';

	model.set('comment', $(formId).find('textarea[name="comment"]').val(), {
		silent: true
	});

	if (model.get('comment').trim() == '') {
		appendFormMessage(formId, 'error', 'Please be sure to include a comment.');
		return false;
	}

	model.save(model.toJSON(), {
		url: '/api/comments',
		wait: true,

		success: function(model, response, options){
			hamlet.active.comments.fetch();
			$(formId).velocity('transition.slideUpOut', {
				complete: function() {
					$(formId).remove();
					return false;
				}
			});
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

	return false;
};

hamlet.blueprints.CommentForm = Backbone.Model.extend({
	initialize: function() {
		console.log('A CommentForm model was born.');
	},
	defaults: {
		comment: '',
		id: '',
		formCssId: 'js-comment-form'
	}
});

hamlet.blueprints.CommentFormView = Backbone.View.extend({
	events: {
		'click .commentForm__dismiss': 'dismiss',
		'click .commentForm__submit': 'submit'
	},
	initialize: function() {
		console.log('A CommentFormView was born.');
		var self = this;
		this.template = _.template($('#commentFormTemplate').html());
		self.render();
	},
	render: function() {
		this.$el.append(this.template(this.model.attributes)).find('.commentForm').velocity('transition.slideUpIn');
		return this;
	},
	dismiss: function() {
		var self = this;
		this.$el.find('.commentForm').velocity('transition.slideUpOut', {
			complete: function() {
				self.$el.find('.commentForm').remove();
				self.$el.empty();
			}
		});
  	this.unbind();
	},
	submit: function(e) {
		e.preventDefault();

		if (this.$el.find('form').attr('id') == 'js-comment-form') {
			var obj = collectInputs(this.$el.find('#js-comment-form'));
			hamlet.active.createComment(obj);	
		} else {
			hamlet.active.editComment(this.model);
		}

		return false;

	}
})
