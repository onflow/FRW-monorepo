// Web build entry re-exports the web implementation. Metro (RN) will prefer
// LottieView.native.tsx automatically.
export { default } from './LottieView.web';
export type { LottieViewProps, LottieSource } from './LottieView.web';
