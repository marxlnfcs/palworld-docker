import {infoLog} from "../helpers/logger.js";
import {getAppId, getSteamCmdInstallDir} from "../helpers/env.js";
import {getSteamCmd, isAppInstalled} from "../helpers/steamcmd.js";
import {bytesToSize} from "../helpers/utils.js";
import {installServer} from "./install-server.js";

/**
 * @param logTitle {boolean}
 * @returns {Promise<void>}
 */
export async function updateServer(logTitle = true) {
  logTitle && infoLog(`Checking server (AppId: ${getAppId()}) ...`);

  // skip if has been already installed
  if(!await isAppInstalled()){
    infoLog('Server has not been installed yet. Starting installation now...', 1);
    await installServer(false);
    return;
  }

  // start installation of server
  infoLog(`Updating server under "${getSteamCmdInstallDir()}" ...`, 1);
  const generator = getSteamCmd().updateApp(getAppId(), {
    validate: true,
  });

  // get update progress
  let currentStatus = null;
  for await (let status of generator){
    switch(status.state){
      case 'downloading': {
        infoLog(`Updating ${status.progressPercent}% (${bytesToSize(status.progressAmount)} / ${bytesToSize(status.progressTotalAmount)}) ...`, 2);
        currentStatus = 'downloading';
        break;
      }
      default: console.log(status);
    }
  }

  // check status
  if(!currentStatus){
    infoLog('There is already the latest release installed. Skipping.', 1);
  }

  // server has been updated
  infoLog(`Server has been updated successfully.`);

}