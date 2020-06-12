import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const LoremIpsumPart = () => (
  <span>consectetur adipiscing elit, sed do eiusmod tempor incididunt </span>
);

const TestCase = () => (
  <div>
    <div>
      <TruncateMarkup lines={3}>
        <div style={style}>
          Lorem ipsum dolor sit amet,
          <TruncateMarkup.Atom>
            <LoremIpsumPart />
          </TruncateMarkup.Atom>
          ut labore et dolore magna aliqua.
        </div>
      </TruncateMarkup>
    </div>
    <div style={{ marginTop: '10px' }}>
      <TruncateMarkup lines={3}>
        <div style={style}>
          Lorem ipsum dolor sit amet,
          <TruncateMarkup.Atom>
            consectetur (skipping...) tempor incididunt
          </TruncateMarkup.Atom>
          ut labore et dolore magna aliqua.
        </div>
      </TruncateMarkup>
    </div>
  </div>
);

export default TestCase;
