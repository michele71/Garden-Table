const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Let Metro watch the whole monorepo so it can resolve workspace packages
config.watchFolders = [workspaceRoot];

// Tell Metro where to look for node_modules in pnpm's non-flat layout
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// pnpm uses symlinks — make sure Metro follows them
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
