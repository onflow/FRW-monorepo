import lottie from 'lottie-web';
import React, { useEffect, useImperativeHandle, useRef } from 'react';

export type LottieSource = any; // animation JSON object

export interface LottieViewProps {
  source: LottieSource;
  autoPlay?: boolean;
  loop?: boolean | number;
  style?: React.CSSProperties;
  resizeMode?: 'cover' | 'contain' | 'center';
  speed?: number;
  /** Progress of the animation (0-1). When set, overrides autoPlay and loop. */
  progress?: number;
  onAnimationFailure?: (error: unknown) => void;
  onAnimationLoaded?: () => void;
}

type LottieHandle = {
  play?: () => void;
  pause?: () => void;
  stop?: () => void;
};

const LottieView = React.forwardRef<LottieHandle, LottieViewProps>(
  (
    {
      source,
      autoPlay = true,
      loop = true,
      style,
      resizeMode = 'contain',
      speed = 1,
      progress,
      onAnimationFailure,
      onAnimationLoaded,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationRef = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null);

    useImperativeHandle(ref, () => ({
      play: () => animationRef.current?.play?.(),
      pause: () => animationRef.current?.pause?.(),
      stop: () => animationRef.current?.stop?.(),
    }));

    useEffect(() => {
      if (!containerRef.current || !source) return;

      try {
        // Clear any previous animation DOM
        containerRef.current.innerHTML = '';

        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: progress !== undefined ? false : loop,
          autoplay: progress !== undefined ? false : autoPlay,
          animationData: source,
        });

        animationRef.current = anim;

        // Apply speed if provided
        if (typeof speed === 'number' && speed !== 1) {
          anim.setSpeed(speed);
        }

        const handleLoaded = () => {
          onAnimationLoaded?.();
        };

        anim.addEventListener('DOMLoaded', handleLoaded);
        anim.addEventListener('data_failed', onAnimationFailure as any);

        return () => {
          anim.removeEventListener('DOMLoaded', handleLoaded);
          anim.removeEventListener('data_failed', onAnimationFailure as any);
          anim.destroy();
          animationRef.current = null;
        };
      } catch (err) {
        onAnimationFailure?.(err);
      }
    }, [source, autoPlay, loop, speed, progress, onAnimationFailure, onAnimationLoaded]);

    // Control animation progress when progress prop is provided
    useEffect(() => {
      if (progress !== undefined && animationRef.current) {
        const totalFrames = animationRef.current.totalFrames;
        const frame = Math.floor(progress * totalFrames);
        animationRef.current.goToAndStop(frame, true);
      }
    }, [progress]);

    const containerStyle: React.CSSProperties = {
      width: (style as any)?.width ?? '100%',
      height: (style as any)?.height ?? '100%',
      overflow: 'hidden',
      objectFit: resizeMode === 'cover' ? 'cover' : resizeMode === 'center' ? 'none' : 'contain',
      ...style,
    };

    return <div ref={containerRef} style={containerStyle} />;
  }
);

LottieView.displayName = 'LottieView(web)';

export default LottieView;
