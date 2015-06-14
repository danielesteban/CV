'use strict';

/* Services */
angular.module('Portfolio.services', []).
value('projects', [
	{
		url: 'CFC',
		title: 'Corre, Forrest, ¡Corre!',
		shortTitle: 'CFC',
		iframe: 'projects/CFC/',
		desktop: 'projects/CFC/',
		android: 'http://danielesteban.github.io/Portfolio/projects/CFC.apk',
		tags: [
			'JavaScript', 'THREE.js', 'Cordova (Phonegap)', 'Android'
		],
		description: [
			'Este prototipo es un revival de los platformer retro al puro estilo <a href="https://en.wikipedia.org/wiki/Mario_Bros." target="_blank">Mario Bros.</a>, pero buscando la estética y el feeling de las primeras infografías y renders de los 80 À-la-<a href="https://en.wikipedia.org/wiki/Tron" target="_blank">Tron</a>.',
			'Está programado en JavaScript para facilitar su portabilidad a multiples plataformas mediante <a href="https://cordova.apache.org/" target="_blank">Codova</a> y utiliza la librería <a href="http://threejs.org/" target="_blank">THREE.js</a> como motor de rendering por su alto rendimiento con geometrías 3D y un inteligente uso de la GPU.',
			'El GUI está implementado con el superheróico framework <a href="https://angularjs.org/">AngularJS</a>.',
			'Como guinda del pastel, utiliza el <a href="https://developers.soundcloud.com/docs/api/guide" target="_blank">API de SoundCloud</a> para reproducir el, ya clásico, <a href="https://www.youtube.com/watch?v=ZTidn2dBYbY" target="_blank">True Survivor</a> de David Hasselhoff en el fondo.'
		]
	},
	{
		url: 'IsoMetric',
		title: 'IsoMetric',
		iframe: 'projects/IsoMetric/',
		desktop: 'projects/IsoMetric/',
		android: 'http://danielesteban.github.io/Portfolio/projects/IsoMetric.apk',
		tags: [
			'JavaScript', 'Pixi.js', 'Cordova (Phonegap)', 'Android'
		],
		description: [
			'El concepto detrás de este prototipo es un cruce entre <a href="https://minecraft.net/" target="_blank">Minecraft</a> y <a href="http://www.simcity.com/" target="_blank">SimCity</a>.',
			'La mágia de un sandbox game, donde el editor de niveles está integrado en el juego, pero con el rendering retro en perspectiva isométrica para obtener un buen rendimiento incluso en plataformas móviles.',
			'Ya que todo esto requería de un motor personalizado, elegí JavaScript como lenguaje por su extrema portabilidad a multiples plataformas, tanto en su versión web, como en aplicaciones nativas encapsuladas con <a href="https://cordova.apache.org/" target="_blank">Codova</a>.',
			'Elegí Pixi.js como motor de rendering por su excelente failover, desde la GPU (WebGL) a la CPU (Canvas), y por mi familiaridad con el mismo.',
			'La música del juego se descarga y reproduce mediante el <a href="https://developers.soundcloud.com/docs/api/guide" target="_blank">API de SoundCloud</a>.',
			'El GUI, tanto de los menús como del gameplay, está implementado con <a href="https://angularjs.org/">AngularJS</a>.'
		]
	},
	{
		url: 'GMVS',
		title: 'Google Maps Vertical Scroller',
		shortTitle: 'GMVS',
		android: 'http://danielesteban.github.io/Portfolio/projects/GMVS.apk',
		slides: [
			'gmvs-1.png',
			'gmvs-2.png',
			'gmvs-3.png'
		],
		portrait: true,
		tags: [
			'C99', 'Java', 'Simple DirectMedia Layer', 'Google Maps API', 'Android NDK'
		],
		description: [
			'El motor del juego esta programado desde cero en ISO C (C99), tan sólo ayudado por la librería <a href="https://www.libsdl.org" target="_blank">Simple DirectMedia Layer</a>, y compilado con el <a href="https://developer.android.com/tools/sdk/ndk/index.html" target="_blank">Native Development Kit</a> de Android.',
			'El concepto general para el prototipo era hacer un clon del clásico de 16bit <a href="https://en.wikipedia.org/wiki/Aero_Fighters" target="_blank">AeroFighters</a>, pero integrando la geografía de la localización actual del usuario en el gameplay.',
			'Tiene una pequeña parte en Java para leer los valores del acelerómetro, obtener la localización del GPS y mostrar los intersitiales de <a href="http://www.google.com/admob/" target="_blank">AdMob</a>. Pero gracias a su arquitectura es fácilmente portable a cualquier otra plataforma móvil y/ó desktop.'
		]
	},
	{
		url: 'MMORPG',
		shortTitle: 'MMORPG',
		title: 'Massively multiplayer online role-playing game',
		iframe: 'http://mmorpg.dabuten.co/',
		desktop: 'http://mmorpg.dabuten.co/',
		tags: [
			'JavaScript', 'Pixi.js', 'SockJS', 'Node.js'
		],
		description: [
			'El concepto detrás de este prototipo se resume en 2 palabras: "<a href="https://en.wikipedia.org/wiki/Pok%C3%A9mon_(video_game_series)" target="_blank">Pokémon</a>" y "<a href="https://en.wikipedia.org/wiki/Massively_multiplayer_online_role-playing_game" target="_blank">MMORPG</a>"',
			'El cliente del juego está programado desde cero en JavaScript utilizando <a href="http://www.pixijs.com/" target="_blank">Pixi.js</a> como motor de rendering.',
			'El servidor del juego es un servicio de <a href="https://nodejs.org/" target="_blank">Node.js</a> y está también programado en JavaScript, lo que permite la reusabilidad de gran parte de la lógica y evita gran parte de los errores de paridad entre servidor y cliente, ya que la gran mayoría del código está compartido entre ambos.',
			'Este tipo de aplicaciones requieren un corto tiempo de respuesta y una comunicación bidireccional, de ahí que el protocolo de comunicación esté envuelto en WebSockets con ayuda de la librería <a href="https://github.com/sockjs/sockjs-client">SockJS</a>. Esto nos otorga el canal de comunicación más rápido disponible, degradando desde WebSockets hasta HTTP Polling.'
		]
	}
])
.factory('arrayShuffle', function() {
	return function(array) {
		var index = array.length;

		while(0 !== index) {
			var randomIndex = Math.floor(Math.random() * index);
			index--;

			var val = array[index];
			array[index] = array[randomIndex];
			array[randomIndex] = val;
		}
	}
});
