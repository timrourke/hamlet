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
		"about": "about",
		"users/confirm-email/:uuid": "confirmUser",
		"act/:act/scene/:scene": "act"
	},

	index: function() {
		//Init Home page view
		hamlet.active.homePageView = hamlet.active.homePageView || new hamlet.blueprints.HomePageView();
		hamlet.active.homePageView.render({
			act: 1,
			scene: 1
		});

		if (hamlet.active.commentsView) {
			hamlet.active.commentsView.close()
		}
		if (hamlet.active.sceneView) {
			hamlet.active.sceneView.$el.velocity('transition.slideLeftOut', {
				display: 'block',
				complete: function() {
					hamlet.active.sceneView.close();	

					hamlet.active.scene = new hamlet.blueprints.Scene(hamlet.active.acts.get('c1').get('scenes')[0].lines, {
						act: 1,
						scene: 1
					});

					hamlet.active.sceneView = new hamlet.blueprints.SceneView({
						el: $('#act__container'),
						collection: hamlet.active.scene
					}).render();	
				}
			});
		} else {
			hamlet.active.scene = new hamlet.blueprints.Scene(hamlet.active.acts.get('c1').get('scenes')[0].lines, {
				act: 1,
				scene: 1
			});
			hamlet.active.sceneView = new hamlet.blueprints.SceneView({
				el: $('#act__container'),
				collection: hamlet.active.scene
			}).render();
		}
	},

	about: function() {
		if (hamlet.active.commentsView) {
			hamlet.active.commentsView.close()
		}
		if (hamlet.active.sceneView) {
			hamlet.active.sceneView.$el.velocity('transition.slideLeftOut', {
				display: 'block',
				complete: function() {
					hamlet.active.sceneView.close();	

					//Init About page view
					hamlet.active.aboutPageView = hamlet.active.aboutPageView || new hamlet.blueprints.AboutPageView();
					hamlet.active.aboutPageView.render();
					
				}
			});
		} else {
			//Init About page view
			hamlet.active.aboutPageView = hamlet.active.aboutPageView || new hamlet.blueprints.AboutPageView();
			hamlet.active.aboutPageView.render();
		}
		
	},

	act: function(act, scene) {
		//Init Home page view
		hamlet.active.homePageView = hamlet.active.homePageView || new hamlet.blueprints.HomePageView();
		hamlet.active.homePageView.render({
			act: act,
			scene: scene
		});

		if (hamlet.active.commentsView) {
			hamlet.active.commentsView.close()
		}
		if (hamlet.active.sceneView) {
			hamlet.active.sceneView.$el.velocity('transition.slideLeftOut', {
				display: 'block',
				complete: function() {
					hamlet.active.sceneView.close();	

					hamlet.active.scene = new hamlet.blueprints.Scene(hamlet.active.acts.get('c' + act).get('scenes')[scene-1].lines, {
						act: parseInt(act),
						scene: parseInt(scene)
					});

					hamlet.active.sceneView = new hamlet.blueprints.SceneView({
						el: $('#act__container'),
						collection: hamlet.active.scene
					}).render();	
				}
			});
		} else {
			hamlet.active.scene = new hamlet.blueprints.Scene(hamlet.active.acts.get('c' + act).get('scenes')[scene-1].lines, {
				act: parseInt(act),
				scene: parseInt(scene)
			});
			hamlet.active.sceneView = new hamlet.blueprints.SceneView({
				el: $('#act__container'),
				collection: hamlet.active.scene
			}).render();
		}

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