import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

/**
 * This will break the whole test run if any test leaks an unhandled rejection.
 *
 * To ensure only a single test breaks, make sure to wrap each test with the `handleRejection` helper.
 */
process.on('unhandledRejection', (reason, promise) => {
  // tslint:disable-next-line:no-console
  console.error('unhandled error during tests', reason);
  process.exit(1);
});

use(chaiAsPromised);
use(sinonChai);

