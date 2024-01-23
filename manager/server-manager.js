import {errorLog, infoLog} from "./lib/helpers/logger.js";
import {getStartMode} from "./lib/helpers/env.js";
import {configDotenv} from "dotenv";
import {installServer} from "./lib/modes/install-server.js";
import {updateServer} from "./lib/modes/update-server.js";
import {startServer} from "./lib/modes/start-server.js";
import {createConfig} from "./lib/modes/create-config.js";
import {initSteamCmd} from "./lib/modes/init-steamcmd.js";

async function run(){

  // Initialize environment
  infoLog('Initializing Environment ...');
  configDotenv()

  // Run actions based on the START_MODE
  switch(getStartMode()){
    case 0: { // Install server and START
      await initSteamCmd();
      await installServer();
      await createConfig();
      await startServer();
      break;
    }
    case 1: { // Install server and STOP
      await initSteamCmd();
      await installServer();
      break;
    }
    case 2: { // Update server and START
      await initSteamCmd();
      await updateServer();
      await createConfig();
      await startServer();
      break;
    }
    case 3: { // Update server and STOP
      await initSteamCmd();
      await updateServer();
      break;
    }
    case 4: { // Backup server and STOP
      // todo
      break;
    }
    case 99: { // Maintenance Mode
      infoLog('Entered Maintenance Mode.');
      while(true){
        await new Promise((r) => {
          setTimeout(() => r(), 5000);
        });
      }
      break;
    }
    default: errorLog('Unknown "PW_START_MODE". Exiting.')
  }

  // stop application
  process.exit(0);

}

run();