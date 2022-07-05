import * as React from 'react';

export interface TruncateProps {
  children?: React.ReactNode;
  lines?: number;
  ellipsis?: React.ReactNode | ((element: React.ReactNode) => React.ReactNode);
  lineHeight?: number | string;
  tokenize?: string;
  onTruncate?: (wasTruncated: boolean) => any;
}

declare class TruncateMarkup extends React.Component<TruncateProps> {
  static Atom: React.ComponentType<{ children: React.ReactNode }>;
}

export default TruncateMarkup;
