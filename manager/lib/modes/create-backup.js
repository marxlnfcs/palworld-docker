import tar from 'tar';
import {infoLog} from "../helpers/logger.js";
import {getBackupsDir, getSavesDir} from "../helpers/env.js";
import {cpSync, mkdirSync, rmSync} from "fs";
import {basename, join} from 'path';

export async function createBackup() {
  return new Promise(async (resolve, reject) => {
    try{

      infoLog('Creating backup ...');

      // creating backup variables
      const backupName = generateBackupName();
      const backupTemp = getBackupsDir(backupName);
      const backupTempDir = join(backupTemp, 'Pal/Saved');
      const backupFile = getBackupsDir(`${backupName}.tar.gz`);

      // create temporary folder
      infoLog(`Creating temporary folder "${backupTemp}" ...`, 1);
      mkdirSync(backupTempDir, {
        recursive: true,
        mode: 0o775
      });

      // copy save folder into backupTemp
      infoLog(`Copying contents of "${getSavesDir()}" into temp folder ...`, 1);
      cpSync(getSavesDir(), backupTempDir, {
        recursive: true
      });

      // compress folder into tar.gz
      infoLog(`Compressing contents of temporary folder "${backupTemp}" into file "${backupFile}" ...`, 1);
      await tar.c({
        gzip: true,
        file: backupFile,
        cwd: backupTemp
      }, ['Pal'])

      // delete temporary folder
      infoLog(`Deleting temporary folder "${backupTemp}" ...`, 1);
      rmSync(backupTemp, { recursive: true });

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
