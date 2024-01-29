import {getAppConfigDir, getAppDir, getAppId, getConfigDir} from "../env.js";
import {dirname, resolve} from 'path';
import {accessSync, constants as fsConstants, existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import ini from 'ini';
import os from "os";
import {getEnv} from "../utils/env.js";
import {infoLog, infoObjectLog} from "../utils/logger.js";
import {getExternalIP, isIPAddress} from "../utils/others.js";
import {loadIniFromFile} from "../utils/fs.js";

export function createConfig() {
  return new Promise(async (resolve, reject) => {
    try{

      // log start of action
      infoLog(`Creating temporary server configurations (AppId: ${getAppId()})...`);

      // set config paths
      const FILE_CONFIG_TEMPLATE = getAppDir('DefaultPalWorldSettings.ini');
      const FILE_CONFIG_LOCAL = getConfigDir('PalWorldSettings.ini');
      const FILE_CONFIG = getAppConfigDir('PalWorldSettings.ini');

      // create config directory if not exists
      if(!existsSync(getAppConfigDir())){
        mkdirSync(getAppConfigDir(), {
          recursive: true,
          mode: 0o775
        });
      }

      // create config object
      const config = parseServerConfig(FILE_CONFIG_TEMPLATE);

      // parse local config
      const localConfig = loadIniFromFile(FILE_CONFIG_LOCAL);

      // parse environment variables
      const envConfig = {
        'ServerName': getEnv('PW_SERVER_NAME'),
        'ServerDescription': getEnv('PW_SERVER_DESCRIPTION'),
        'ServerPassword': getEnv('PW_SERVER_PASSWORD'),
        'ServerPlayerMaxNum': getEnv('PW_MAX_PLAYERS'),

        'AdminPassword': getEnv('PW_ADMIN_PASSWORD'),

        'PublicIP': getEnv('PW_PUBLIC_IP'),
        'PublicPort': getEnv('PW_PUBLIC_PORT'),

        'RCONEnabled': getEnv('PW_RCON_ENABLED'),
        'RCONPort': getEnv('PW_RCON_PORT'),
      };

      // delete NIL values in the config
      Object.keys(envConfig).map(k => envConfig[k] === null && delete envConfig[k]);

      // apply config entries from local config file
      if(Object.keys(localConfig).length){
        infoLog(`Using values from "${FILE_CONFIG_LOCAL}":`, 1);
        Object.entries(localConfig).map(e => config[e[0]] = `${e[1] ?? ""}`)
        infoObjectLog(localConfig, 3);
      }

      // apply config entries from environment variables
      if(Object.keys(envConfig).length){
        infoLog('Using values from environment variables:', 1);
        Object.entries(envConfig).map(e => config[e[0]] = `${e[1] ?? ""}`)
        infoObjectLog(envConfig, 3);
      }

      // auto discover PublicIP and PublicPort if not set
      if(!config.PublicIP) config.PublicIP = await getExternalIP();
      if(!config.PublicPort) config.PublicPort = 8211;

      // save config
      stringifyConfig(FILE_CONFIG, config);

      // done
      resolve();

    }catch(e){
      reject(e);
    }
  });
}


export function getServerConfig() {
  return parseServerConfig(getAppConfigDir('PalWorldSettings.ini'));
}

/**
 * @param file {string}
 * @return object
 */
function parseServerConfig(file) {
  try{

    // parse file
    let configContent = loadIniFromFile(file)['/Script/Pal']['PalGameWorldSettings']['OptionSettings'];

    // check if config starts with "(" and ends with ")"
    if(!configContent.startsWith('(') || !configContent.endsWith(')')){
      return {};
    }

    // return config
    return parseConfigString(configContent.trim().slice(1).slice(0, -1));

  }catch{
    return {};
  }
}

/**
 * @param content {string}
 * @return {object}
 */
function parseConfigString(content) {
  const attributes = content.split(/,(?=\w+=)/);

  let result = "";
  for (let i = 0; i < attributes.length; i++) {
    const [key, value] = attributes[i].split('=');
    result = [result, `${key}=${value}`].join(os.EOL);
  }

  return ini.parse(result);
}

/**
 * @param file {string}
 * @param config {object}
 * @return void
 */
function stringifyConfig(file, config) {
  if(!existsSync(dirname(file))){
    mkdirSync(dirname(file), {
      recursive: true,
      mode: 0o775
    });
  }
  writeFileSync(file, [
    '[/Script/Pal.PalGameWorldSettings]',
    `OptionSettings=(${createOptionString(config)})`,
  ].join(os.EOL), { mode: 0o775 });
}

/**
 * @param config {object}
 * @return {string}
 */
function createOptionString(config) {
  const options = []
  Object.entries(config).map(([key, value]) => {
    const valLower = `${value}`.trim().toLowerCase();
    if(valLower === 'true' || valLower === 'false') {
      options.push(`${key}=${valLower === 'true' ? 'True' : 'False'}`);
    }else if(isIPAddress(value)){
      options.push(`${key}="${value}"`);
    }else if(!isNaN(parseFloat(value)) || !isNaN(parseInt(value))){
      options.push(`${key}=${value}`);
    }else {
      options.push(`${key}="${value}"`);
    }
  });
  return options.join(',');
}