import { Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SvgXml } from 'react-native-svg';

export function Badge({ src }: { src: string }) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const isSvg = src.endsWith('.svg');

  useEffect(() => {
    let isMounted = true;
    if (isSvg) {
      fetch(src)
        .then(res => res.text())
        .then(text => {
          if (isMounted) setSvgContent(text);
        })
        .catch(() => setSvgContent(null));
    }
    return () => {
      isMounted = false;
    };
  }, [src]);

  if (isSvg) {
    if (!svgContent) return null;
    return <SvgXml xml={svgContent} width={48} height={48} style={{ borderRadius: 24 }} />;
  }
  return <Image source={{ uri: src }} style={{ width: 48, height: 48, borderRadius: 24 }} />;
}
