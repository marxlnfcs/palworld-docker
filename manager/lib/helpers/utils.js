import http from 'http';

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