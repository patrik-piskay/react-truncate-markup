import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const TestCase = () => (
  <div>
    <h3>One line</h3>
    <div style={style}>
      <TruncateMarkup>
        <div>VeryLongWord-----------------------------------------------</div>
      </TruncateMarkup>
    </div>

    <h3>Two line - fits</h3>
    <div style={style}>
      <TruncateMarkup lines={2}>
        <div>VeryLongWord-----------------------------------------------</div>
      </TruncateMarkup>
    </div>

    <h3>Two line - truncate</h3>
    <div style={style}>
      <TruncateMarkup lines={2}>
        <div>
          VeryLongWord----------------------------------------------------------------------------------------------
        </div>
      </TruncateMarkup>
    </div>
  </div>
);

export default TestCase;
