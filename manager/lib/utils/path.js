import {fileURLToPath} from "url";
import {join, resolve} from 'path';

/**
 * @param path {string|null}
 * @return {string}
 */
export function getWorkingDirectory(path = null){
  return path ? resolve(join(getWorkingDirectory(), path)) : fileURLToPath(process.cwd());
}

/**
 * @param paths {...(string|null)[]}
 * @return {string}
 */
export function joinPaths(...paths) {
  return resolve(join(...paths.filter(p => !!p)));
}