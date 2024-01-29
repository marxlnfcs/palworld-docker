import {getServerConfig} from "./create-config.js";
import {infoLog} from "../utils/logger.js";
import {getAppBinariesDir, getAppDir, getAppExecutable, getAppId, getAppPlatform} from "../env.js";
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

      // create commands based on the platform
      const command = await createCommand([
        isCommunityServer ? `EpicApp=PalServer` : null,

        isMultiThread ? '-useperfthreads' : null,
        isMultiThread ? '-NoAsyncLoadingThread' : null,
        isMultiThread ? '-UseMultithreadForDS' : null,
      ]);

      // create process
      infoLog(`Starting Server with command: "${command.executable} ${command.arguments.join(' ')}"`, 1);
      const proc = Shell.run(command.executable, command.arguments, {
        cwd: command.cwd || getAppBinariesDir(),
        env: command.env || {},
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

export async function createCommand(args = []) {
  args = args.filter(a => !!a);
  switch(getAppPlatform()) {
    case 'linux': return await createCommandLinux(args);
    case 'macos': return await createCommandMacOS(args);
    case 'windows': return await createCommandWindows(args);
  }
}

export async function createCommandLinux(args = []){
  return {
    executable: getAppExecutable(),
    arguments: args,
    cwd: getAppDir(),
  }
}

export async function createCommandMacOS(args = []) {
  throw new Error('Platform not implemented yet.');
}

export async function createCommandWindows(args = []){
  return {
    executable: getAppExecutable(),
    arguments: args,
    cwd: getAppDir(),
  }
}