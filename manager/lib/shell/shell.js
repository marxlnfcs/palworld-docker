import {ShellProcess} from "./shell-process.js";
import {execSync} from 'child_process';

export class Shell {

  /**
   * @param executable {string}
   * @param args {string[]|null}
   * @param options {IPtyForkOptions|IWindowsPtyForkOptions|null}
   */
  static run(executable, args = [], options = null) {
    return new ShellProcess(executable, args, options || null);
  }

  /**
   * @param command
   * @returns {string}
   */
  static execSync(command){
    return execSync(command).toString();
  }

}