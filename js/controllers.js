'use strict';

/* Controllers */
angular.module('Portfolio.controllers', [])
.controller('project', function($scope, $rootScope, $routeParams, $location, $sce, $timeout, $window, projects) {
	for(var i=0; i<projects.length; i++) {
		if(projects[i].url === $routeParams.url) {
			$scope.project = projects[i];
			break;
		}
	}
	if(!$scope.project) return $location.path('/');

	if($scope.project.description) {
		$scope.description = [];
		$scope.project.description.forEach(function(paragraph) {
			$scope.description.push($sce.trustAsHtml(paragraph));
		});
	}
	$scope.project.iframe && $timeout(function() {
		$scope.iframe = $sce.trustAsResourceUrl($scope.project.iframe);
	}, 500);
	$rootScope.$broadcast('activeProject', $scope.project);
	$scope.$on('$destroy', function() {
		$rootScope.$broadcast('activeProject', null);
	});
});
