import packageInfo from '../../package.json';

export function formatAppVersion(version: string) {
  const [major, minor = '0', patch = '0'] = version.split('.');

  return `${major}.${minor.padStart(2, '0')}${patch === '0' ? '' : patch}`;
}

export const APP_VERSION = formatAppVersion(packageInfo.version);
