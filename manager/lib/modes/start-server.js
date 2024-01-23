import {infoLog, serverErrorLog, serverInfoLog} from "../helpers/logger.js";
import {getAppDir, getAppExecutable, getAppId, getEnv} from "../helpers/env.js";
import child_process from "child_process";
import {getServerConfig} from "./create-config.js";

export async function startServer() {
  return new Promise(async (resolve) => {
    const config = getServerConfig();
    infoLog(`Starting server (AppId: ${getAppId()}) with address ${config.PublicIP}:${config.PublicPort}...`);

    // parse environment variables
    const isCommunityServer = getEnv('PW_COMMUNITY_SERVER', 'False').trim().toLowerCase() === 'true';
    const isMultiThread = getEnv('PW_MULTITHREAD_ENABLED', 'True').trim().toLowerCase() === 'true';

    // create startup arguments
    const args = [];

    // check variable isCommunityServer
    isCommunityServer && args.push('EpicApp=PalServer');
    isMultiThread && args.push('-useperfthreads', '-NoAsyncLoadingThread', '-UseMultithreadForDS');

    // create process
    const proc = child_process.spawn(getAppExecutable(), {
      cwd: getAppDir(),
    });

    // listen to stdout/stderr
    proc.stdout.on('data', (chunk) => serverInfoLog(chunk.toString(), 1));
    proc.stderr.on('data', (chunk) => serverErrorLog(chunk.toString(), 1));

    // listen to close
    proc.on('close', () => {
      infoLog(`Server has been stopped.`);
      resolve();
    });

  });
}