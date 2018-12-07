import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import TruncateMarkup from '../src';

const consoleErrorMsg = componentName =>
  `ReactTruncateMarkup tried to render <${componentName} />, but truncating React components is not supported, the full content is rendered instead. Only DOM elements are supported.`;

let div;

const renderIntoDocument = ReactComponent => {
  ReactDOM.render(ReactComponent, div);
};

describe('TruncateMarkup', () => {
  beforeEach(() => {
    div = document.createElement('div');
    document.documentElement.appendChild(div);

    expect.spyOn(console, 'error');
  });

  afterEach(() => {
    document.documentElement.removeChild(div);

    expect.restoreSpies();
  });

  describe('Warnings', () => {
    it('should not warn when not using React components inside <TruncateMarkup />', () => {
      renderIntoDocument(
        <TruncateMarkup>
          <div>
            <span>Some text</span>
            <span>More text</span>
          </div>
        </TruncateMarkup>,
      );

      expect(console.error).toNotHaveBeenCalled();
    });

    it('should warn about using React function components inside <TruncateMarkup />', () => {
      const FnComponent = () => <span>text</span>;

      renderIntoDocument(
        <TruncateMarkup>
          <div>
            <span>Some text</span>
            <FnComponent />
          </div>
        </TruncateMarkup>,
      );

      expect(console.error).toHaveBeenCalledWith(
        consoleErrorMsg('FnComponent'),
      );
    });

    it('should warn about using React class components inside <TruncateMarkup />', () => {
      class ClassComponent extends React.Component {
        render() {
          return <span>text</span>;
        }
      }

      renderIntoDocument(
        <TruncateMarkup>
          <div>
            <span>Some text</span>
            <ClassComponent />
          </div>
        </TruncateMarkup>,
      );

      expect(console.error).toHaveBeenCalledWith(
        consoleErrorMsg('ClassComponent'),
      );
    });
  });

  describe('onAfterTruncate callback', () => {
    it('should be called with wasTruncated = false once', () => {
      const onAfterTruncateCb = expect.createSpy();

      renderIntoDocument(
        <TruncateMarkup onAfterTruncate={onAfterTruncateCb}>
          <div>
            <span>Some text</span>
          </div>
        </TruncateMarkup>,
      );

      expect(onAfterTruncateCb.calls.length).toBe(1);
      expect(onAfterTruncateCb.calls[0].arguments).toEqual([false]);
    });

    it('should be called with wasTruncated = true once', () => {
      const onAfterTruncateCb = expect.createSpy();

      const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
        'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
        'laboris nisi ut aliquip ex ea commodo consequat.';

      renderIntoDocument(
        <TruncateMarkup onAfterTruncate={onAfterTruncateCb}>
          <div style={{ width: '200px' }}>{longText}</div>
        </TruncateMarkup>,
      );

      expect(onAfterTruncateCb.calls.length).toBe(1);
      expect(onAfterTruncateCb.calls[0].arguments).toEqual([true]);
    });

    it('should be called after updates', () => {
      const onAfterTruncateCb = expect.createSpy();
      const onMount = expect.createSpy();
      const onUpdate = expect.createSpy();

      const shortText = 'Short text';
      const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
        'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
        'laboris nisi ut aliquip ex ea commodo consequat.';

      class TestCase extends React.Component {
        componentDidMount() {
          onMount();
        }

        componentDidUpdate() {
          onUpdate(this.props.text);
        }

        render() {
          return (
            <TruncateMarkup onAfterTruncate={onAfterTruncateCb}>
              <div style={{ width: '200px' }}>{this.props.text}</div>
            </TruncateMarkup>
          );
        }
      }

      renderIntoDocument(<TestCase text={shortText} />);
      renderIntoDocument(<TestCase text={longText} />);
      renderIntoDocument(<TestCase text={shortText} />);

      expect(onAfterTruncateCb.calls.length).toBe(3);
      expect(onAfterTruncateCb.calls[0].arguments).toEqual([false]);
      expect(onAfterTruncateCb.calls[1].arguments).toEqual([true]);
      expect(onAfterTruncateCb.calls[2].arguments).toEqual([false]);

      expect(onMount.calls.length).toBe(1);
      expect(onUpdate.calls.length).toBe(2);
      expect(onUpdate.calls[0].arguments).toEqual([longText]);
      expect(onUpdate.calls[1].arguments).toEqual([shortText]);
    });
  });
});
