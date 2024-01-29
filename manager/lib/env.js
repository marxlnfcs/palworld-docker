import {getEnv} from "./utils/env.js";
import {joinPaths} from "./utils/path.js";
import {getPlatform} from "./utils/platform.js";

/**
 * @return {number}
 */
export function getStartMode() {
  const startMode = parseInt(getEnv('PW_START_MODE') || getEnv('START_MODE'));
  return isNaN(startMode) ? 0 : startMode;
}

/**
 * @return {boolean}
 */
export function getDebug() {
  return (getEnv('PW_DEBUG') || getEnv('DEBUG') || 'false').trim().toLowerCase() === 'true';
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getWorkDir(path = null) {
  return joinPaths(getEnv('STEAMCMD_WORKDIR', '/data'), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getHomeDir(path = null) {
  return joinPaths(getEnv('STEAMCMD_HOMEDIR', '/home/steam'), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getBinaryDir(path = null) {
  return joinPaths(getEnv('STEAMCMD_BINARYDIR', getHomeDir('steamcmd')), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getInstallDir(path = null) {
  return joinPaths(getEnv('STEAMCMD_INSTALLDIR', getWorkDir('server')), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getConfigDir(path = null) {
  return joinPaths(getEnv('APP_CONFIGDIR', getWorkDir('config')), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getBackupsDir(path = null) {
  return joinPaths(getEnv('APP_BACKUPDIR', getWorkDir('backups')), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getSavesDir(path = null) {
  return joinPaths(getEnv('APP_SAVEDIR', getWorkDir('saves')), path);
}

/**
 * @return {number}
 */
export function getAppId() {
  return parseInt(getEnv('STEAMCMD_APP_ID', '2394010'));
}

/**
 * @return {string}
 */
export function getAppExecutable() {
  if(getEnv('STEAMCMD_APP_EXECUTABLE')) return getEnv('STEAMCMD_APP_EXECUTABLE');
  switch(getAppPlatform()) {
    case 'linux': return getAppDir('PalServer.sh');
    case 'macos': return getAppDir('PalServer.sh');
    case 'windows': return getAppDir('PalServer.exe');
  }
}

/**
 * @return {number}
 */
export function getAppLanguage() {
  return parseInt(getEnv('STEAMCMD_APP_LANGUAGE'));
}

/**
 * @return {'linux'|'windows'|'macos'}
 */
export function getAppPlatform() {
  return getEnv('STEAMCMD_APP_PLATFORM', getPlatform() || 'linux');
}

/**
 * @return {number}
 */
export function getAppPlatformBitness(){
  return getEnv('STEAMCMD_APP_PLATFORM_BITNESS');
}

/**
 * @return {string}
 */
export function getAppBetaName(){
  return getEnv('STEAMCMD_APP_BETA_NAME');
}

/**
 * @return {string}
 */
export function getAppBetaPassword(){
  return getEnv('STEAMCMD_APP_BETA_PASSWORD');
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppDir(path = null) {
  return joinPaths(
    getBinaryDir() === getInstallDir()
      ? getInstallDir('steamapps/common/PalServer')
      : getInstallDir(),
    path,
  );
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppSavedDir(path = null) {
  return joinPaths(getAppDir('Pal/Saved'), path);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppBinariesDir(path = null) {
  switch(getAppPlatform()){
    case 'linux': return joinPaths(getAppDir('Pal/Binaries/Linux'), path);
    case 'macos': return joinPaths(getAppDir('Pal/Binaries/Linux'), path);
    case 'windows': return joinPaths(getAppDir('Pal/Binaries/Win64'), path);
  }
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppConfigDir(path = null) {
  switch(getAppPlatform()){
    case 'linux': return joinPaths(getAppSavedDir('Config/LinuxServer'), path);
    case 'macos': return joinPaths(getAppSavedDir('Config/LinuxServer'), path);
    case 'windows': return joinPaths(getAppSavedDir('Config/WindowsServer'), path);
  }
}