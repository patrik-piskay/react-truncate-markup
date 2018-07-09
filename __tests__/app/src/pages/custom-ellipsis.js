import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const link = {
  color: 'blue',
  textDecoration: 'underline',
  cursor: 'pointer',
};

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
  'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
  'laboris nisi ut aliquip ex ea commodo consequat.';

class TestCase extends React.Component {
  state = {
    shouldTruncate: true,
  };

  toggleTruncate = () =>
    this.setState(({ shouldTruncate }) => ({
      shouldTruncate: !shouldTruncate,
    }));

  readMoreEllipsis = () => (
    <span>
      ...{' '}
      <span onClick={this.toggleTruncate} style={link}>
        read more
      </span>
    </span>
  );

  render() {
    return (
      <div>
        {this.state.shouldTruncate ? (
          <TruncateMarkup lines={3} ellipsis={this.readMoreEllipsis}>
            <div style={style}>{longText}</div>
          </TruncateMarkup>
        ) : (
          <div style={style}>
            {longText}
            <span onClick={this.toggleTruncate} style={link}>
              {' show less'}
            </span>
          </div>
        )}
      </div>
    );
  }
}

export default TestCase;
