const FIGMA_CONTAINER_WIDTH = 175.6574;
const FIGMA_CONTAINER_HEIGHT = 210.3156;
const FIGMA_MAIN_WIDTH = 168;
const FIGMA_MAIN_HEIGHT = 204.844;
const FIGMA_BADGE_SIZE = 94.3156;

export interface BackupLoadingIconLayout {
  container: {
    width: number;
    height: number;
  };
  main: {
    width: number;
    height: number;
    left: number;
    top: number;
  };
  badge: {
    width: number;
    height: number;
    right: number;
    bottom: number;
  };
}

export function getBackupLoadingIconLayout(
  width = FIGMA_CONTAINER_WIDTH,
  height = FIGMA_CONTAINER_HEIGHT
): BackupLoadingIconLayout {
  const scaleX = width / FIGMA_CONTAINER_WIDTH;
  const scaleY = height / FIGMA_CONTAINER_HEIGHT;

  const mainWidth = FIGMA_MAIN_WIDTH * scaleX;
  const mainHeight = FIGMA_MAIN_HEIGHT * scaleY;
  const badgeWidth = FIGMA_BADGE_SIZE * scaleX;
  const badgeHeight = FIGMA_BADGE_SIZE * scaleY;

  return {
    container: {
      width,
      height,
    },
    main: {
      width: mainWidth,
      height: mainHeight,
      left: (width - mainWidth) / 2,
      top: (height - mainHeight) / 2,
    },
    badge: {
      width: badgeWidth,
      height: badgeHeight,
      right: 0,
      bottom: 0,
    },
  };
}
