import React from 'react';
import TruncateMarkup from '../../../../src';

const TestCase = () => (
  <div>
    <TruncateMarkup lines={1}>
      <span>
        <div>line1</div>
        <div>line2</div>
      </span>
    </TruncateMarkup>

    <TruncateMarkup lines={1}>
      <span>
        <div>
          line1 <div>line2</div>
        </div>
      </span>
    </TruncateMarkup>

    <TruncateMarkup lines={1}>
      <span>
        line1 <div>line2</div>
      </span>
    </TruncateMarkup>
  </div>
);

export default TestCase;
