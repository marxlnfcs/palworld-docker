import {getSteamCmd} from "../steamcmd/steamcmd.js";
import {errorLog, infoLog, infoObjectLog} from "../utils/logger.js";
import {getAppId} from "../env.js";
import {toPromise} from "../utils/rxjs.js";
import {catchError, map, of} from "rxjs";

export function updateServer() {
  return new Promise(async (resolve, reject) => {
    try{

      // log start of action
      infoLog(`Initializing application "${getAppId()}"...`);

      // get app information
      infoLog(`Getting information about application...`, 1);
      const appInfo = await getSteamCmd().getAppInfo();

      // check application state
      infoLog('Checking application state...', 1);

      // install application
      infoLog('Updating application...', 2);
      await toPromise(getSteamCmd().updateApp().pipe(
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