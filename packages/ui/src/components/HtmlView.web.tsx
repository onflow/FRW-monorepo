import React from 'react';

import type { HtmlViewProps } from './HtmlView.native';

const HtmlView = (props: HtmlViewProps): React.JSX.Element => {
  const { styles, htmlContent } = props;
  return <div {...styles} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

HtmlView.displayName = 'HtmlView(web)';

export default HtmlView;
