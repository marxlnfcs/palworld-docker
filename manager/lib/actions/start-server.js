import {getServerConfig} from "./create-config.js";
import {infoLog} from "../utils/logger.js";
import {getAppDir, getAppExecutable, getAppId} from "../env.js";
import {getEnv} from "../utils/env.js";
import {Shell} from "../shell/shell.js";
import {toPromise} from "../utils/rxjs.js";

export function startServer() {
  return new Promise(async (resolve, reject) => {
    try{

      // get server config
      const config = getServerConfig();

      // log start of action
      infoLog(`Starting server (AppId: ${getAppId()}) with address ${config.PublicIP}:${config.PublicPort}...`);

      // parse environment variables
      const isCommunityServer = getEnv('PW_COMMUNITY_SERVER', 'false').trim().toLowerCase() === 'true';
      const isMultiThread = getEnv('PW_MULTITHREAD_ENABLED', 'true').trim().toLowerCase() === 'true';

      // create startup arguments
      const args = [];

      // check variable isCommunityServer
      isCommunityServer && args.push('EpicApp=PalServer');
      isMultiThread && args.push('-useperfthreads', '-NoAsyncLoadingThread', '-UseMultithreadForDS');

      // create process
      infoLog(`Starting Server with command: "${getAppExecutable()} ${args.join(' ')}"`, 1);
      const proc = Shell.run(getAppExecutable(), args, {
        cwd: getAppDir(),
      });

      // listen on data
      proc.data.subscribe((data) => infoLog(data, 2));

      // wait for process to close
      await toPromise(proc.exit);
      infoLog(`Server has been stopped.`);

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}