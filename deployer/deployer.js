#!/usr/local/bin/node
var config = require('./config.js'),
	charm = require('charm')(),
	closurecompiler = require('closurecompiler'),
	crypto = require('crypto'),
	exec = require('child_process').exec,
	fs = require('fs-extra'),
	less = require('less'),
	path = require('path'),
	screen;

/* Set defaults */
!config.colors && (config.colors = {
	bg: 'black',
	fg: 'red',
	active: 'red',
	done: 'green',
	error: 'red'
});

!config.header && (config.header = [
	" _(`-')    (`-')  _ _  (`-')                                (`-')  _   (`-')  ",
	"( (OO ).-> ( OO).-/ \\-.(OO )   <-.        .->        .->    ( OO).-/<-.(OO )  ",
	" \\    .'_ (,------. _.'    \\ ,--. )  (`-')----.  ,--.'  ,-.(,------.,------,) ",
	" '`'-..__) |  .---'(_...--'' |  (`-')( OO).-.  '(`-')'.'  / |  .---'|   /`. ' ",
	" |  |  ' |(|  '--. |  |_.' | |  |OO )( _) | |  |(OO \\    / (|  '--. |  |_.' | ",
	" |  |  / : |  .--' |  .___.'(|  '__ | \\|  |)|  | |  /   /)  |  .--' |  .   .' ",
	" |  '-'  / |  `---.|  |      |     |'  '  '-'  ' `-/   /`   |  `---.|  |\\  \\  ",
	" `------'  `------'`--'      `-----'    `-----'    `--'     `------'`--' '--' "
]);

/* AbsolutePaths */
config.bundle = path.join(__dirname, config.bundle);
config.cordova && (config.cordova = path.join(__dirname, config.cordova));
config.repo = path.join(__dirname, config.repo);
config.production.repo = path.join(__dirname, config.production.repo);

/* Main render routine */
function render() {
	charm.reset();
	charm.cursor(false);

	charm.background(config.colors.bg);
	charm.foreground(config.colors.fg);

	var y;

	for(y=1; y<4; y++) charm.write(Array(process.stdout.columns + 1).join(' '));

	var paddingL = Array(Math.max(0, Math.round((process.stdout.columns - config.header[0].length) / 2)) + 1).join(' '),
		paddingR = Array(Math.max(0, process.stdout.columns - config.header[0].length - paddingL.length) + 1).join(' ');

	config.header.forEach(function(line) {
		charm.write(paddingL + line + paddingR);
		y++;
	});

	var l = y + 2;
	for(; y<l; y++) charm.write(Array(process.stdout.columns + 1).join(' '));

	y = screen.render(y);

	for(; y<=process.stdout.rows; y++) charm.write(Array(process.stdout.columns + 1).join(' '));
}

/* Exit routine */
function exit() {
	process.stdin.setRawMode(false);
    charm.reset();
    process.exit();
}

/* Menu Screen */
function menu() {
	screen = {
		active: 0,
		width: 30,
		items: [
			"BUILD & DEPLOY BUNDLE",
			"BUILD BUNDLE",
			"DEPLOY BUNDLE",
			"EXIT"
		],
		keydown: function(key) {
			switch(key) {
				case '27.91.65': //UP
					var prev = this.active;
					if(--this.active < 0) this.active = this.items.length - 1;
					this.renderItem(prev);
					this.renderItem(this.active);
				break;
				case '27.91.66': //Down
					var prev = this.active;
					if(++this.active >= this.items.length) this.active = 0;
					this.renderItem(prev);
					this.renderItem(this.active);
				break;
				case '13': //Enter
				case '32': //Space
					switch(this.active) {
						case 0:
							full();
						break;
						case 1:
							build();
						break;
						case 2:
							deploy();
						break;
						default:
							exit();
						break;
					}
				break;
			}
		},
		renderItem: function(index) {
			var item = this.items[index];

			charm.position(0, this.itemsY + index);

			charm.write(this.paddingL + '|');

			if(this.active === index) {
				charm.background(config.colors.active);
				charm.foreground(config.colors.bg);
			}
			charm.write('  ' + item + Array(this.width - item.length - 1).join(' '));

			if(this.active === index) {
				charm.background(config.colors.bg);
				charm.foreground(config.colors.fg);
			}
			charm.write('|' + this.paddingR);

			charm.background(config.colors.bg);
			charm.foreground(config.colors.fg);
		},
		render: function(y) {
			this.paddingL = Array(Math.max(0, Math.round((process.stdout.columns - this.width) / 2))).join(' ');
			this.paddingR = Array(Math.max(0, process.stdout.columns - this.width - this.paddingL.length) - 1).join(' ');

			charm.write(this.paddingL + ' ' + Array(this.width + 1).join('-') + ' ' + this.paddingR);

			this.itemsY = ++y;
			for(var i=0; i<this.items.length; i++) {
				this.renderItem(i);
				y++;
			}

			charm.write(this.paddingL + ' ' + Array(this.width + 1).join('-') + ' ' + this.paddingR);
			return ++y;
		}
	};
	render();
}

/* Tasks screen class */
function screenTasks(render) {
	this.animationTimeout = null;
	this.animationStep = 0;
	this.padding = Array(2).join(' ');
	this.render = render;
}

screenTasks.prototype.animate = function() {
	var self = this,
		chars = ['|', '/', '-', '\\', '|', '/', '-', '\\'];

	charm.left(6);
	charm.write('[ ' + chars[this.animationStep] + ' ] ');

	if(++this.animationStep >= chars.length) this.animationStep = 0;

	this.animationTimeout = setTimeout(function() {
		self.animate();
	}, 150);
};

screenTasks.prototype.task = function(title) {
	if(this.animationTimeout != null) {
		clearTimeout(this.animationTimeout);
		charm.left(7);
		charm.foreground(config.colors.done);
		charm.write('[DONE] ');
		charm.foreground(config.colors.fg);
	}
	charm.write(this.padding + title + Array(process.stdout.columns - (this.padding.length + title.length) + 1).join(' '));
	this.animate();
};

screenTasks.prototype.done = function() {
	this.task('');
	clearTimeout(this.animationTimeout);
	charm.left(6);
	charm.write(Array(7).join(' '));
	this.isDone = true;
	var text = '··· Press any key to continue ···',
		paddingL = Array(Math.max(0, Math.round((process.stdout.columns - text.length) / 2))).join(' '),
		paddingR = Array(Math.max(0, process.stdout.columns - text.length - paddingL.length) - 1).join(' '),
		br = Array(process.stdout.columns + 1).join(' ');

	charm.write(br);
	charm.write(paddingL + text + paddingR);
	charm.write(br);
};

screenTasks.prototype.keydown = function() {
	this.isDone && menu();
};

/* Build & Deploy Screen */
function full() {
	build(function() {
		_deploy(screen);
	});
}

function build(callback) {
	screen = new screenTasks(function(y) {
		var self = this;
		process.nextTick(function() {
			charm.position(0, y);

			var createBundle = function() {
					self.task('Creating bundle');
					fs.remove(config.bundle, function() {
						fs.mkdir(config.bundle, function() {
							var content = config.content.slice();
							['js', 'templates'].forEach(function(type) {
								if(!config[type]) return;
								config[type].forEach(function(location) {
									content.push(location);
								});
							});
							var count = content.length;
							if(!count) return compileLess();
							content.forEach(function(c) {
								fs.copy(path.join(config.repo, c), path.join(config.bundle, c), function() {
									--count === 0 && compileLess();
								});
							});
						});
					});
				},
				compileLess = function() {
					if(!config.less) return compressTemplates();
					self.task('Compiling less');
					fs.readFile(path.join(config.repo, config.less), {encoding: 'utf-8'}, function(err, data) {
						less.render(data, {
							paths: [path.dirname(config.less)],
							filemame: config.less,
							compress: true
						}, function(err, output) {
							fs.writeFile(path.join(config.bundle, 'screen.css'), output.css, function() {
								fs.unlink(path.join(config.bundle, 'js', 'less.js'), function() {
									compressTemplates();
								});
							});
						});
					});
				},
				compressTemplates = function() {
					var dircount = config.templates.length;
					if(!dircount) return compileJS();
					self.task('Compressing templates');
					var templates = "angular.module('" + config.app + ".templates',[]).run(function($templateCache){";
					config.templates.forEach(function(location) {
						fs.readdir(path.join(config.bundle, location), function(err, list) {
							var files = [];
							list.forEach(function(file) {
								file.substr(file.length - 5) === '.html' && files.push(file);
							});
							var count = files.length;
							if(!count) return dircount--;
							files.forEach(function(file) {
								fs.readFile(path.join(path.join(config.bundle, location), file), {encoding: 'utf-8'}, function(err, data) {
									templates += "$templateCache.put('" + location + file + "'," + JSON.stringify(data.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '')) + ");";
									if(--count !== 0) return;
									fs.remove(path.join(config.bundle, location), function() {
										if(--dircount !== 0) return;
										fs.writeFile(path.join(config.bundle, 'templates.js'), templates + '});', function() {
											compileJS();
										});
									});
								});
							});
						});
					});
					dircount === 0 && compileJS();
				},
				compileJS = function() {
					if(!config.js.length) return updateIndex();
					self.task('Compiling js');
					var files = [];
					config.js.forEach(function(location) {
						var list = fs.readdirSync(location = path.join(config.bundle, location));
						list.forEach(function(file) {
							file.substr(file.length - 3) === '.js' && files.push(path.join(location, file));
						});
					});
					
					var templates = path.join(config.bundle, 'templates.js'),
						hasTemplates = fs.existsSync(templates);

					hasTemplates && files.push(templates);
					
					var count = files.length;
					if(count === 0) return updateIndex();

					var compile = function() {
							closurecompiler.compile(files, {
								compilation_level: "SIMPLE_OPTIMIZATIONS"
							}, function(err, js) {
								var count = config.js.length;
								config.js.forEach(function(location) {
									fs.remove(path.join(config.bundle, location), function() {
										--count === 0 && fs.writeFile(path.join(config.bundle, 'app.js'), js, function() {
											if(!hasTemplates) return updateIndex();
											fs.unlink(templates, function() {
												fs.unlink(templates + '.annotated', function() {
													updateIndex();
												});
											});
										});
									});
								});
							});
						};

					files.forEach(function(file, index) {
						fs.readFile(file, {encoding: 'utf-8'}, function(err, data) {
							fs.writeFile(file, data.replace(new RegExp('\\/\\*,\'' + config.app + '.templates\'\\*\\/', 'g'), ',\'' + config.app + '.templates\'').replace(/'use strict';/g, ''), function() {
								exec(__dirname + '/node_modules/.bin/ng-annotate -ra ' + file + ' -o ' + file + '.annotated', function() {
									files[index] = file + '.annotated';
									--count === 0 && compile();
								});
							});
						});
					});
				},
				updateIndex = function() {
					self.task('Updating index');
					fs.readFile(path.join(config.bundle, 'index.html'), {encoding: 'utf-8'}, function(err, data) {
						data = data.replace(/<html /, '<html manifest="/app.manifest" ');

						var index = data.substr(0, data.indexOf('<script src="lib.js"></script>')).replace(new RegExp(config.less.replace('/', '\\/')), 'screen.css').replace(/stylesheet\/less/, 'stylesheet').replace(/<script src="js\/less\.js"><\/script>/, '') + 
							'<script src="lib.js"></script>' + 
							'<script src="app.js"></script>' + 
							data.substr(data.indexOf('</body>'));
					
						fs.writeFile(path.join(config.bundle, 'index.html'), index.replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, ''), function() {
							writeManifest();
						});					
					});
				},
				writeManifest = function() {
					self.task('Writing manifest');
					var indexMD5 = crypto.createHash('md5').update(fs.readFileSync(path.join(config.bundle, 'index.html'))).digest('hex'),
						cssMD5 = crypto.createHash('md5').update(fs.readFileSync(path.join(config.bundle, 'screen.css'))).digest('hex'),
						libMD5 = crypto.createHash('md5').update(fs.readFileSync(path.join(config.bundle, 'lib.js'))).digest('hex'),
						appMD5 = crypto.createHash('md5').update(fs.readFileSync(path.join(config.bundle, 'app.js'))).digest('hex'),
						manifest = "CACHE:\n";

					for(var j=0; j<2; j++) {
						if(j === 1) manifest += "/ ";
						manifest += "/?" + indexMD5 + "\n";
						if(j === 1) manifest += "/screen.css ";
						manifest += "/screen.css?" + cssMD5 + "\n";
						if(j === 1) manifest += "/lib.js ";
						manifest += "/lib.js?" + libMD5 + "\n";
						if(j === 1) manifest += "/app.js ";
						manifest += "/app.js?" + appMD5 + "\n";
						j === 0 && (manifest += "\nFALLBACK:\n");
					}
					
					manifest += "\nNETWORK:\n/app.manifest\n";
					
					config.content.forEach(function(location) {
						if(['index.html', 'lib.js'].indexOf(location) !== -1) return;
						manifest += "/" + location + "\n";
					})	

					manifest +=	"*\n";

					manifest = "CACHE MANIFEST\n\n# " + crypto.createHash('md5').update(manifest).digest('hex') + "\n\n" + manifest;
					fs.writeFile(path.join(config.bundle, 'app.manifest'), manifest, function() {
						if(callback) return callback();
						self.done();
					});
				};

			createBundle();
		});
		return y;
	});
	render();
}

/* Deploy screen */
function deploy() {
	if(!fs.existsSync(config.bundle)) return full();
	screen = new screenTasks(function(y) {
		var self = this;
		process.nextTick(function() {
			charm.position(0, y);
			_deploy(self);
		});
		return y;
	});
	render();
}

/* Deploy logic */
function _deploy(self) {
	var clone = function() {
			if(fs.existsSync(config.production.repo)) return update();
			if(!config.production.git) return self.done();
			self.task('Cloning production repo');
			exec('git clone -b ' + config.production.branch + ' --single-branch ' + config.git + ' ' + config.production.repo, function() {
				update();
			});
		},
		update = function() {
			self.task('Updating production repo');
			exec('cd ' + config.production.repo + ' && git pull origin ' + config.production.branch + ' && rm -rf * && cp -R ' + path.join(config.bundle, '*') + ' . && git add . && git commit -m "release-' + Math.round(new Date() / 1000) + '" && git push origin ' + config.production.branch, function() {
				if(config.production.host && config.production.cmd) restart();
				else self.done();
			});
		},
		restart = function() {
			self.task('Updating production server');
			exec('ssh ' + config.production.host + ' "' + config.production.cmd + '"', function() {
				self.done();
			});
		}

	clone();
}

/* Keyboard input */
process.stdin.setRawMode(true);
process.stdin.on('data', function(buf) {
	var key = [].join.call(buf, '.');
	switch(key) {
		case '3': //^C
			exit();
		break;
		default:
			screen.keydown && screen.keydown(key);
	}
});

/* Bind resize event */
process.stdout.on('resize', function() {
	render();
});

/* Init */
charm.pipe(process.stdout);
menu();
