const fs = require('fs');
const plib = require('path');
const builtinModules = require('builtin-modules');
const ResolverFactory = require('enhanced-resolve/lib/ResolverFactory');
const { join } = plib;

const defaultGroups = ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']].reverse();

function getConfig(p) {
  try {
    return require(p);
  } catch (err) {
    console.warn(`could not read webpack config at: '${p}'`);
  }

  return {
    resolve: {
      alias: {}
    }
  };
}

const config = getConfig(join(process.cwd(), 'webpack.config.js'));
const opts = {
  paths: [],
  modulesDirectories: [join(process.cwd(), 'node_modules')], // (default) only node_modules
  extensions: ['', '.node', '.js', '.jsx', '.es6.js'], // these extension
  fileSystem: require('fs'),
  useSyncFileSystemCalls: true,
  alias: config.resolve.alias,
};
const resolver = ResolverFactory.createResolver(opts);
function resolve(name) {
  try {
    return resolver.resolveSync({}, process.cwd(), name);
  } catch (err) {
  }

  return null;
}

function getEslintConfig(name, cli) {
  try {
    return cli.getConfigForFile(name)
  } catch (err) {
    console.warn(err);
  }

  return null;
}

function getGroups(name) {
  const CLIEngine = require(resolve('eslint')).CLIEngine;
  const cli = new CLIEngine({});

  const eslintConfig = getEslintConfig(name, cli);

  if (eslintConfig != null) {
    return eslintConfig.rules['import/order'][1].groups;
  }

  return defaultGroups;
}

function getRank(type, groups) {
  let rank = 0;

  groups.forEach((group, i) => {
    if (Array.isArray(group) && group.indexOf(type) !== -1 || group === type) {
      rank = i;
    }
  });

  return rank;
}

function isAbsolute(name) {
  return name.indexOf('/') === 0;
}

function isBuiltIn(name) {
  return builtinModules.indexOf(name) !== -1;
}

function isExternalPath(name, path) {
  return !path || path.indexOf(join('node_modules', name)) > -1;
}

const externalModuleRegExp = /^\w/;
function isExternalModule(name, path) {
  return externalModuleRegExp.test(name) && isExternalPath(name, path);
}

const scopedRegExp = /^@\w+\/\w+/;
function isScoped(name) {
  return scopedRegExp.test(name);
}

function isInternalModule(name, path) {
  return externalModuleRegExp.test(name) && !isExternalPath(name, path);
}

function isRelativeToParent(name) {
  return name.indexOf('../') === 0;
}

const indexFiles = ['.', './', './index', './index.js'];
function isIndex(name) {
  return indexFiles.indexOf(name) !== -1;
}

function isRelativeToSibling(name) {
  return name.indexOf('./') === 0;
}

const rules = [
  [isBuiltIn, 'builtin'],
  [isExternalModule, 'external'],
  [isScoped, 'external'],
  [isInternalModule, 'internal'],
  [isRelativeToParent, 'parent'],
  [isIndex, 'index'],
  [isRelativeToSibling, 'sibling']
];

module.exports = function(name, path) {
  for (let i = 0; i < rules.length; i++) {
    const [rule, type] = rules[i];
    if(rule(name, path)) {
      return type;
    }
  }

  return 'unknown';
};

module.exports.resolve = resolve;
module.exports.isAbsolute = isAbsolute;
module.exports.getRank = getRank;
module.exports.getGroups = getGroups;