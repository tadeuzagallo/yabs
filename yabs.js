'use strict';

var semver = require('semver');
var plist = require('plist');
var minimist = require('minimist');
var fs = require('fs');
var path = require('path');

var argv = minimist(process.argv.slice(2));
var type = argv._[0] || 'patch';

if (argv.f) {
  bump(argv.f, argv.k || 'version', argv.r);
} else if (fs.existsSync('./.yabsrc')) {
  var config = JSON.parse(fs.readFileSync('./.yabsrc'));
  Object.keys(config).forEach(function (file) {
    var value = config[file];
    var key;
    var regex;

    if (value[0] === 'r') {
      regex = value;
    } else {
      key = value;
    }

    bump(file, key, regex);
  });
} else {
  console.error('No file provided and no config file found');
}

function invalidVersion(version, file) {
  throw new Error('Invalid version `' + version + '` found in `' + file + '`');
}

function bump(file, key, regex) {
  if (regex) {
    bumpRegex(file, regex);
  } else {
    var data = parseFile(file);
    var version = data[key];

    if (!version) {
      throw new Error('Key `' + key + '` not found in `' + file + '`');
    } else if (!semver.valid(version)) {
      invalidVersion(version, file);
    }

    data[key] = semver.inc(version, type);

    var content = buildFile(file, data);

    fs.writeFileSync(file, content);
  }
}

function parseFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error('File not found: ' + file);
  }

  var ext = path.extname(file);
  var content = fs.readFileSync(file).toString();

  switch (ext) {
    case '.json':
      return JSON.parse(content);
    case '.plist':
      return plist.parse(content);
    default:
      throw new Error('File type not supported: ' + ext);
  }
}

function buildFile(file, data) {
  switch (path.extname(file)) {
    case '.json':
      return JSON.stringify(data, null, '  ');
    case '.plist':
      return plist.build(data);
  }
}

function bumpRegex(file, regex) {
  if (regex[0] === 'r') {
    regex = regex.slice(1);
  }

  var content = fs.readFileSync(file).toString();
  var r = new RegExp(regex.replace('$version', '(\\d+\\.\\d+\\.\\d+)').slice(1, -1));
  var c = content.replace(r, function (match, version) {
    if (!semver.valid(version)) {
      invalidVersion(version, file);
    }

    return match.replace(version, semver.inc(version, type));
  });
  fs.writeFileSync(file, c);
}
