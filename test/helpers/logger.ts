import { ConsoleLogger } from '../../src/logger/ConsoleLogger';
import { Logger } from '../../src/logger/Logger';
import { NullLogger } from '../../src/logger/NullLogger';

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
