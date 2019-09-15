import { describeLeaks, itLeaks } from './async';

describeLeaks('test helpers', async () => {
  itLeaks('should wrap suites');
  itLeaks('should wrap tests');
});
