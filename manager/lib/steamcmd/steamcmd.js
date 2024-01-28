import {SteamCMDClient} from "./steamcmd-client.js";

let steamcmd = null;

/**
 * @param options {null|Partial<{ binaryDir: string, installDir: string, username: string, platform: 'windows'|'linux'|'macos' }>}
 * @return SteamCMDClient
 */
export function createSteamCmd(options = null) {
  steamcmd = new SteamCMDClient(options);
  return steamcmd;
}

/**
 * @return SteamCMDClient
 */
export function getSteamCmd() {
  if(!steamcmd) steamcmd = createSteamCmd();
  return steamcmd;
}