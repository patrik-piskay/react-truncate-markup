import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
  'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
  'laboris nisi ut aliquip ex ea commodo consequat.';

class TestCase extends React.Component {
  render() {
    return (
      <div>
        <TruncateMarkup lines={3} ellipsis="...[custom]">
          <div style={style}>{longText}</div>
        </TruncateMarkup>
      </div>
    );
  }
}

export default TestCase;
