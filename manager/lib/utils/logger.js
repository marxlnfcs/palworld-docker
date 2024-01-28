import {getDebug} from "../env.js";
import {valueToPrintable} from "./others.js";

function getDate() {
  return (new Date()).toISOString();
}

/**
 * Creates messages for the logging
 * @param level {string}
 * @param messages {string|string[]}
 * @param indent {number}
 *
 * @return {string[]}
 */
function createMessages(level, messages, indent) {
  const msg = [];
  if(Array.isArray(messages)){
    messages?.map(m => m?.split('\n')?.map(m => msg.push(m)));
  }else{
    messages?.split('\n')?.map(m => msg.push(m))
  }
  const createMessage = (m) => !indent ? m : indent === 1 ? `> ${m}` : [' '.repeat(indent-1), `> ${m}`].join(' ');
  return msg.map(m => `[${getDate()}] [${level}] ${ createMessage(m) }`);
}

/**
 * Creates a message with key value
 * @param level {string}
 * @param object {object}
 * @param indent {number}
 *
 * @return {string[]}
 */
function createObjectMessages(level, object, indent = 0) {
  const messages = [];
  const maxKeyLength = Object.keys(object).reduce((previous, current) => current.length > previous ? current.length : previous, 0) + 3;
  // format: <key>: ... <value>
  Object.entries(object).map(([key, value]) => messages.push([`${key}:`, '.'.repeat((maxKeyLength - key.length)), valueToPrintable(value)].join(' ')));
  const finalMessages = [];
  messages.map(m => createMessages(level, m, indent).map(m => finalMessages.push(m)));
  return finalMessages;
}

/**
 * Default logging
 * @param message {string}
 * @param indent {number}
 */
export function infoLog(message, indent = 0) {
  createMessages('LOG', message, indent).map(m => console.log(m));
}

/**
 * Default logging
 * @param object {object}
 * @param indent {number}
 */
export function infoObjectLog(object, indent = 0) {
  createObjectMessages('LOG', object, indent).map(m => console.log(m));
}

/**
 * Debug logging
 * @param message {string}
 * @param indent {number}
 */
export function debugLog(message, indent = 0) {
  if(getDebug()){
    createMessages('DBG', message, indent).map(m => console.log(m))
  }
}

/**
 * Debug logging
 * @param object {object}
 * @param indent {number}
 */
export function debugObjectLog(object, indent = 0) {
  if(getDebug()){
    createObjectMessages('DBG', object, indent).map(m => console.log(m));
  }
}

/**
 * Log warn message
 * @param message {string}
 * @param indent {number}
 */
export function warnLog(message, indent = 0) {
  createMessages('WRN', message, indent).map(m => console.warn(m));
}

/**
 * Log warn message
 * @param object {object}
 * @param indent {number}
 */
export function warnObjectLog(object, indent = 0) {
  createObjectMessages('WRN', object, indent).map(m => console.warn(m));
}

/**
 * Log error message
 * @param message {string}
 * @param indent {number}
 * @param exitCode {number|null}
 */
export function errorLog(message, indent = 0, exitCode = null) {
  createMessages('ERR', message, indent).map(m => console.error(m));
  if(typeof exitCode !== 'undefined' && exitCode !== null){
    process.exit(exitCode);
  }
}

/**
 * Log error message
 * @param object {object}
 * @param indent {number}
 * @param exitCode {number|null}
 */
export function errorObjectLog(object, indent = 0, exitCode = null) {
  createObjectMessages('ERR', object, indent).map(m => console.error(m));
  if(typeof exitCode !== 'undefined' && exitCode !== null){
    process.exit(exitCode);
  }
}