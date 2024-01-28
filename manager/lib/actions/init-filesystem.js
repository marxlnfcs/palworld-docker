import {infoLog} from "../utils/logger.js";
import {createDir, exists} from "../utils/fs.js";
import {getAppConfigDir, getAppSavedDir, getConfigDir, getSavesDir} from "../env.js";
import {dirname} from 'path';
import {isPlatformUnix} from "../utils/platform.js";
import {symlinkSync} from "fs";

export function initFileSystem() {
  return new Promise(async (resolve, reject) => {
    try{

      // log start of function
      infoLog('Initializing FileSystem...');

      // create config dir if not exists
      if(!exists(getConfigDir())){
        infoLog(`Creating directory "${getConfigDir()}"...`, 1);
        createDir(getConfigDir());
      }

      // create saves dir if not exists
      if(!exists(getSavesDir())){
        infoLog(`Creating directory "${getSavesDir()}"...`, 1);
        createDir(getSavesDir());
      }

      // create app config dir if not exists
      if(!exists(getAppConfigDir())){
        infoLog(`Creating directory "${getAppConfigDir()}"...`, 1);
        createDir(getAppConfigDir());
      }

      // create app saves dir if not exists
      if(!exists(dirname(getAppSavedDir()))){
        infoLog(`Creating directory "${dirname(getAppSavedDir())}"...`, 1);
        createDir(dirname(getAppSavedDir()));
      }

      // create symlink from app saves to saves dir
      if(isPlatformUnix() && !exists(getAppSavedDir())){
        infoLog(`Creating symlink from "${getAppSavedDir()} to "${getSavesDir()}..."`, 1);
        symlinkSync(getSavesDir(), getAppSavedDir(), 'dir');
      }

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}