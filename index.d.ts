import * as React from "react";

export interface TruncateProps {
    lines?: number;
    ellipsis?: React.ReactNode | ((element: React.ReactNode) => React.ReactNode);
    lineHeight?: number;
}

declare class TruncateMarkup extends React.Component<TruncateProps> {}

export default TruncateMarkup;
