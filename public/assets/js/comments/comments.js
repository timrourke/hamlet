var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Comments Classes
 *
 */

hamlet.blueprints.Comment = Backbone.Model.extend({
	initialize: function() {
		console.log('A comment was born.');
	}
});

hamlet.blueprints.Comments = Backbone.Collection.extend({
	url: '/api/comments',
	model: hamlet.blueprints.Comment,
	initialize: function() {
		console.log('A comments collection was born.');
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

hamlet.active.comments = new hamlet.blueprints.Comments;

