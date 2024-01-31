import {initEnvironment} from "./actions/init-environment.js";
import {initFileSystem} from "./actions/init-filesystem.js";
import {getStartMode} from "./env.js";
import {errorLog} from "./utils/logger.js";
import {initSteamCmd} from "./actions/init-steamcmd.js";
import {installServer} from "./actions/install-server.js";
import {startServer} from "./actions/start-server.js";
import {createConfig} from "./actions/create-config.js";
import {updateServer} from "./actions/update-server.js";
import {createBackup} from "./actions/create-backup.js";
import {startMaintenance} from "./actions/start-maintenance.js";

/**
 * @param action {'INIT_ENVIRONMENT'|'INIT_FILESYSTEM'|'INIT_STEAMCMD'|'INSTALL_SERVER'|'UPDATE_SERVER'|'CREATE_CONFIG'|'CREATE_BACKUP'|'START_SERVER'|'START_MAINTENANCE'}
 * @returns {Promise<void>}
 */
async function runAction(action) {
  switch(action){
    case 'INIT_ENVIRONMENT': return initEnvironment();
    case 'INIT_FILESYSTEM': return initFileSystem();
    case 'INIT_STEAMCMD': return initSteamCmd();
    case 'INSTALL_SERVER': return installServer();
    case 'UPDATE_SERVER': return updateServer();
    case 'CREATE_CONFIG': return createConfig();
    case 'CREATE_BACKUP': return createBackup();
    case 'START_SERVER': return startServer();
    case 'START_MAINTENANCE': return await startMaintenance();
  }
}

/**
 * @param actions {...('INIT_ENVIRONMENT'|'INIT_FILESYSTEM'|'INIT_STEAMCMD'|'INSTALL_SERVER'|'UPDATE_SERVER'|'CREATE_CONFIG'|'CREATE_BACKUP'|'START_SERVER'|'START_MAINTENANCE')[]}
 * @returns {Promise<void>}
 */
async function runActions(...actions) {
  for(let action of actions){
    await runAction(action);
  }
}

/**
 * @returns {Promise<void>}
 */
async function run(){

  // run base actions
  await runActions('INIT_ENVIRONMENT', 'INIT_FILESYSTEM');

  // run actions based on the start mode
  switch(getStartMode()){

    // install and start server
    case 0: {
      await runActions('INIT_STEAMCMD', 'INSTALL_SERVER', 'CREATE_CONFIG', 'START_SERVER');
      break;
    }

    // install server and stop
    case 1: {
      await runActions('INIT_STEAMCMD', 'INSTALL_SERVER');
      break;
    }

    // install server, create config and stop
    case 2: {
      await runActions('INIT_STEAMCMD', 'INSTALL_SERVER', 'CREATE_CONFIG');
      break;
    }

    // update and start server
    case 3: {
      await runActions('INIT_STEAMCMD', 'UPDATE_SERVER', 'CREATE_CONFIG', 'START_SERVER');
      break;
    }

    // update server and stop
    case 4: {
      await runActions('INIT_STEAMCMD', 'UPDATE_SERVER');
      break;
    }

    // update server, create config and stop
    case 4: {
      await runActions('INIT_STEAMCMD', 'UPDATE_SERVER', 'CREATE_CONFIG');
      break;
    }

    // backup and start server
    case 5: {
      await runActions('CREATE_BACKUP', 'INIT_STEAMCMD', 'CREATE_CONFIG', 'START_SERVER');
      break;
    }

    // backup server and stop
    case 6: {
      await runActions('CREATE_BACKUP');
      break;
    }

    // maintenance mode
    case 99: {
      await runActions('START_MAINTENANCE');
      break;
    }

    // mode not supported
    default: errorLog(`PW_START_MODE "${getStartMode()}" not supported.`)

  }

  // exit application
  process.exit(0);

}

run();