const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro can reach workspace libs and pnpm store
config.watchFolders = [workspaceRoot];

// Look for node_modules in both the artifact and the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Needed for workspace packages that use the "exports" field (e.g. api-client-react)
config.resolver.unstable_enablePackageExports = true;

// Follow pnpm symlinks in both the resolver and the file watcher
config.resolver.unstable_enableSymlinks = true;
config.watcher = {
  ...config.watcher,
  unstable_enableSymlinks: true,
};

module.exports = config;
