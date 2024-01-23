import {infoLog} from "../helpers/logger.js";
import {getAppId} from "../helpers/env.js";
import {getSteamCmd, isAppInstalled} from "../helpers/steamcmd.js";
import {bytesToSize} from "../helpers/utils.js";
import {installServer} from "./install-server.js";

export async function updateServer() {
  infoLog(`Updating server (AppId: ${getAppId()}) ...`);

  // skip if has been already installed
  if(!await isAppInstalled()){
    infoLog('Server has not been installed yet. Starting installation now...', 1);
    await installServer();
    return;
  }

  // start installation of server
  const generator = getSteamCmd().updateApp(getAppId(), {
    validate: true,
  });

  // get update progress
  let currentStatus = null;
  for await (let status of generator){
    switch(status.state){
      case 'downloading': {
        if(currentStatus !== status.state){
          infoLog('Starting update ...', 1);
        }
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