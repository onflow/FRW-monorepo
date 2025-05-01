import { loginAsTestUser } from '../utils/helper';
import { test, expect } from '../utils/loader';

test('Login test', async ({ page, extensionId }) => {
  await loginAsTestUser({ page, extensionId });
});
