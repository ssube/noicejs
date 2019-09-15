import { ConsoleLogger } from '../../src/logger/ConsoleLogger';
import { Logger } from '../../src/logger/Logger';
import { NullLogger } from '../../src/logger/NullLogger';

const ENV_DEBUG = 'DEBUG';

export function getTestLogger(): Logger {
  if (process.env[ENV_DEBUG] === 'TRUE') {
    return new ConsoleLogger();
  } else {
    return new NullLogger();
  }
}
