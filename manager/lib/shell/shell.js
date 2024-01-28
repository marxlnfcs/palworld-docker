import {ShellProcess} from "./shell-process.js";

export class Shell {

  /**
   * @param executable {string}
   * @param args {string[]|null}
   * @param options {SpawnOptions|null}
   */
  static run(executable, args = [], options = null) {
    return new ShellProcess(executable, args, options || null);
  }

}