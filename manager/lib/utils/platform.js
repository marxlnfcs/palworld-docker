/**
 * @return {'linux'|'windows'|'macos'|null}
 */
export function getPlatform() {
  switch(process.platform) {
    case 'win32': return 'windows';
    case 'linux': return 'linux';
    case 'darwin': return 'macos';
    default: return null;
  }
}

/**
 * @return boolean
 */
export function isPlatformLinux() {
  return getPlatform() === 'linux';
}

/**
 * @return boolean
 */
export function isPlatformWindows() {
  return getPlatform() === 'windows';
}

/**
 * @return boolean
 */
export function isPlatformMac() {
  return getPlatform() === 'macos';
}

/**
 * @return boolean
 */
export function isPlatformUnix() {
  return isPlatformLinux() || isPlatformMac();
}