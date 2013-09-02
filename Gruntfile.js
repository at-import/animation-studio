'use strict';
var _ = require('underscore');
var _s = require('underscore.string');
var os = require('os');

module.exports = function (grunt) {

  //////////////////////////////
  // Import Grunt Configuration
  //
  // Combine with System options
  //////////////////////////////
  var deepmerge = require('deepmerge');
  var userConfig = grunt.file.readJSON('.system.json');
  userConfig = deepmerge(userConfig, grunt.file.readYAML('config.yml'));

  grunt.userConfig = userConfig;

  // Slugs and Stuff
  grunt.userConfig.extSlug = _s.slugify(userConfig.extension.name);
  grunt.userConfig.extCamelCase = _s.camelize(grunt.userConfig.extSlug);
  grunt.userConfig.extCamelCase = grunt.userConfig.extCamelCase.charAt(0).toUpperCase() + grunt.userConfig.extCamelCase.slice(1);

  // Asset Paths
  var htmlDir = userConfig.assets.htmlDir;
  var imagesDir = userConfig.assets.imagesDir;
  var cssDir = userConfig.assets.cssDir;
  var sassDir = userConfig.assets.sassDir;
  var jsDir = userConfig.assets.jsDir;
  var fontsDir = userConfig.assets.fontsDir;
  var componentsDir = userConfig.assets.componentsDir;

  // Server Configuration
  var port = userConfig.server.port;
  var lrport = port + 1;
  var debugport = port + 2;
  var root = userConfig.server.root;
  var hostname = userConfig.server.hostname;
  var extHost = os.hostname() + '.local';

  // Github Configuration
  var gh_commit = userConfig.git.defaultCommit;
  var gh_upstream = userConfig.git.deployUpstream;
  //////////////////////////////
  //Grunt Config
  //////////////////////////////
  grunt.initConfig({
    // Development Server
    connect: {
      server: {
        options: {
          port: port,
          base: root,
          hostname: hostname
        }
      }
    },

    // Watch Task
    watch: {
      options: {
        livereload: lrport
      },
      html: {
        files: [
          htmlDir + '/**/*.html'
        ],
        tasks: ['copy:dev']
      },
      js: {
        files: [
          jsDir + '/**/*.js',
          '!' + jsDir + '/**/*.min.js'
        ],
        tasks: ['jshint', 'uglify:dev']
      },
      images: {
        files: [imagesDir + '/**/*'],
        tasks: ['copy:dev']
      },
      fonts: {
        files: [fontsDir + '/**/*'],
        tasks: ['copy:dev']
      },
      sass: {
        files: [sassDir + '/**/*.scss'],
        tasks: ['compass:dev'],
        options: {
          livereload: false
        }
      },
      css: {
        files: [root + '/' + cssDir + '/**/*.css'],
        tasks: ['csslint']
      }
    },

    // Compass Task
    compass: {
      options: {
        sassDir: sassDir,
        config: 'config.rb',
        bundleExec: true
      },
      dev: {
        options: {
          imagesDir: root + '/' + imagesDir,
          cssDir: root + '/' + cssDir,
          javascriptsDir: root + '/' + jsDir,
          fontsDir: root + '/' + fontsDir
        }
      }
    },

    // JSHint Task
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        jsDir + '/{,**/}*.js',
        '!' + jsDir + '/{,**/}*.min.js'
      ]
    },

    // CSS Lint
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      all: [
        root + '/' + cssDir + '/{,**/}*.css'
      ]
    },

    // Uglify Task
    uglify: {
      dev: {
        options: {
          mangle: false,
          compress: false,
          beautify: true
        },
        files: [{
          expand: true,
          cwd: jsDir,
          src: ['**/*.js', '!**/*.min.js'],
          dest: root + '/' + jsDir,
          ext: '.js'
        }]
      }
    },

    // Copy Task
    copy: {
      dev: {
        files: [
          {
            expand: true,
            cwd: fontsDir,
            src: ['**'],
            dest: root + '/' + fontsDir
          },
          {
            expand: true,
            cwd: imagesDir,
            src: ['**'],
            dest: root + '/' + imagesDir
          },
          {
            expand: true,
            cwd: htmlDir,
            src: ['**'],
            dest: root
          }
        ]
      },
      ext: {
        files: [
          {
            expand: true,
            cwd: sassDir,
            src: userConfig.sass,
            dest: '.compass/stylesheets'
          },
          {
            expand: true,
            cwd: imagesDir,
            src: userConfig.templates.project.images,
            dest: '.compass/templates/project'
          },
          {
            expand: true,
            cwd: jsDir,
            src: userConfig.templates.project.js,
            dest: '.compass/templates/project'
          },
          {
            expand: true,
            cwd: fontsDir,
            src: userConfig.templates.project.fonts,
            dest: '.compass/templates/project'
          }
        ]
      }
    },

    // Concat
    concat: {
      rb: {
        options: {
          process: true
        },
        files: {
          '.compass/lib/animation-studio.rb': ['.compass/.template/extension.rb']
        }
      },
      gemspec: {
        options: {
          process: true
        },
        files: {
          '.compass/animation-studio.gemspec': ['.compass/.template/extension.gemspec']
        }
      }
    },

    // Parallel Task
    parallel: {
      ext: {
        options: {
          grunt: true
        },
        tasks: ['copy:ext', 'concat:rb', 'concat:gemspec']
      },
      extDebug: {
        options: {
          grunt: true,
          stream: true
        },
        tasks: ['watch', 'exec:weinre']
      },
      extDebugLaunch: {
        options: {
          grunt: true,
          stream: true
        },
        tasks: ['watch', 'exec:weinre', 'exec:launch:' + extHost, 'exec:launch:' + extHost + ':' + debugport + ':client']
      }
    },

    // Exec Task
    exec: {
      launch: {
        cmd: function(host, prt, suffix) {
          prt = prt || port;
          suffix = suffix || '';
          return 'open http://' + host + ':' + prt + '/' + suffix;
        }
      },
      tagMake: {
        cmd: 'git tag v' + userConfig.client.version
      },
      tagPush: {
        cmd: 'git push --tags ' + userConfig.git.deployUpstream
      },
      ext: {
        cmd: 'cd .compass && bundle exec gem build animation-studio.gemspec && mv animation-studio-' + userConfig.client.version + '.gem ../animation-studio-' + userConfig.client.version + '.gem && cd ..'
      },
      install: {
        cmd: 'gem install animation-studio-' + userConfig.client.version + '.gem && rm animation-studio-' + userConfig.client.version + '.gem'
      },
      release: {
        cmd: 'gem push animation-studio-' + userConfig.client.version + '.gem && rm animation-studio-' + userConfig.client.version + '.gem'
      },
      bundle: {
        cmd: function(path) {
          if (path === '.') {
            return 'bundle install';
          }
          else {
            return 'cd ' + path + '/ && bundle install && cd ..';
          }
        }
      },
      weinre: {
        cmd: 'weinre --httpPort ' + debugport + ' --boundHost -all-'
      },
    },

    bump: {
      options: {
        files: [
          'package.json',
          '.system.json'
        ],
        commit: userConfig.bump.commit,
        commitFiles: userConfig.bump.files,
        createTag: userConfig.bump.tag,
        push: userConfig.bump.push,
        pushTo: userConfig.git.deployUpstream
      }
    }

  });

  grunt.event.on('watch', function(action, filepath) {
    grunt.config([
      'copy:dev',
      'uglify:dev',
      'compass:dev',
      'generator:dev',
      'jshint',
      'csslint'
    ], filepath);
  });

  //////////////////////////////
  // Grunt Task Loads
  //////////////////////////////
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  //////////////////////////////
  // Tag Task
  //////////////////////////////
  grunt.registerTask('tag', 'Tags your release', function() {
    var push = grunt.option('push');

    grunt.task.run('exec:tagMake');

    if (push) {
      grunt.task.run('exec:tagPush');
    }
  });

  //////////////////////////////
  // Server Task
  //////////////////////////////
  grunt.registerTask('server-init', [
    'copy:dev',
    'uglify:dev',
    'compass:dev',
    'jshint',
    'csslint'
  ]);

  grunt.registerTask('server', 'Starts a development server', function() {

    var launch = grunt.option('launch');

    grunt.task.run(['bundler']);

    grunt.task.run(['server-init', 'connect']);

    if (hostname == '*') {
      grunt.task.run(['hostname']);
      if (launch) {
        grunt.task.run(['parallel:extDebugLaunch']);
      }
      else {
        grunt.task.run(['parallel:extDebug']);
      }
    }
    else {
      if (launch) {
        grunt.task.run('exec:launch:localhost');
      }
      grunt.task.run('watch');
    }
  });

  //////////////////////////////
  // Hostname
  //////////////////////////////
  grunt.registerTask('hostname', 'Find Hostname', function() {
    console.log('Server available on local network at http://' + extHost + ':' + port);
    console.log('Remote inspector available on local network at http://' + extHost + ':' + debugport + '/client');
  });

  //////////////////////////////
  // Update Bundler
  //////////////////////////////
  grunt.registerTask('bundler', 'Manages Development Dependencies', function(path) {
    var path = path || '.';
    var gemfileContent = "# Pull gems from RubyGems\nsource 'https://rubygems.org'\n";
    _.forEach(grunt.userConfig.dependencies, function(v, e) {
      gemfileContent += "gem '" + e + "', '" + v + "'\n";
    });
    grunt.file.write(path + '/Gemfile', gemfileContent);

    grunt.task.run(['exec:bundle:' + path]);
  });

  //////////////////////////////
  // Compass Extension
  //////////////////////////////
  grunt.registerTask('extension', 'Build your Compass Extension', function() {
    grunt.task.run(['bundler:.compass']);
    // grunt.file.copy('bower.json', '.compass/templates/project/bower.json');
    // grunt.file.copy('.editorconfig', '.compass/templates/project/editorconfig.txt');
    // grunt.file.copy('.bowerrc', '.compass/templates/project/bowerrc.txt');
    // grunt.file.copy('.jshintrc', '.compass/templates/project/jshintrc.txt');
    // grunt.file.copy('.csslintrc', '.compass/templates/project/csslintrc.txt');

    // Add Styleguide to Gemfile
    var gemfile = grunt.file.read('Gemfile');
    gemfile += "\ngem 'Animation Studio', '~>" + grunt.userConfig.client.version + "'";
    grunt.file.write('.compass/templates/project/Gemfile.txt', gemfile);

    grunt.task.run(['parallel:ext', 'exec:ext']);

    var install = grunt.option('install');
    var release = grunt.option('release');

    if (install) {
      grunt.task.run(['exec:install']);
    }

    if (release) {
      grunt.task.run(['exec:release']);
    }
  });
};