import React from 'react';
import TruncateMarkup from '../../../../src';

const TestCase = () => (
  <div>
    <TruncateMarkup lines={1}>
      <div>Short text</div>
    </TruncateMarkup>
  </div>
);

export default TestCase;
