'use strict';

/* Directives */
angular.module('Portfolio.directives', [])
.directive('aside', function($window, projects) {
	var asideWidth = 200,
		triangleSize = 16,
		triangleHalfSize = triangleSize / 2;

	return {
		restrict: 'E',
		templateUrl: 'partials/aside.html',
		link: function(scope, element, attrs) {
			scope.projects = projects;
			scope.$on('activeProject', function(event, project) {
				if(project) scope.active = project.url;
				else delete scope.active;
			});

			var canvas = angular.element('<canvas>')[0],
				canvasContext = canvas.getContext('2d'),
				renderer = angular.element('<canvas>')[0],
				ctx = renderer.getContext('2d'),
				ticksPerFrame = 1000 / 10,
				lastAnimationTicks = 0,
				animationRequest = null,
				colors = {},
				resize = function() {
					canvas.width = asideWidth;
					canvas.height = $window.innerHeight;
				},
				render = function() {
					var currentTicks = new Date() * 1;
					var timeout = Math.max(0, ticksPerFrame - (currentTicks - lastAnimationTicks));
					animationRequest = setTimeout(render, timeout);
					lastAnimationTicks = currentTicks + timeout;

					var numCols = Math.ceil(renderer.width / triangleSize) + 1,
						numRows = Math.ceil(renderer.height / triangleSize) + 2,
						numTriangles = numCols * numRows,
						color = function() {
							var hue = {
									r: Math.floor(Math.random() * 41) - 20,
									g: Math.floor(Math.random() * 41) - 20,
									b: Math.floor(Math.random() * 41) - 20
								},
								intensity = 220 + Math.floor(Math.random() * 16),
								addNoise = function() {
									intensity += Math.floor(Math.random() * 5) - 2;
									intensity = Math.max(200, Math.min(235, intensity));
								};

							return {
								addNoise: addNoise,
								rgb: function() {
									return 'rgb(' + (intensity + hue.r) + ',' + (intensity + hue.g) + ',' + (intensity + hue.b) + ')';
								}
							}
						};

					renderer.width = renderer.width;
					
					var x = -triangleSize,
						y = -triangleSize;

					for(var i=0; i<numTriangles; i++) {
						if(!colors[i]) colors[i] = color();
						colors[i].addNoise();

						ctx.beginPath();
						ctx.moveTo(x, y + triangleSize);
						ctx.lineTo(x + triangleHalfSize, y);
						ctx.lineTo(x + triangleSize, y + triangleSize);
						ctx.fillStyle =	colors[i].rgb();
						ctx.fill();

						if(!colors[-i]) colors[-i] = color();
						colors[-i].addNoise();
						ctx.beginPath();
						ctx.moveTo(x + triangleHalfSize, y);
						ctx.lineTo(x + triangleSize, y + triangleSize + 1);
						ctx.lineTo(x + (triangleSize * 2), y);
						ctx.fillStyle = colors[-i].rgb();
						ctx.fill();

						x += triangleSize;
						if(i > 0 && i % numCols === 0) {
							x = (i / numCols) % 2 === 0 ? -triangleSize : -triangleHalfSize;
							y += triangleSize;
						}
					}

					canvasContext.beginPath();
					canvasContext.rect(0, 0, canvas.width, canvas.height);
					canvasContext.fillStyle = canvasContext.createPattern(renderer, "repeat");
					canvasContext.fill();
				};

			renderer.width = asideWidth;
			renderer.height = triangleSize * 12;
			resize();
			render();
			element.append(canvas);

			$window.addEventListener('resize', resize, false);
			scope.$on('$destroy', function() {
				$window.removeEventListener('resize', resize);
			});
		}
	}
})
.directive('checkerboard', function($window, arrayShuffle) {
	var asideWidth = 200,
		tileSize = 64,
		tileHalfSize = tileSize / 2;

	return {
		restrict: 'E',
		link: function(scope, element, attrs) {
			var ticksPerFrame = 1000 / 30,
				lastAnimationTicks = 0,
				tiles = [],
				numCols = Math.ceil(($window.innerWidth - asideWidth) / tileSize),
				numRows = Math.ceil($window.innerHeight / tileSize),
				i = 0;

			for(var y=0; y<numRows; y++) {
				for(var x=0; x<numCols; x++) {
					var tile = angular.element('<div>');
					tile.css('top', (y * tileSize) + 'px').css('left', (x * tileSize) + 'px');
					element.append(tile);
					tiles.push(i++);
				}
			}

			arrayShuffle(tiles);

			var animate = function() {
					var i = 0;
					while(i++ < 20 && tiles.length) {
						var tile = element.children().eq(tiles.shift()),
							x = parseInt(tile.css('left'), 10),
							y = parseInt(tile.css('top'), 10);

						tile
							.css('width', 0)
							.css('height', 0)
							.css('left', (x + tileHalfSize) + 'px')
							.css('top', (y + tileHalfSize) + 'px');
					}

					if(tiles.length) {
						var currentTicks = new Date() * 1;
						var timeout = Math.max(0, ticksPerFrame - (currentTicks - lastAnimationTicks));
						setTimeout(animate, timeout);
						lastAnimationTicks = currentTicks + timeout;
					} else {
						setTimeout(function() {
							element.remove();
						}, 250);
					}
				};

			animate();
		}
	}
})
.directive('slides', function($timeout) {
	return {
		restrict: 'E',
		scope: {
			slides: '='
		},
		link: function(scope, element, attrs) {
			var imgs = [];
			scope.slides.forEach(function(slide) {
				var img = angular.element('<img>');
				img.attr('src', 'img/' + slide);
				element.append(img);
				imgs.push(img);
			});
			
			var current = imgs.length - 1,
				nextTimeout = null,
				next = function() {
					imgs[current].removeClass('active');
					++current >= imgs.length && (current = 0);
					imgs[current].addClass('active');
					nextTimeout = $timeout(next, 3000);
				};
			
			next();
			scope.$on('$destroy', function() {
				$timeout.cancel(nextTimeout);
			});
		}
	};
})
.directive('qrcode', function() {
	return {
		restrict: 'E',
		scope: {
			url: '='
		},
		link: function(scope, element, attrs) {
			var qrcode = new QRCode(element[0], {
				text: scope.url,
				width: 380,
				height: 380
			});
		}
	};
})
.directive('people', function($interval, arrayShuffle) {
	var words = [
			'humanos',
			'terrícolas',
			'amigos',
			'hermanos',
			'clientes',
			'colegas',
			'ídolos',
			'mentores',
			'artistas',
			'diseñadores',
			'españoles',
			'madrileños',
			'europeos',
			'familia',
			'analistas',
			'programadores',
			'desarrolladores'
		];

	return {
		restrict: 'E',
		scope: {},
		template: '{{word}}',
		link: function(scope, element, attrs) {
			var current = words.length,
				update = function() {
					if(++current >= words.length) {
						current = 0;
						arrayShuffle(words);
					}
					scope.word = words[current];
				};

			update();
			var interval = $interval(update, 1500);
			scope.$on('$destroy', function() {
				$interval.cancel(interval);
			});
		}
	};
});
