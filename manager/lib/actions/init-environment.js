import {configDotenv} from "dotenv";
import {infoLog} from "../utils/logger.js";

export async function initEnvironment() {
  return new Promise(async (resolve, reject) => {
    try{

      // load environment file
      infoLog('Initializing Environment...');
      configDotenv();

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}