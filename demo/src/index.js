import React, { Component } from 'react';
import { render } from 'react-dom';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

import './styles.css';

import TruncateMarkup from '../../src';

const style = {
  border: '1px dashed #b3acac',
  width: '250px',
};

const buttonStyle = {
  backgroundColor: 'inherit',
  border: 'none',
};

const text =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
  'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
  'laboris nisi ut aliquip ex ea commodo consequat.';

const markup = (
  <div>
    <span style={{ color: 'tomato' }}>Lorem ipsum dolor sit amet, </span>
    <span style={{ color: 'royalblue', fontWeight: 'bold' }}>
      consectetur adipiscing elit,{' '}
    </span>
    <span style={{ color: 'tomato' }}>sed do eiusmod tempor incididunt </span>
    <span style={{ color: 'royalblue', fontWeight: 'bold' }}>
      ut labore et dolore magna aliqua.{' '}
    </span>
    <span style={{ color: 'tomato' }}>
      Ut enim ad minim veniam, quis nostrud exercitation ullamco
    </span>
  </div>
);

class Demo extends Component {
  state = { shouldTruncate: true };

  toggleTruncate = () => {
    this.setState(state => ({ shouldTruncate: !state.shouldTruncate }));
  };

  wordCountEllipsis = node => {
    const originalWordCount = text.match(/\S+/g).length;
    const currentWordCount = node.props.children.match(/\S+/g).length;

    return `... (+${originalWordCount - currentWordCount} words)`;
  };

  render() {
    const readMoreEllipsis = (
      <span>
        ...{' '}
        <button onClick={this.toggleTruncate} style={buttonStyle}>
          read more
        </button>
      </span>
    );

    return (
      <div>
        <h1>{`<TruncateMarkup />`} Demo</h1>

        <h3>Without truncating</h3>
        <div style={style}>{text}</div>

        <h3>1 line truncating</h3>
        <TruncateMarkup>
          <div style={style}>{text}</div>
        </TruncateMarkup>

        <h3>3 line truncating</h3>
        <TruncateMarkup lines={3}>
          <div style={style}>{text}</div>
        </TruncateMarkup>

        <h3>Truncating with a custom ellipsis</h3>
        {this.state.shouldTruncate ? (
          <TruncateMarkup lines={3} ellipsis={readMoreEllipsis}>
            <div style={style}>{text}</div>
          </TruncateMarkup>
        ) : (
          <div style={style}>
            {text}
            <button onClick={this.toggleTruncate} style={buttonStyle}>
              show less
            </button>
          </div>
        )}

        <h3>Truncating with an ellipsis callback</h3>
        <TruncateMarkup lines={3} ellipsis={this.wordCountEllipsis}>
          <div style={style}>{text}</div>
        </TruncateMarkup>

        <h3>Truncating markup</h3>
        <TruncateMarkup lines={3}>
          <div style={style}>{markup}</div>
        </TruncateMarkup>

        <h3>Resizable box with a 3 line truncation</h3>
        <ResizableBox
          width={240}
          height={75}
          minConstraints={[150, 75]}
          maxConstraints={[550, 75]}
          className="box"
        >
          <TruncateMarkup lines={3} ellipsis={this.wordCountEllipsis}>
            <div>{text}</div>
          </TruncateMarkup>
        </ResizableBox>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
