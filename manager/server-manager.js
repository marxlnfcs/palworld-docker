import {createSteamCmd, isSteamCmdInstalled} from "./lib/helpers/steamcmd.js";
import {errorLog, infoLog} from "./lib/helpers/logger.js";
import {getEnv, getStartMode, getSteamCmdBinaryDir, getSteamCmdInstallDir} from "./lib/helpers/env.js";
import {configDotenv} from "dotenv";
import {installServer} from "./lib/modes/install-server.js";
import {updateServer} from "./lib/modes/update-server.js";
import {startServer} from "./lib/modes/start-server.js";
import {createConfig} from "./lib/modes/create-config.js";

async function run(){

  // Initialize environment
  infoLog('Initializing Environment ...');
  configDotenv()

  // Initialize SteamCMD instance
  infoLog('Initializing SteamCMD ...');
  if(!isSteamCmdInstalled()){
    infoLog(`Installing SteamCMD under "${getSteamCmdBinaryDir()}" ...`, 1);
  }
  await createSteamCmd({
    binDir: getSteamCmdBinaryDir(),
    installDir: getSteamCmdInstallDir(),
    username: 'anonymous',
    enableDebugLogging: getEnv('PW_DEBUG', 'false').trim().toLowerCase() === 'true',
  }).catch(() => null);

  // Run actions based on the START_MODE
  switch(getStartMode()){
    case 0: { // Install server and START
      await installServer();
      await createConfig();
      await startServer();
      break;
    }
    case 1: { // Install server and STOP
      await installServer();
      break;
    }
    case 2: { // Update server and STOP
      await updateServer();
      await createConfig();
      await startServer();
      break;
    }
    case 3: { // Update server and STOP
      await updateServer();
      break;
    }
    case 4: { // Backup server and STOP
      // todo
      break;
    }
    default: errorLog('Unknown "PW_START_MODE". Exiting.')
  }

  // stop application
  process.exit(0);

}

run();