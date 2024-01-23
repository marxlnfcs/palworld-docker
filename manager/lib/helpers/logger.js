function getDate() {
  return (new Date()).toISOString();
}

/**
 * Creates messages for the logging
 * @param level {string}
 * @param context {string|null}
 * @param messages {string|string[]}
 * @param indent {number}
 *
 * @return string[]
 */
function createMessages(level, context, messages, indent) {
  const msg = [];
  if(Array.isArray(messages)){
    messages.map(m => m.split('\n').map(m => msg.push(m)));
  }else{
    messages.split('\n').map(m => msg.push(m))
  }
  const createMessage = (m) => indent ? ['>'.repeat(indent), m].join(' ') : m;
  return context
    ? msg.map(m => `[${getDate()}] [${level}] [${context}] ${ createMessage(m) }`)
    : msg.map(m => `[${getDate()}] [${level}] ${ createMessage(m) }`);
}

/**
 * Default logging
 * @param message {string}
 * @param indent {number}
 */
export function infoLog(message, indent = 0) {
  createMessages('LOG', null, message, indent).map(m => console.log(m));
}

/**
 * Default SteamCMD logging
 * @param message {string}
 * @param indent {number}
 */
export function scInfoLog(message, indent = 0) {
  createMessages('LOG', 'STEAMCMD', message, indent).map(m => console.log(m));
}

/**
 * Default Server logging
 * @param message {string}
 * @param indent {number}
 */
export function serverInfoLog(message, indent = 0) {
  createMessages('LOG', 'SERVER', message, indent).map(m => console.log(m));
}

/**
 * Log warn message
 * @param message {string}
 * @param indent {number}
 */
export function warnLog(message, indent = 0) {
  createMessages('WARN', null, message, indent).map(m => console.warn(m));
}

/**
 * Log SteamCMD warn message
 * @param message {string}
 * @param indent {number}
 */
export function scWarnLog(message, indent = 0) {
  createMessages('WARN', 'STEAMCMD', message, indent).map(m => console.warn(m));
}

/**
 * Log error message
 * @param message {string}
 * @param indent {number}
 * @param exitCode {number|null}
 */
export function errorLog(message, indent = 0, exitCode = null) {
  createMessages('ERROR', null, message, indent).map(m => console.error(m));
  if(typeof exitCode !== 'undefined' && exitCode !== null){
    process.exit(exitCode);
  }
}

/**
 * Log error message
 * @param message {string}
 * @param indent {number}
 * @param exitCode {number|null}
 */
export function scErrorLog(message, indent = 0, exitCode = null) {
  createMessages('ERROR', 'STEAMCMD', message, indent).map(m => console.error(m));
  if(typeof exitCode !== 'undefined' && exitCode !== null){
    process.exit(exitCode);
  }
}

/**
 * Log error message
 * @param message {string}
 * @param indent {number}
 * @param exitCode {number|null}
 */
export function serverErrorLog(message, indent = 0, exitCode = null) {
  createMessages('ERROR', 'SERVER', message, indent).map(m => console.error(m));
  if(typeof exitCode !== 'undefined' && exitCode !== null){
    process.exit(exitCode);
  }
}