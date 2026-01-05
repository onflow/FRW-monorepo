// Export generated services
export {
  AccountService as AccountGoService,
  AddressbookService,
  CoinService as CoinGoService,
  CryptoService as CryptoGoService,
  DeviceService as DeviceGoService,
  NftService as NftGoService,
  ProfileService as ProfileGoService,
  UserService as UserGoService,
  Userv3Service as Userv3GoService,
  type forms_AccountKeySignature,
  type forms_BackupInfo,
  type forms_AccountKey,
  type forms_AccountKeyForm,
} from './codegen/goService.generated';
export * from './codegen/service.generated';

// Export service options
export { serviceOptions as goServiceOptions } from './codegen/goService.generated';
export { serviceOptions } from './codegen/service.generated';

// Export dynamic configuration functions
export { configureApiEndpoints, isApiConfigured } from './config';
