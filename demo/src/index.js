import React, { Component } from 'react';
import { render } from 'react-dom';
import { ResizableBox } from 'react-resizable';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism-tomorrow.css';
import 'react-resizable/css/styles.css';

import './styles.css';

import TruncateMarkup from '../../src';

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

const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

const wordCountEllipsis = (node) => {
  const originalWordCount = longText.match(/\S+/g).length;
  const currentWordCount = node.props.children.match(/\S+/g).length;

  return `... (+${originalWordCount - currentWordCount} words)`;
};

const rolesLeftEllipsis = (node) => {
  const displayedRoles = node.props.children[1];

  const originalRolesCount = userRoles.length;
  const displayedRolesCount = displayedRoles
    ? displayedRoles.split(', ').filter(Boolean).length
    : 0;

  return `... (+${originalRolesCount - displayedRolesCount} roles)`;
};

class OnTruncateCallback extends Component {
  state = { onTruncateCalledCount: 0 };

  incrementTruncateCalledCount = (wasTruncated) => {
    this.setState((state) => ({
      onTruncateCalledCount: state.onTruncateCalledCount + 1,
      lastWasTruncated: wasTruncated,
    }));
  };
  render() {
    return (
      <React.Fragment>
        <ResizableBox
          width={240}
          height={40}
          minConstraints={[150, 40]}
          maxConstraints={[350, 40]}
          className="box"
        >
          <TruncateMarkup
            lines={1}
            onTruncate={this.incrementTruncateCalledCount}
          >
            <div>
              <strong>User roles: </strong>
              {userRoles.join(', ')}
            </div>
          </TruncateMarkup>
        </ResizableBox>
        <div>
          onTruncate called:{' '}
          <b>
            {this.state.onTruncateCalledCount}x<b />
          </b>
        </div>
        {this.state.lastWasTruncated !== undefined && (
          <div>
            Did truncate? <b>{this.state.lastWasTruncated ? 'Yes' : 'No'}</b>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const OnTruncateCallbackCodeHighlight = (
  <pre>
    <code
      className="language-jsx"
      dangerouslySetInnerHTML={{
        __html: Prism.highlight(
          `const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

<TruncateMarkup
  lines={1}
  onTruncate={wasTruncated => {
    this.setState(state => ({
      onTruncateCalledCount:
        state.onTruncateCalledCount + 1,
      lastWasTruncated: wasTruncated,
    }));
  }}
>
  <div>
    <strong>User roles: </strong>
    {userRoles.join(', ')}
  </div>
</TruncateMarkup>

<div>
  onTruncate called: {this.state.onTruncateCalledCount}x
  Did truncate? {this.state.lastWasTruncated ? 'Yes' : 'No'}
</div>
`,
          Prism.languages.javascript,
        ),
      }}
    />
  </pre>
);

const Foo = props => props.children;
class Demo extends Component {
  state = { shouldTruncate: true };

  toggleTruncate = () => {
    this.setState((state) => ({ shouldTruncate: !state.shouldTruncate }));
  };

  render() {
    const readMoreEllipsis = (
      <span>
        ...{' '}
        <span onClick={this.toggleTruncate} style={link}>
          read more
        </span>
      </span>
    );

    return (
      <div className="site">
        <div className="side">
          <div className="title">Examples</div>
          <div className="links">
            <a href="#without-truncating">without truncating</a>
            <a href="#1-line-truncating">1 line truncating</a>
            <a href="#3-line-truncating">3 line truncating</a>
            <a href="#custom-ellipsis">custom ellipsis</a>
            <a href="#ellipsis-callback">ellipsis callback</a>
            <a href="#more-markup">more markup</a>
            <a href="#resizable-box">resizable box</a>
            <a href="#onTruncate-callback">onTruncate callback</a>
            <a href="#tokenize-words">tokenize: words</a>
          </div>
        </div>
        <div className="main">
          <h1>{`<TruncateMarkup />`} Examples</h1>

          <h2 id="without-truncating">Without truncating</h2>

          <div className="block">
            <div className="eval">
              <div style={style}>
                <strong>User roles: </strong>
                {userRoles.join(', ')}
              </div>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

<div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
  <strong>User roles: </strong>
  {userRoles.join(', ')}
</div>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="1-line-truncating">1 line truncating</h2>

          <div className="block">
            <div className="eval">
              <TruncateMarkup>
                <div style={style}>
                  <strong>User roles: </strong>
                  {userRoles.join(', ')}
                </div>
              </TruncateMarkup>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

<TruncateMarkup>
  <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
    <strong>User roles: </strong>
    {userRoles.join(', ')}
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="3-line-truncating">3 line truncating</h2>

          <div className="block">
            <div className="eval">
              <TruncateMarkup lines={3}>
                <div style={style}>{longText}</div>
              </TruncateMarkup>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `<TruncateMarkup lines={3}>
  <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
    {'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
      'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ' +
      'ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
      'ut aliquip ex ea commodo consequat.'}
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="custom-ellipsis">With custom ellipsis</h2>

          <div className="block">
            <div className="eval">
              {this.state.shouldTruncate ? (
                <TruncateMarkup lines={3} ellipsis={readMoreEllipsis}>
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

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
  'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ' +
  'ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
  'ut aliquip ex ea commodo consequat.';

const readMoreEllipsis = (
  <span>
    ...{' '}
    <span onClick={this.toggleTruncate} style={link}>
      read more
    </span>
  </span>
);

{this.state.shouldTruncate ? (
  <TruncateMarkup lines={3} ellipsis={readMoreEllipsis}>
    <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
      {longText}
    </div>
  </TruncateMarkup>
) : (
  <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
    {longText}
    <span onClick={this.toggleTruncate} style={link}>
      {' show less'}
    </span>
  </div>
)}
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="ellipsis-callback">With ellipsis callback</h2>

          <div className="block">
            <div className="eval">
              <TruncateMarkup lines={1} ellipsis={rolesLeftEllipsis}>
                <div style={style}>
                  <strong>User roles: </strong>
                  {userRoles.join(', ')}
                </div>
              </TruncateMarkup>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

const rolesLeftEllipsis = node => {
  const displayedRoles = node.props.children[1];

  const originalRolesCount = userRoles.length;
  const displayedRolesCount = displayedRoles
    ? displayedRoles.split(', ').filter(Boolean).length
    : 0;

  return \`... (+\${originalRolesCount - displayedRolesCount} roles)\`;
};

<TruncateMarkup lines={1} ellipsis={rolesLeftEllipsis}>
  <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
    <strong>User roles: </strong>
    {userRoles.join(', ')}
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="block margin">
            <div className="eval">
              <TruncateMarkup lines={3} ellipsis={wordCountEllipsis}>
                <div style={style}>{longText}</div>
              </TruncateMarkup>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
  'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ' +
  'ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
  'ut aliquip ex ea commodo consequat.';

const wordCountEllipsis = node => {
  const originalWordCount = longText.match(/\\S+/g).length;
  const currentWordCount = node.props.children.match(/\\S+/g).length;

  return \`... (+\${originalWordCount - currentWordCount} words)\`;
};

<TruncateMarkup lines={3} ellipsis={wordCountEllipsis}>
  <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
    {longText}
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="more-markup">More markup</h2>

          <div className="block">
            <div className="eval">
              <TruncateMarkup lines={3}>
                <div style={style}>
                  <span style={{ color: 'tomato' }}>
                    Lorem ipsum dolor sit amet,{' '}
                  </span>
                  <span style={{ color: 'royalblue', fontWeight: 'bold' }}>
                    consectetur adipiscing elit,{' '}
                  </span>
                  <span style={{ color: 'tomato' }}>
                    sed do eiusmod tempor incididunt{' '}
                  </span>
                  <span style={{ color: 'royalblue', fontWeight: 'bold' }}>
                    ut labore et dolore magna aliqua.{' '}
                  </span>
                  <span style={{ color: 'tomato' }}>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  </span>
                </div>
              </TruncateMarkup>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `<TruncateMarkup lines={3}>
  <div style={{ border: '1px dashed #c7c7c7', width: '250px' }}>
    <span style={{ color: 'tomato' }}>
      Lorem ipsum dolor sit amet,{' '}
    </span>
    <span style={{ color: 'royalblue', fontWeight: 'bold' }}>
      consectetur adipiscing elit,{' '}
    </span>
    <span style={{ color: 'tomato' }}>
      sed do eiusmod tempor incididunt{' '}
    </span>
    <span style={{ color: 'royalblue', fontWeight: 'bold' }}>
      ut labore et dolore magna aliqua.{' '}
    </span>
    <span style={{ color: 'tomato' }}>
      Ut enim ad minim veniam, quis nostrud exercitation ullamco
    </span>
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="resizable-box">In resizable box</h2>

          <div className="block">
            <div className="eval">
              <ResizableBox
                width={240}
                height={40}
                minConstraints={[150, 40]}
                maxConstraints={[350, 40]}
                className="box"
              >
                <TruncateMarkup lines={1} ellipsis={rolesLeftEllipsis}>
                  <div>
                    <strong>User roles: </strong>
                    {userRoles.join(', ')}
                  </div>
                </TruncateMarkup>
              </ResizableBox>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

const rolesLeftEllipsis = node => {
  const displayedRoles = node.props.children[1];

  const originalRolesCount = userRoles.length;
  const displayedRolesCount = displayedRoles
    ? displayedRoles.split(', ').filter(Boolean).length
    : 0;

  return \`... (+\${originalRolesCount - displayedRolesCount} roles)\`;
};

<TruncateMarkup lines={1} ellipsis={rolesLeftEllipsis}>
  <div>
    <strong>User roles: </strong>
    {userRoles.join(', ')}
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <div className="block margin">
            <div className="eval">
              <ResizableBox
                width={240}
                height={75}
                minConstraints={[150, 75]}
                maxConstraints={[600, 75]}
                className="box"
              >
                <TruncateMarkup lines={3} ellipsis={wordCountEllipsis}>
                  <div>{longText}</div>
                </TruncateMarkup>
              </ResizableBox>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
  'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ' +
  'ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
  'ut aliquip ex ea commodo consequat.';

const wordCountEllipsis = node => {
  const originalWordCount = longText.match(/\\S+/g).length;
  const currentWordCount = node.props.children.match(/\\S+/g).length;

  return \`... (+\${originalWordCount - currentWordCount} words)\`;
};

<TruncateMarkup lines={3} ellipsis={wordCountEllipsis}>
  <div>{longText}</div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="onTruncate-callback">onTruncate callback</h2>

          <div className="block">
            <div className="eval">
              <OnTruncateCallback />
            </div>

            <div className="code">{OnTruncateCallbackCodeHighlight}</div>
          </div>

          <h2 id="tokenize-words">Tokenize: words</h2>

          <div className="block margin">
            <div className="eval">
              <ResizableBox
                width={240}
                height={75}
                minConstraints={[150, 75]}
                maxConstraints={[600, 75]}
                className="box"
              >
                <TruncateMarkup
                  lines={3}
                  tokenize="words"
                  ellipsis={wordCountEllipsis}
                >
                  <div>{longText}</div>
                </TruncateMarkup>
              </ResizableBox>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ' +
  'eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ' +
  'ad minim veniam, quis nostrud exercitation ullamco laboris nisi ' +
  'ut aliquip ex ea commodo consequat.';

const wordCountEllipsis = node => {
  const originalWordCount = longText.match(/\\S+/g).length;
  const currentWordCount = node.props.children.match(/\\S+/g).length;

  return \`... (+\${originalWordCount - currentWordCount} words)\`;
};

<TruncateMarkup lines={3} tokenize="words" ellipsis={wordCountEllipsis}>
  <div>{longText}</div>
</TruncateMarkup>
  `,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>

          <h2 id="Atomic Markup">TitleTodo</h2>
          <div className="block">
            <div className="eval">
              <ResizableBox
                width={240}
                height={75}
                minConstraints={[80, 75]}
                maxConstraints={[600, 75]}
                className="box"
              >
                <TruncateMarkup lines={3}>
                  <div>
                    <b>
                      (this part is just <i>NORMAL</i> text - splittable
                      anywhere )
                    </b>
                    <TruncateMarkup.Atom>
                      {' '}
                      (this part is atomic, not splittable){' '}
                    </TruncateMarkup.Atom>
                    <TruncateMarkup.Atom>
                      <Foo>
                        <b>((</b>Foo Component that can be used, not splittable<b>))</b>
                      </Foo>
                    </TruncateMarkup.Atom>
                  </div>
                </TruncateMarkup>
              </ResizableBox>
            </div>

            <div className="code">
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      `const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

const rolesLeftEllipsis = node => {
  const displayedRoles = node.props.children[1];

  const originalRolesCount = userRoles.length;
  const displayedRolesCount = displayedRoles
    ? displayedRoles.split(', ').filter(Boolean).length
    : 0;

  return \`... (+\${originalRolesCount - displayedRolesCount} roles)\`;
};

<TruncateMarkup lines={1} ellipsis={rolesLeftEllipsis}>
  <div>
    <strong>User roles: </strong>
    {userRoles.join(', ')}
  </div>
</TruncateMarkup>
`,
                      Prism.languages.javascript,
                    ),
                  }}
                />
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
