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
  Userv4Service as Userv4GoService,
} from './codegen/goService.generated';
export * from './codegen/service.generated';

// Export commonly used types for ProfileService and user registration
export type {
  controllers_UserReturn,
  forms_AccountKey,
  forms_DeviceInfo,
  forms_FlowAccountInfo,
  forms_EvmAccountInfo,
} from './codegen/goService.generated';

// Export service options
export { serviceOptions as goServiceOptions } from './codegen/goService.generated';
export { serviceOptions } from './codegen/service.generated';

// Export dynamic configuration functions
export { configureApiEndpoints, isApiConfigured } from './config';
