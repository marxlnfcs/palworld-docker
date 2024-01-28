import {existsSync, mkdirSync, writeFileSync, rmSync} from 'fs';
import axios from 'axios';
import {createObservableStream} from "./rxjs.js";
import {dirname} from "path";
import extract from 'extract-zip';
import tar from 'tar';

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