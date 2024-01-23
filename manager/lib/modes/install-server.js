import {infoLog} from "../helpers/logger.js";
import {getAppId} from "../helpers/env.js";
import {getSteamCmd, isAppInstalled} from "../helpers/steamcmd.js";
import {bytesToSize} from "../helpers/utils.js";

export async function installServer() {
  infoLog(`Installing server (AppId: ${getAppId()}) ...`);

  // skip if has been already installed
  if(await isAppInstalled()){
    infoLog('Server has been already installed. Skipping.', 1);
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
          infoLog('Starting installation ...', 1);
        }
        infoLog(`Installing ${status.progressPercent}% (${bytesToSize(status.progressAmount)} / ${bytesToSize(status.progressTotalAmount)}) ...`, 2);
        currentStatus = 'downloading';
        break;
      }
    }
  }

  // server has been installed
  infoLog(`Server has been installed successfully.`);

}