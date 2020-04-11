import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';

import TruncateMarkup from '../src';

const consoleErrorMsg = (componentName) =>
  `ReactTruncateMarkup tried to render <${componentName} />, but truncating React components is not supported, the full content is rendered instead. Only DOM elements are supported.`;

let div;

const renderIntoDocument = (ReactComponent) => {
  ReactDOM.render(ReactComponent, div);
};

describe('TruncateMarkup', () => {
  beforeEach(() => {
    div = document.createElement('div');
    document.documentElement.appendChild(div);

    expect.spyOn(console, 'error');
    expect.spyOn(console, 'warn');
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

  describe('Warnings for tokenize prop', () => {
    it('should not warn when using a proper value for tokenize prop', () => {
      renderIntoDocument(
        <TruncateMarkup tokenize="words">
          <div>
            <span>Some text</span>
            <span>More text</span>
          </div>
        </TruncateMarkup>,
      );

      expect(console.warn).toNotHaveBeenCalled();
    });

    it('should warn when using unknown value for tokenize prop', () => {
      renderIntoDocument(
        <TruncateMarkup tokenize="unknown option">
          <div>
            <span>Some text</span>
            <span>More text</span>
          </div>
        </TruncateMarkup>,
      );

      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('onAfterTruncate callback', () => {
    it('should be called with wasTruncated = false once', () => {
      const onTruncateCb = expect.createSpy();

      renderIntoDocument(
        <TruncateMarkup onTruncate={onTruncateCb}>
          <div>
            <span>Some text</span>
          </div>
        </TruncateMarkup>,
      );

      expect(onTruncateCb.calls.length).toBe(1);
      expect(onTruncateCb.calls[0].arguments).toEqual([false]);
    });

    it('should be called with wasTruncated = true once', () => {
      const onTruncateCb = expect.createSpy();

      const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ' +
        'ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco ' +
        'laboris nisi ut aliquip ex ea commodo consequat.';

      renderIntoDocument(
        <TruncateMarkup onTruncate={onTruncateCb}>
          <div style={{ width: '200px' }}>{longText}</div>
        </TruncateMarkup>,
      );

      expect(onTruncateCb.calls.length).toBe(1);
      expect(onTruncateCb.calls[0].arguments).toEqual([true]);
    });

    it('should not be called after update', () => {
      const onTruncateCb = expect.createSpy();
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
            <TruncateMarkup onTruncate={onTruncateCb}>
              <div style={{ width: '200px' }}>{this.props.text}</div>
            </TruncateMarkup>
          );
        }
      }

      renderIntoDocument(<TestCase text={shortText} />);
      renderIntoDocument(<TestCase text={longText} />);

      expect(onTruncateCb.calls.length).toBe(1);
      expect(onTruncateCb.calls[0].arguments).toEqual([false]);

      expect(onMount.calls.length).toBe(1);
      expect(onUpdate.calls.length).toBe(1);
      expect(onUpdate.calls[0].arguments).toEqual([longText]);
    });
  });

  describe('children validation', () => {
    it('handles multiple arrays as children', () => {
      const instance = new TruncateMarkup({
        children: (
          <div>
            {['1']}
            {['2']}
          </div>
        ),
      });

      expect(() => {
        instance.isValid();
      }).toNotThrow();
    });
    it('handles nested arrays as children', () => {
      const instance = new TruncateMarkup({
        children: (
          <div>
            {[]}
            {['1', '2', ['3', []]]}
          </div>
        ),
      });

      expect(() => {
        instance.isValid();
      }).toNotThrow();
    });
  });
});
