import {existsSync, mkdirSync, symlinkSync} from "fs";
import {getAppDir, getAppSavedDir, getBackupsDir, getConfigDir, getSavesDir} from "../helpers/env.js";
import {infoLog} from "../helpers/logger.js";
import {dirname} from "path";

export async function checkFileSystem(){
  infoLog('Checking FileSystem ...');

  // create config dir if not exists
  if(!existsSync(getConfigDir())){
    infoLog(`Creating directory "${getConfigDir()}" ...`);
    mkdirSync(getConfigDir(), {
      recursive: true,
      mode: 0o775
    });
  }

  // create backup dir if not exists
  if(!existsSync(getBackupsDir())){
    infoLog(`Creating directory "${getBackupsDir()}" ...`);
    mkdirSync(getBackupsDir(), {
      recursive: true,
      mode: 0o775
    });
  }

  // create saves dir if not exists
  if(!existsSync(getSavesDir())){
    infoLog(`Creating directory "${getSavesDir()}" ...`);
    mkdirSync(getSavesDir(), {
      recursive: true,
      mode: 0o775
    });
  }

  // create app dir if not exists
  if(!existsSync(dirname(getAppSavedDir()))){
    infoLog(`Creating directory "${dirname(getAppSavedDir())}" ...`);
    mkdirSync(dirname(getAppSavedDir()), {
      recursive: true,
      mode: 0o775
    });
  }

  // create symlink from app saves dir to saves dir
  if(!existsSync(getAppSavedDir()) && process.platform === 'linux'){
    infoLog(`Creating symlink of for "${getSavesDir()}" under "${getAppSavedDir()}" ...`);
    symlinkSync(getSavesDir(), getAppSavedDir(), 'dir');
  }

}