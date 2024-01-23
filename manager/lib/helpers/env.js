import {join, resolve} from 'path';

/**
 * Returns true when the environment variable is set
 * @param key {string}
 * @return boolean
 */
export function isEnvSet(key) {
  return typeof process.env[key] !== undefined && process.env[key] !== null;
}

/**
 * Returns an environment variable or a fallback
 * @param key {string}
 * @param fallback {string|null}
 */
export function getEnv(key, fallback = null) {
  return process.env[key] ?? fallback;
}

/**
 * @return {number}
 */
export function getAppId() {
  return 2394010;
}

/**
 * @return {number}
 */
export function getStartMode() {
  const startMode = parseInt(getEnv('PW_START_MODE'));
  return isNaN(startMode) ? 0 : startMode;
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getSteamCmdBinaryDir(path = null) {
  return resolve(path ? join(getSteamCmdBinaryDir(), path) : getEnv('STEAMCMD_BINDIR', '/data/steam'));
}

/**
 * @return {string}
 */
export function getSteamCmdBinaryExec() {
  const execName = process.platform === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh';
  return getSteamCmdBinaryDir(execName);
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getSteamCmdInstallDir(path = null) {
  return resolve(path ? join(getSteamCmdInstallDir(), path) : getEnv('STEAMCMD_INSTALLDIR', '/data/server'));
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getConfigDir(path = null) {
  return resolve(path ? join(getConfigDir(), path) : getEnv('STEAMCMD_CONFIGDIR', '/data/config'));
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppDir(path = null) {
  return resolve(path ? join(getAppDir(), path) : getSteamCmdBinaryDir() === getSteamCmdInstallDir() ? join(getSteamCmdInstallDir(), 'steamapps/common/PalServer') : getSteamCmdInstallDir());
}

/**
 * @return {string}
 */
export function getAppExecutable() {
  return getAppDir(process.platform === 'win32' ? 'PalServer.exe' : 'PalServer.sh');
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppSavedDir(path = null) {
  return resolve(path ? join(getAppSavedDir(), path) : getAppDir('Saved'));
}

/**
 * @param path {string|null}
 * @return {string}
 */
export function getAppConfigDir(path = null) {
  return resolve(path ? join(getAppConfigDir(), path) : getAppSavedDir('Config/' + (process.platform === 'win32' ? 'WindowsServer' : 'LinuxServer')));
}