import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
  marginBottom: '20px',
};

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
  'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
  'laboris nisi ut aliquip ex ea commodo consequat.';

const Comp1 = () => <span>{longText}</span>;

class Comp2 extends React.Component {
  render() {
    return <span>{longText}</span>;
  }
}

const TestCase = () => (
  <div>
    <div style={style}>
      <TruncateMarkup lines={1}>
        <div>
          <Comp1 />
        </div>
      </TruncateMarkup>
    </div>
    <div style={style}>
      <TruncateMarkup lines={1}>
        <div>
          <Comp2 />
        </div>
      </TruncateMarkup>
    </div>
  </div>
);

export default TestCase;
