import {infoLog} from "../helpers/logger.js";
import {configDotenv} from "dotenv";

export async function initEnvironment(){
  infoLog('Initializing Environment ...');

  // Load .env file
  configDotenv()

}