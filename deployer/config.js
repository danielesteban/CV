var config = {
		app: 'Portfolio',
		bundle: 'bundle/',
		repo: '../',
		content: [
			'fonts/',
			'img/',
			'projects/',
			'index.html',
			'lib.js'
		],
		less: 'screen.less',
		js: [
			'js/'
		],
		templates: [
			'views/',
			'partials/'
		],
		production: {
			git: 'git@github.com:danielesteban/Portfolio.git',
			branch: 'gh-pages',
			repo: 'production/'
		}
	};

module.exports = config;
