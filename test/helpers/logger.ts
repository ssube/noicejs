import { ConsoleLogger } from '../../src/logger/ConsoleLogger.js';
import { Logger } from '../../src/logger/Logger.js';
import { NullLogger } from '../../src/logger/NullLogger.js';

const ENV_DEBUG = 'DEBUG';

export function isDebug(): boolean {
  return process.env[ENV_DEBUG] === 'TRUE';
}

export function getTestLogger(): Logger {
  if (isDebug()) {
    return new ConsoleLogger();
  } else {
    return new NullLogger();
  }
}
