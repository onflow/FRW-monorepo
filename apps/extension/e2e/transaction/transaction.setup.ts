import { importEoaAccount, importReceiverAccount, importSenderAccount } from '../utils/helper';
import { test as setup } from '../utils/loader';

setup('Import sender and receiver and eoa accounts', async ({ page, extensionId }) => {
  // Lock the extension and import sender and receiver accounts
  setup.slow();
  await importEoaAccount({ page, extensionId });
  await importSenderAccount({ page, extensionId });
  await importReceiverAccount({ page, extensionId });
});
