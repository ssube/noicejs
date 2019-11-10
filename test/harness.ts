import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import sourceMapSupport from 'source-map-support';

sourceMapSupport.install({
  environment: 'node',
  handleUncaughtExceptions: true,
  hookRequire: true,
});

/**
 * This will break the whole test run if any test leaks an unhandled rejection.
 */
process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('unhandled error during tests', reason);
  process.exit(1);
});

chai.use(chaiAsPromised);
chai.use(sinonChai);
