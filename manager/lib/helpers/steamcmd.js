import {SteamCmd} from "steamcmd-interface";
import {getAppId, getSteamCmdBinaryExec, getSteamCmdInstallDir} from "./env.js";
import {accessSync} from "fs";
import * as constants from "constants";

let steamCmd = null;

/**
 * Returns true if the SteamCMD is installed
 * @return boolean
 */
export function isSteamCmdInstalled() {
  try{
    accessSync(getSteamCmdBinaryExec(), constants.X_OK);
    return true;
  }catch{
    return false;
  }
}

/**
 * Returns an initialized SteamCMD instance
 * @param options {
 *   binDir: string,
 *   installDir: string,
 *   username: string,
 *   enableDebugLogging: boolean
 * }
 * @return Promise<SteamCmd>
 */
export function createSteamCmd(options = null) {
  return new Promise(async (resolve, reject) => {
    try{
      if(!steamCmd){
        steamCmd = await SteamCmd.init(options || {});
      }
      resolve(steamCmd);
    }catch(e){
      reject(e);
    }
  });
}

/**
 * @returns {SteamCmd}
 */
export function getSteamCmd() {
  if(!steamCmd){
    throw new Error('SteamCMD is not initialized yet. Please run SteamCmd.init(...) first.');
  }
  return steamCmd;
}

/**
 * @param commands {string[]}
 * @returns Promise<string[]>
 */
export async function runSteamCmdSync(commands = [])  {
  const results = [];
  for await (let line of await getSteamCmd().run(commands)) {
    results.push(line);
  }
  return results;
}

/**
 * @return Promise<boolean>
 */
export async function isAppInstalled() {
  try{
    const result = await runSteamCmdSync([`force_install_dir "${getSteamCmdInstallDir()}"`, 'app_info_update 1', `app_status ${getAppId()}`]);
    return !!result.filter(i => i.indexOf('Fully Installed') !== -1).length;
  }catch{
    return false;
  }
}