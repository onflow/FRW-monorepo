import './codgen/axios';
export * from './codgen/service';
export {
  AccountService as AccountGoService,
  CryptoService as CryptoGoService,
  NftService as NftGoService,
  CoinService as CoinGoService,
  UserService as UserGoService,
  ProfileService as ProfileGoService,
  DeviceService as DeviceGoService,
  Userv3Service as Userv3GoService,
  AddressbookService,
} from './codgen/goService';

export { serviceOptions as goServiceOptions } from './codgen/goService';
export { serviceOptions } from './codgen/service';
