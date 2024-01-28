import http from 'http';
import util from 'util';
import os from "os";

export const EOL = os.EOL;

export function bytesToSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

export function getExternalIP() {
  return new Promise((resolve, reject) => {
    try{

      // set the URL of the request to the ipify API
      const options = {
        host: 'api.ipify.org',
        port: 80,
        path: '/?format=json'
      };

      // create a new http.ClientRequest object
      const req = http.request(options, (res) => {
        res.setEncoding('utf8');
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const data = JSON.parse(body);
          resolve(data.ip);
        });
      });
      req.end();

    }catch(e){
      reject(e);
    }
  });
}

/**
 * Return true if the provided value is a valid IP address
 * @param value {string}
 * @returns {boolean}
 */
export function isIPAddress(value) {
  return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
}

/**
 * @param arr
 * @param startsWith
 * @return boolean
 */
export function arrayItemStartsWith(arr, startsWith) {
  if(Array.isArray(arr) && !!startsWith && typeof startsWith === 'string'){
    return !!arr.filter(i => !!i && typeof i === 'string').filter(i => i.trim().toLowerCase().startsWith(startsWith.trim().toLowerCase())).length;
  }
  return false;
}

/**
 * @param arr
 * @param startsWith
 * @return boolean
 */
export function arrayItemNotStartsWith(arr, startsWith) {
  return !arrayItemStartsWith(arr, startsWith);
}

/**
 * @param template {string}
 * @param values {(string|number)[]}
 */
export function printf(template, values = []) {
  return util.format(template, ...values);
}

/**
 * Format variable to printable output
 * @param value {any}
 */
export function valueToPrintable(value) {
  switch(true) {
    case typeof value === 'undefined' || value === null: return 'NULL';
    case Array.isArray(value): return JSON.stringify(value);
    case typeof value === 'object': return JSON.stringify(value);
    case typeof value === 'boolean': return value ? 'TRUE' : 'FALSE';
    case typeof value === 'string': return `${value}`;
    case typeof value === 'number': return `${value}`;
  }
}