import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

export interface HtmlViewProps {
  version?: string;
  htmlContent: string;
  styles?: Record<string, unknown>;
}

export const HtmlView: React.FC<HtmlViewProps> = (props) => {
  const { htmlContent } = props;
  const source = {
    html: htmlContent,
  };

  const { width } = useWindowDimensions();

  return <RenderHtml contentWidth={width} source={source} />;
};

HtmlView.displayName = 'HtmlView(native)';

export default HtmlView;
