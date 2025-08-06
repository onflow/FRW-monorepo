// Import static configuration (will be overridden by dynamic config)
import './codgen/axios';

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
} from './codgen/goService.generated';
export * from './codgen/service.generated';

// Export service options
export { serviceOptions as goServiceOptions } from './codgen/goService.generated';
export { serviceOptions } from './codgen/service.generated';

// Export dynamic configuration functions
export { configureApiEndpoints, isApiConfigured } from './config';
