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