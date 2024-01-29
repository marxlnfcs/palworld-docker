import {existsSync, mkdirSync, writeFileSync, rmSync, accessSync, readFileSync} from 'fs';
import axios from 'axios';
import {createObservableStream} from "./rxjs.js";
import {dirname, resolve} from "path";
import extract from 'extract-zip';
import tar from 'tar';
import * as constants from "constants";
import ini from "ini";

/**
 * @param path {string}
 * @return boolean
 */
export function exists(path) {
  return existsSync(path);
}

/**
 * Creates a directory recursive if not exist
 * @param path {string}
 * @param mode {number}
 * @return void
 */
export function createDir(path, mode = 0o775) {
  !exists(path) && mkdirSync(path, {
    recursive: true,
    mode: mode,
  })
}

/**
 * Deletes a file recursive
 * @param path {string}
 * @return void
 */
export function deleteFile(path) {
  rmSync(path, {
    recursive: true,
  });
}

/**
 * Writes a file to the file system
 * @param file {string}
 * @param content {Buffer|string}
 * @param mode {number}
 */
export function createFile(file, content, mode = 0o775) {
  createDir(dirname(file));
  writeFileSync(file, content || '', {
    mode: mode,
  });
}

/**
 * @param url {string}
 * @param file {string}
 * @return Observable<AxiosProgressEvent>
 */
export function downloadFile(url, file) {
  return createObservableStream(async (next, error, done) => {
    try{

      // download file
      const response = await axios.request({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        onDownloadProgress: (event) => next(event),
      });

      // save blob to file system
      createFile(file, Buffer.from(response.data, 'binary'));

      // done
      done();

    }catch(e){
      error(e);
    }
  });
}

/**
 * @param file {string}
 * @param destination {string}
 */
export async function extractArchive(file, destination) {

  // create destination dir if not exists
  createDir(destination);

  // extract archive
  switch(true) {
    case file.endsWith('.zip'): {
      await extract(file, {
        dir: destination,
      });
      break;
    }
    case file.endsWith('.tar.gz') : {
      await tar.extract({
        file: file,
        cwd: destination
      });
      break;
    }
  }

}

/**
 * Parse an INI and returns it as object
 * @param file {string}
 * @param emptyOnNotFound {boolean}
 * @return object
 */
export function loadIniFromFile(file, emptyOnNotFound = true) {

  // check if file exists
  if(!existsSync(file)){
    if(emptyOnNotFound) return {};
    throw Error(`INI File "${ resolve(file) }" not found.`);
  }

  // check if file is readable
  try{ accessSync(file, constants.R_OK) } catch {
    throw Error(`Unable to access INI File "${ resolve(file) }".`);
  }

  // parse ini file
  let content = null;
  try{ content = ini.parse(readFileSync(file, 'utf-8')) } catch {
    throw Error(`Unable to parse INI File "${ resolve(file) }".`);
  }

  // return content
  return content || {};

}

/**
 * Parse an INI and returns it as object
 * @param object {object}
 * @param file {string}
 * @return void
 */
export function writeIniToFile(object, file) {
  try{ writeFileSync(file, ini.stringify(object)) } catch {
    throw Error(`Unable to write INI to File "${ resolve(file) }".`);
  }
}