import React, { Component } from 'react';
import { render } from 'react-dom';

import TruncateMarkup from '../../src';

class Demo extends Component {
  render() {
    return (
      <div>
        <h1>{`<TruncateMarkup />`} Demo</h1>

        <TruncateMarkup>
          <div />
        </TruncateMarkup>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
