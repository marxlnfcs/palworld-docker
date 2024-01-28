import {createSteamCmd} from "../steamcmd/steamcmd.js";
import {getAppId, getAppPlatform, getBinaryDir, getInstallDir} from "../env.js";
import {errorLog, infoLog} from "../utils/logger.js";
import {toPromise} from "../utils/rxjs.js";
import {catchError, map, of} from "rxjs";

export function initSteamCmd() {
  return new Promise(async (resolve, reject) => {
    try{

      // create SteamCmd instance
      infoLog('Initializing SteamCmd...');
      const steam = createSteamCmd({
        binaryDir: getBinaryDir(),
        installDir: getInstallDir(),
        username: 'anonymous',
        platform: getAppPlatform(),
        appId: getAppId(),
      });

      // initialize SteamCmd
      await toPromise(steam.initSteamCMD().pipe(
        catchError(e => of(({ message: e.stack, indent: 0, exitCode: e.code }))),
        map(event => {
          if(!event.exitCode){
            return infoLog(event.message, event.indent+1)
          }else{
            return errorLog(event.message, event.indent+1, event.exitCode)
          }
        })
      ));

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}