import {infoLog} from "../utils/logger.js";

export function startMaintenance() {
  return new Promise(async (resolve, reject) => {
    try{

      // maintenance mode
      infoLog('Entered Maintenance Mode.');
      while(true){
        await new Promise((r) => {
          setTimeout(() => r(), 5000);
        });
      }

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}