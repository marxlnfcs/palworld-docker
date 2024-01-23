import {infoLog} from "../helpers/logger.js";
import {getAppId, getSteamCmdInstallDir} from "../helpers/env.js";
import {getSteamCmd, isAppInstalled} from "../helpers/steamcmd.js";
import {bytesToSize} from "../helpers/utils.js";

/**
 * @param logTitle {boolean}
 * @returns {Promise<void>}
 */
export async function installServer(logTitle = true) {
  logTitle && infoLog(`Checking server (AppId: ${getAppId()}) ...`);

  // skip if has been already installed
  if(await isAppInstalled()){
    infoLog('Server has been already installed. Skipping.', 1);
    return;
  }

  // start installation of server
  infoLog(`Installing server under "${getSteamCmdInstallDir()}" ...`, 1);
  const generator = getSteamCmd().updateApp(getAppId(), {
    validate: true,
  });

  // get update progress
  let currentStatus = null;
  for await (let status of generator){
    switch(status.state){
      case 'downloading': {
        infoLog(`Installing ${status.progressPercent}% (${bytesToSize(status.progressAmount)} / ${bytesToSize(status.progressTotalAmount)}) ...`, 2);
        currentStatus = 'downloading';
        break;
      }
    }
  }

  // server has been installed
  infoLog(`Server has been installed successfully.`);

}