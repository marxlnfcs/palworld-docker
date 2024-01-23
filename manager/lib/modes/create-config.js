import {infoLog} from "../helpers/logger.js";
import {getAppConfigDir, getAppDir, getAppId, getConfigDir, getEnv} from "../helpers/env.js";
import {dirname, resolve} from 'path';
import {accessSync, constants as fsConstants, existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs';
import ini from 'ini';
import os from "os";

export async function createConfig() {
  infoLog(`Creating temporary server configurations (AppId: ${getAppId()}) ...`);

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
  const localConfig = parseIni(FILE_CONFIG_LOCAL);

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
  Object.keys(envConfig).map(k => envConfig[k] === null && delete envConfig[k]);

  // apply config entries from local config file
  infoLog(`Using values from "${FILE_CONFIG_LOCAL}":`, 1);
  if(Object.keys(localConfig).length){
    Object.entries(localConfig).map(([key, value]) => {
      config[key] = `${value ?? ""}`;
      infoLog(`- ${key}: "${value ?? ""}"`, 2);
    });
  }else{
    infoLog(`- None`, 2);
  }

  // apply config entries from environment variables
  infoLog('Using values from environment variables:', 1);
  if(Object.keys(envConfig).length){
    Object.entries(envConfig).map(([key, value]) => {
      config[key] = `${value ?? ""}`;
      infoLog(`- ${key}: "${value ?? ""}"`, 2);
    });
  }else{
    infoLog(`- None`, 2);
  }

  // save config
  stringifyConfig(FILE_CONFIG, config);

}

/**
 * @param file {string}
 * @param emptyOnNotFound {boolean}
 * @return object
 */
function parseIni(file, emptyOnNotFound = true) {

  // check if file exists
  if(!existsSync(file)){
    if(emptyOnNotFound) return {};
    throw Error(`INI File "${ resolve(file) }" not found.`);
  }

  // check if file is readable
  try{ accessSync(file, fsConstants.R_OK) } catch {
    throw Error(`Unable to access INI File "${ resolve(file) }".`);
  }

  // parse ini file
  let content = null;
  try{ content = ini.parse(readFileSync(file, 'utf-8')) } catch {
    throw Error(`Unable to parse INI File "${ resolve(file) }".`);
  }

  // return content
  return content || {};

}

/**
 * @param file {string}
 * @return object
 */
function parseServerConfig(file) {
  try{

    // parse file
    let configContent = parseIni(file)['/Script/Pal']['PalGameWorldSettings']['OptionSettings'];

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
    'OptionSettings=' + [
      '(',
      Object.entries(config).map(c => `${c[0]}="${c[1]}"`).join(','),
      ')'
    ].join('')
  ].join(os.EOL), { mode: 0o775 });
}