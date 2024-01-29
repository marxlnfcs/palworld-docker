import {map, Observable} from "rxjs";
import {getWorkingDirectory, joinPaths} from "../utils/path.js";
import {getPlatform} from "../utils/platform.js";
import {createObservableStream, toPromise} from "../utils/rxjs.js";
import {createDir, deleteFile, downloadFile, exists, extractArchive} from "../utils/fs.js";
import {arrayItemNotStartsWith, bytesToSize, EOL, printf} from "../utils/others.js";
import {Shell} from "../shell/shell.js";
import {createSteamCmdError, isSteamCmdError} from "./steamcmd-error.js";
import {
  getAppBetaName,
  getAppBetaPassword,
  getAppId,
  getAppLanguage,
  getAppPlatform,
  getAppPlatformBitness
} from "../env.js";
import {debugLog} from "../utils/logger.js";

export class SteamCMDClient {

  /**
   * The directory into which the SteamCMD binaries will be installed
   * @type {string}
   */
  #binaryDir

  /**
   * The executable which will be started when the SteamCMD gets called
   */
  #executable

  /**
   * The directory into which the App will be installed
   * @type {string}
   */
  #installDir

  /**
   * The username which should be used for the SteamCMD login
   * @type {string}
   * @default anonymous
   */
  #username

  /**
   * The platform on which the app should be downloaded
   * @type {'windows'|'linux'|'macos'}
   */
  #platform

  /**
   * The platform bitness of the app
   * @type {number|null}
   */
  #platformBitness;

  /**
   * The language in which the app should be installed
   * @type {string|null}
   */
  #language;

  /**
   * The name of the beta
   * @type {string|null}
   */
  #betaName;

  /**
   * The password of the beta
   * @type {string|null}
   */
  #betaPassword;

  /**
   * The app id that should be installed by default
   * @type {number}
   */
  #appId;

  /**
   * @param options {null|Partial<{
   *    binaryDir: string,
   *    installDir: string,
   *    username: string,
   *    appId: string,
   *    platform: 'windows'|'linux'|'macos',
   *    platformBitness: number,
   *    betaName: string,
   *    betaPassword: string,
   *    language: string,
   * }>}
   */
  constructor(options){
    this.#binaryDir = options?.binaryDir || getWorkingDirectory('temp/steamcmd');
    this.#installDir = options?.installDir || getWorkingDirectory('temp/app');
    this.#username = options?.username || 'anonymous';
    this.#platform = options?.platform || getAppPlatform();
    this.#platformBitness = options?.platformBitness || getAppPlatformBitness();
    this.#betaName = options?.betaName || getAppBetaName();
    this.#betaPassword = options?.betaName || getAppBetaPassword();
    this.#language = options?.language || getAppLanguage();
    this.#appId = getAppId();

    if(!this.#platform){
      throw new Error(`Platform "${process.platform}" is not supported.`);
    }
  }

  /**
   * @param path {string|null}
   * @return {string}
   */
  getBinaryDir(path = null) {
    return joinPaths(this.#binaryDir, path);
  }

  /**
   * @return {string}
   */
  #getExecutable() {
    switch(getPlatform()) {
      case 'linux': return this.getBinaryDir('steamcmd.sh');
      case 'macos': return this.getBinaryDir('steamcmd.sh');
      case 'windows': return this.getBinaryDir('steamcmd.exe');
    }
  }

  /**
   * @return {string}
   */
  #getDownloadUrl() {
    switch(getPlatform()){
      case 'linux': return 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz';
      case 'macos': return 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz';
      case 'windows': return 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
    }
  }

  /**
   * @return {string}
   */
  #getDownloadFile() {
    switch(getPlatform()){
      case 'linux': return this.getBinaryDir('steamcmd.tar.gz');
      case 'macos': return this.getBinaryDir('steamcmd.tar.gz');
      case 'windows': return this.getBinaryDir('steamcmd.zip');
    }
  }


  /**
   * @param path {string|null}
   * @return {string}
   */
  getInstallDir(path = null) {
    return joinPaths(this.#installDir, path);
  }

  /**
   * Installs the SteamCMD if required
   * @return {Observable<{
   *    state: 'Checking'|'Downloading'|'DownloadProgress'|'Extracting'|'Updating'|'UpdateProgress',
   *    data: any
   * }>}
   */
  initSteamCMD() {
    return createObservableStream(async (next, error, done) => {
      try{

        // create directories
        next({ message: 'Checking SteamCMD...', indent: 0 });
        createDir(this.getBinaryDir());

        // install SteamCmd if not exist
        if(!exists(this.#getExecutable())){

          // download SteamCmd
          next({ message: 'Downloading SteamCmd...', indent: 1 });
          await toPromise(downloadFile(this.#getDownloadUrl(), this.#getDownloadFile())
            .pipe(map(event => {
              if(event.progress && event.total){
                next({
                  message: printf('%s% - Downloading SteamCmd (%s of %s)...', [
                    Math.round(event.progress * 100),
                    bytesToSize(event.loaded),
                    bytesToSize(event.total)
                  ]),
                  indent: 2
                });
              }else{
                next({
                  message: printf('Downloading SteamCmd (%s)...', [bytesToSize(event.loaded)]),
                  indent: 2
                });
              }
            })));

          // extract SteamCmd
          next({ message: 'Extracting SteamCmd...', indent: 1 });
          await extractArchive(this.#getDownloadFile(), this.getBinaryDir());
          next({ message: 'Installation of SteamCmd has been completed.', indent: 1 });

          // delete temporary file
          deleteFile(this.#getDownloadFile());

        }

        // execute the SteamCmd for the first time
        next({ message: 'Updating SteamCmd...', indent: 0, type: 'stdout' });
        const process = this.run(['help']);

        // wait for completion
        const exitCode = await toPromise(process.exit);
        if(isSteamCmdError(exitCode)) throw createSteamCmdError(exitCode);

        // done
        done();

      }catch(e){
        error(e);
      }
    });
  }

  /**
   * Returns information about the app
   * @param appId {string|null}
   * @return {Promise<{
   *   id: number,
   *   installed: boolean
   * }>}
   */
  getAppInfo(appId = null) {
    return new Promise(async (resolve, reject) => {
      try{

        // get app information
        const result = await this.runSync(['app_info_update 1', `app_info_print ${appId || this.#appId}`, `app_status ${appId || this.#appId}`]);

        // return app information
        resolve({
          id: appId || this.#appId,
          installed: /install state:\s+(.*)/.exec(result)?.[1]?.trim()?.toLowerCase()?.indexOf('fully installed') != -1
        });

      }catch(e){
        reject(e);
      }
    });
  }

  /**
   * Installs/Updates application
   * @param appId {string|null}
   * @param options {null|Partial<{
   *   validate: boolean,
   *   language: string,
   *   betaName: string,
   *   betaPassword: string,
   *   platform: string,
   *   platformBitness: number,
   * }>}
   * @return {Observable<{
   *    state: 'Checking'|'Downloading'|'DownloadProgress'|'Extracting'|'Updating'|'UpdateProgress',
   *    data: any
   * }>}
   */
  updateApp(appId = null, options = null){
    return createObservableStream(async (next, error, done) => {
      try{

        // create args array
        const args = [`app_update "${appId || this.#appId}"`];

        // add app_update options
        options?.validate && args.push('-validate');
        (options?.language || this.#language) && args.push(`-language "${options.language || this.#language}"`);
        (options?.betaName || this.#betaName) && args.push(`-beta "${options.betaName || this.#betaName}"`);
        (options?.betaPassword || this.#betaPassword) && args.push(`-betapassword "${options.betaPassword || this.#betaPassword}"`);

        // force platform bitness
        const platformBitness = options?.platformBitness || this.#platformBitness;
        platformBitness && args.unshift(`@sSteamCmdForcePlatformBitness ${platformBitness}`);

        // force platform
        const platform = options?.platform || this.#platform;
        platform && args.unshift(`@sSteamCmdForcePlatformType "${platform}"`);

        // start app_update
        const process = this.run(args);

        // listen to all events
        process.data.subscribe(data => {

          // define regex expressions
          const regex = {
            downloading: [/Update state \((.*)\) downloading, progress: (.*) \((.*) \/ (.*)\)/, (matches) => `Downloading application (${Math.round(parseInt(matches[2].split('.')))}% / ${bytesToSize(matches[3])} of ${bytesToSize(matches[4])} )...`],
            verifying: [/Update state \((.*)\) verifying update, progress: (.*) \((.*) \/ (.*)\)/, (matches) => `Verifying application (${Math.round(parseInt(matches[2].split('.')))}% / ${bytesToSize(matches[3])} of ${bytesToSize(matches[4])} )...`],
            completed: [/App '(.*)' fully installed/, () => 'Installation completed.'],
          };

          // log into console
          Object.entries(regex).map(([state, [reg, message]]) => {
            if(reg instanceof RegExp && reg.test(data)) {
              next({ message: (typeof message === 'function' ? message(reg.exec(data)) : data.replace(reg, message)).trim(), indent: 1 });
            }else if(typeof reg === 'string' && data.indexOf(reg) !== -1){
              next({ message: typeof message === 'function' ? message() : message, indent: 1 });
            }
          });

        });

        // wait for completion
        const exitCode = await toPromise(process.exit);
        if(isSteamCmdError(exitCode)) throw createSteamCmdError(exitCode);

        // done
        done();

      }catch(e){
        error(e);
      }
    });
  }

  /**
   * Invokes the SteamCMD instance
   * @param args {(string|null)[]}
   * @param autoLogin {boolean} Adds the login details on every execution
   * @return ShellProcess
   */
  run(args = [], autoLogin = true) {

    // format arguments
    args = (Array.isArray(args) ? args : [])
      .filter(a => !!a)
      .map(a => a.trim().startsWith('+') ? a.replace('+', '') : a);

    // create base (before) arguments
    const argsBefore = [
      arrayItemNotStartsWith(args, '@ShutdownOnFailedCommand ') ? '@ShutdownOnFailedCommand  1' : null,
      arrayItemNotStartsWith(args, '@NoPromptForPassword') ? '@NoPromptForPassword 1' : null,
      arrayItemNotStartsWith(args, 'api_logging') ? 'api_logging 1 1' : null,
      arrayItemNotStartsWith(args, 'force_install_dir') ? `force_install_dir "${this.getInstallDir()}"` : null,
      arrayItemNotStartsWith(args, 'login') && autoLogin ? `login "${this.#username}"` : null,
    ];

    // create base (after) arguments
    const argsAfter = [
      arrayItemNotStartsWith(args, 'quit') ? 'quit' : null,
    ];

    // create process
    const proc = Shell.run(this.#getExecutable(), [].concat(argsBefore, args, argsAfter).map(a => `+${a}`));

    // output data on debug
    proc.data.subscribe((data) => debugLog(data));

    // run command
    return proc;

  }

  /**
   * Invokes the SteamCMD instance and returns the response in an array
   * @param args {(string|null)[]}
   * @param autoLogin {boolean} Adds the login details on every execution
   * @return Promise<{ type: 'stdout'|'stderr', data: string }[]>
   */
  runSync(args = [], autoLogin = true) {
    return new Promise(async (resolve, reject) => {
      try{

        // create array for response
        const response = [];

        // run command
        const proc = this.run(args, autoLogin);

        // listen to all stdout and stderr
        proc.data.subscribe(data => {
          response.push(data);
        });

        // wait for completion
        await toPromise(proc.exit);

        // resolve response
        resolve(response.join(EOL));

      }catch(e){
        reject(e);
      }
    });
  }

}