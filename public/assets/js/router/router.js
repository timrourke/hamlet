var hamlet = hamlet || {};
hamlet.blueprints = hamlet.blueprints || {};
hamlet.active = hamlet.active || {};

/*
 *	Router Definitions
 *
 */

hamlet.active.ActRouter = Backbone.Router.extend({
	routes: {
		"": "index",
		"users/confirm-email/:uuid": "confirmUser",
		"act/:act/scene/:scene": "act"
	},

	index: function() {
		
	},

	act: function(act, scene) {
		if (hamlet.active.sceneView) {
			hamlet.active.sceneView.close();	
		}

		hamlet.active.scene = new hamlet.blueprints.Scene(hamlet.active.acts.get('c' + act).get('scenes')[scene-1].lines);

		hamlet.active.sceneView = new hamlet.blueprints.SceneView({
			el: $('#act__container'),
			collection: hamlet.active.scene
		}).render();
	},

	confirmUser: function(uuid) {
		uuidRequest = {
			url: window.location.protocol + '//' + window.location.host + '/api/users/confirm-email/' + uuid,
			dataType: 'json',
			success: function(response) {
				var modalObj = {
					heading: response.status.toProperCase(),
					body: response.message,
					controls: [{
						class: 'modal__dismiss',
						value: 'OK'
					}]
				}

				renderModal(modalObj);
			},
			error: function(error) {
				var modalObj = {
					heading: error.responseJSON.status.toProperCase(),
					body: error.responseJSON.message,
					controls: [{
						class: 'modal__dismiss',
						value: 'OK'
					},{
						class: 'modal__requestNewConfirmationEmail',
						value: 'Request New Confirmation Email'
					}]
				}

				renderModal(modalObj);
			}
		}

		$.ajax(uuidRequest);
	}
});

// Use absolute URLs  to navigate to anything not in your Router.
var openLinkInTab = false;

// Only need this for pushState enabled browsers
if (Backbone.history) {
  $(document).keydown(function(event) {
    if (event.ctrlKey || event.keyCode === 91) {
      openLinkInTab = true;
    }
  });
  
  $(document).keyup(function(event) {
    openLinkInTab = false;
  });

  // Use delegation to avoid initial DOM selection and allow all matching elements to bubble
  $(document).on('click', "a", function(evt) {
    // Get the anchor href and protcol
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";

    // Ensure the protocol is not part of URL, meaning its relative.
    // Stop the event bubbling to ensure the link will not cause a page refresh.
    if (!openLinkInTab && href.slice(protocol.length) !== protocol) {
      evt.preventDefault();

      // Note by using Backbone.history.navigate, router events will not be
      // triggered.  If this is a problem, change this to navigate on your
      // router.
      Backbone.history.navigate(href, true);
    }
  });
}