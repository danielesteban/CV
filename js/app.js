'use strict';

/* AppCache handler */
(function(window) {
	window.applicationCache && window.applicationCache.addEventListener('updateready', function(e) {
		if(window.applicationCache.status !== window.applicationCache.UPDATEREADY) return;
		try {
			window.applicationCache.swapCache();
		} catch(e) {}
		window.location.reload();
	}, false);
}(window));

/* App & Routes */
angular.module('Portfolio', [
	'ngAnimate',
	'ngDialog',
	'ngRoute',
	'ngTouch',
	'Portfolio.controllers',
	'Portfolio.directives',
	'Portfolio.filters',
	'Portfolio.services'
	/*,'Portfolio.templates'*/
])
.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {view: 'home', templateUrl: 'views/home.html'});
	$routeProvider.when('/project/:url', {view: 'project', controller: 'project', templateUrl: 'views/project.html'});
	$routeProvider.otherwise({redirectTo: '/'});
})
.run(function($rootScope) {
	$rootScope.$on("$routeChangeSuccess", function(event, current) {
		current.$$route && ($rootScope.view = current.$$route.view);
	});
	setTimeout(function() {
		angular.element(document.body).addClass('loaded');
	}, 0);
});
