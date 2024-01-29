import {EMPTY, map, mergeAll, Observable, of, Subject} from "rxjs";
import {spawn} from 'child_process';
import readline from 'readline';
import pty from '@cdktf/node-pty-prebuilt-multiarch';
import {getWorkDir} from "../env.js";
import stripAnsi from "strip-ansi";
import {debugLog} from "../utils/logger.js";

export class ShellProcess {

  /**
   * @type {Subject<string>}
   * @private
   */
  #data = null;

  /**
   * @type {Subject<number>}
   * @private
   */
  #exit = null;

  /**
   * Stores the current spawn instance
   * @type {IPty}
   * @private
   */
  #proc = null;

  /**
   * Stores the executable
   * @type {string|null}
   * @private
   */
  #executable = null;

  /**
   * Stores the arguments
   * @type {string[]|null}
   * @private
   */
  #args = null;

  /**
   * Stores the cwd
   * @type {IPtyForkOptions|IWindowsPtyForkOptions|null}
   * @private
   */
  #options = null;

  /**
   * @param executable {string}
   * @param args {string[]|null}
   * @param options {IPtyForkOptions|IWindowsPtyForkOptions|null}
   */
  constructor(executable, args = [], options = null){
    this.#executable = executable || null;
    this.#args = Array.isArray(args) ? args : [];
    this.#options = options || {};
    this.#run();
  }

  /**
   * @private
   */
  #run(){

    // destroy current process and its components
    this.#destroy();

    // create subjects
    this.#data = new Subject();
    this.#exit = new Subject();

    // create pty terminal
    this.#proc = pty.spawn(this.#executable, this.#args, {
      ...this.#options,
      name: this.#options?.name ?? 'xterm-color',
      cols: this.#options?.cols ?? 80,
      rows: this.#options?.rows ?? 30,
    });

    // on data
    this.#proc.onData(data => data
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '')
      .split('\n')
      .map(_ => stripAnsi(_))
      .map(_ => _.trim())
      .filter(_ => !!_)
      .map(_ => this.#data.next(_))
    );

    // on exit
    this.#proc.onExit(event => {
      this.#exit.next(event.exitCode);
      this.#destroy();
    });

  }

  /**
   * @private
   */
  #destroy(){
    if(this.#proc){
      this.#proc.kill();
      this.#proc = null;
    }
    if(this.#data){
      this.#data.complete();
      this.#data = null;
    }
    if(this.#exit){
      this.#exit.complete();
      this.#exit = null;
    }
  }

  /**
   * @return {Observable<string>}
   */
  get data() {
    return this.#data.asObservable() || EMPTY;
  }

  /**
   * @return {Observable<number>}
   */
  get exit() {
    return this.#exit.asObservable();
  }

}

export class ShellProcess2 {

  /**
   * @type {Subject<string>}
   * @private
   */
  #stdout = null;

  /**
   * @type {Subject<string>}
   * @private
   */
  #stderr = null;

  /**
   * @type {Subject<number>}
   * @private
   */
  #completed = null;

  /**
   * Stores the current spawn instance
   * @type {ChildProcessWithoutNullStreams}
   * @private
   */
  #proc = null;

  /**
   * Stores the executable
   * @type {string|null}
   * @private
   */
  #executable = null;

  /**
   * Stores the arguments
   * @type {string[]|null}
   * @private
   */
  #args = null;

  /**
   * Stores the cwd
   * @type {SpawnOptions|null}
   * @private
   */
  #options = null;

  /**
   * @param executable {string}
   * @param args {string[]|null}
   * @param options {SpawnOptions|null}
   */
  constructor(executable, args = [], options = null){
    this.#executable = executable || null;
    this.#args = Array.isArray(args) ? args : [];
    this.#options = {
      ...(options || {}),
      shell: false,
      detached: false,
      stdio: 'pipe',
    };
    this.#run();
  }

  /**
   * @private
   */
  #run(){

    // destroy current process and its components
    this.#destroy();

    // create subjects
    this.#stdout = new Subject();
    this.#stderr = new Subject();
    this.#completed = new Subject();

    // create ChildProcess
    this.#proc = spawn(this.#executable, this.#args, this.#options || {});

    this.#proc.on('data', console.log)

    // create interfaces
    const stdout = readline.createInterface({ input: this.#proc.stdout });
    const stderr = readline.createInterface({ input: this.#proc.stderr });

    // listen to stdout
    stdout.on('line', line => {
      this.#stdout.next(line);
    });

    // listen to stderr
    stderr.on('line', line => {
      this.#stderr.next(line);
    });

    // listen to complete event
    this.#proc.on('close', code => {
      this.#completed.next(code || 0);
      stdout.close();
      stderr.close();
      this.#destroy();
    });

  }

  /**
   * @private
   */
  #destroy(){
    if(this.#proc){
      this.#proc.kill();
      this.#proc = null;
    }
    if(this.#stdout){
      this.#stdout.complete();
      this.#stdout = null;
    }
    if(this.#stderr){
      this.#stderr.complete();
      this.#stderr = null;
    }
    if(this.#completed){
      this.#completed.complete();
      this.#completed = null;
    }
  }

  /**
   * @return {Observable<{ type: 'stdout'|'stderr'|'completed', data: any }>}
   */
  get stdall() {
    return of(
      (this.#stdout || EMPTY).pipe(map(r => ({ type: 'stdout', data: r }))),
      (this.#stderr || EMPTY).pipe(map(r => ({ type: 'stderr', data: r }))),
      (this.#completed || EMPTY).pipe(map(r => ({ type: 'completed', data: r }))),
    ).pipe(mergeAll());
  }

  /**
   * @return {Observable<string>}
   */
  get stdout() {
    return this.#stdout.asObservable() || EMPTY;
  }

  /**
   * @return {Observable<string>}
   */
  get stderr() {
    return this.#stderr.asObservable() || EMPTY;
  }

  /**
   * @return {Observable<number>}
   */
  get completed() {
    return this.#completed.asObservable();
  }

}