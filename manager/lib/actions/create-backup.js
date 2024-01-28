import {infoLog} from "../utils/logger.js";
import {createDir, deleteFile} from "../utils/fs.js";
import {cpSync} from 'fs';
import tar from 'tar';
import {getAppSavedDir, getBackupsDir, getSavesDir} from "../env.js";
import {joinPaths} from "../utils/path.js";

export function createBackup() {
  return new Promise(async (resolve, reject) => {
    try{

      // log start of action
      infoLog('Creating backup...');

      // creating backup variables
      const backupName = generateBackupName();
      const backupTemp = getBackupsDir(backupName);
      const backupTempDir = joinPaths(backupTemp, 'Pal/Saved');
      const backupFile = getBackupsDir(`${backupName}.tar.gz`);

      // create temporary folder
      infoLog(`Creating temporary folder "${backupTemp}"...`, 1);
      createDir(backupTempDir);

      // copy save folder into backupTemp
      infoLog(`Copying contents of "${getAppSavedDir()}" into temp folder...`, 1);
      cpSync(getAppSavedDir(), backupTempDir, {
        recursive: true
      });

      // compress folder into tar.gz
      infoLog(`Compressing contents of temporary folder "${backupTemp}" into file "${backupFile}"...`, 1);
      await tar.c({
        gzip: true,
        file: backupFile,
        cwd: backupTemp
      }, ['Pal']);

      // delete temporary folder
      infoLog(`Deleting temporary folder "${backupTemp}"...`, 1);
      deleteFile(backupTemp);

      // backup was successful
      infoLog(`The backup was successfully created at "${backupFile}".`);
      resolve();

    }catch(e){
      reject(e);
    }
  });
}

function generateBackupName(){
  const id = generateBackUpId();
  const date = (new Date()).toISOString().replace(/([0-9]+)-([0-9]+)-([0-9]+)T([0-9]+):([0-9]+):([0-9]+)\.([0-9])+Z/gm, '$1-$2-$3T$4-$5-$6');
  return `saves_${date}_${id}`;
}

function generateBackUpId() {
  const min = 10000;
  const max = 99999;
  return Math.floor(Math.random() * (max - min) + min);
}
