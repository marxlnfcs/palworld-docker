import {createSteamCmd, isSteamCmdInstalled} from "../helpers/steamcmd.js";
import {getEnv, getSteamCmdBinaryDir, getSteamCmdInstallDir} from "../helpers/env.js";
import {infoLog} from "../helpers/logger.js";

export async function initSteamCmd() {

    // Initialize SteamCMD instance
    infoLog('Initializing SteamCMD ...');

    // Inform the user that SteamCmd will be installed
    if(!isSteamCmdInstalled()){
        infoLog(`Installing SteamCMD under "${getSteamCmdBinaryDir()}" ...`, 1);
    }

    // Initialize SteamCmd
    await createSteamCmd({
        binDir: getSteamCmdBinaryDir(),
        installDir: getSteamCmdInstallDir(),
        username: 'anonymous',
        enableDebugLogging: getEnv('PW_DEBUG', 'false').trim().toLowerCase() === 'true',
    });

}