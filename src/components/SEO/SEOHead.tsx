import React from 'react';
import SEOHelmet from './SEOHelmet';

type SEOHeadProps = React.ComponentProps<typeof SEOHelmet>;

export default function SEOHead(props: SEOHeadProps) {
  return <SEOHelmet {...props} />;
}
