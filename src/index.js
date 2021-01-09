import React from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import getLineHeight from 'line-height';
import ResizeObserver from 'resize-observer-polyfill';
import TOKENIZE_POLICY from './tokenize-rules';
import { Atom, isAtomComponent, ATOM_STRING_ID } from './atom';

const SPLIT = {
  LEFT: true,
  RIGHT: false,
};

const toString = (node, string = '') => {
  if (!node) {
    return string;
  } else if (typeof node === 'string') {
    return string + node;
  } else if (isAtomComponent(node)) {
    return string + ATOM_STRING_ID;
  }
  const children = Array.isArray(node) ? node : node.props.children || '';

  return (
    string + React.Children.map(children, (child) => toString(child)).join('')
  );
};

const cloneWithChildren = (node, children, isRootEl, level) => {
  const getDisplayStyle = () => {
    if (isRootEl) {
      return {
        // root element cannot be an inline element because of the line calculation
        display: (node.props.style || {}).display || 'block',
      };
    } else if (level === 2) {
      return {
        // level 2 elements (direct children of the root element) need to be inline because of the ellipsis.
        // if level 2 element was a block element, ellipsis would get rendered on a new line, breaking the max number of lines
        display: (node.props.style || {}).display || 'inline-block',
      };
    } else return {};
  };

  return {
    ...node,
    props: {
      ...node.props,
      style: {
        ...node.props.style,
        ...getDisplayStyle(),
      },
      children,
    },
  };
};

const validateTree = (node) => {
  if (typeof node === 'string' || isAtomComponent(node)) {
    return true;
  } else if (typeof node.type === 'function') {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable no-console */
      console.error(
        `ReactTruncateMarkup tried to render <${node.type.name} />, but truncating React components is not supported, the full content is rendered instead. Only DOM elements are supported. Alternatively, you can take advantage of the <TruncateMarkup.Atom /> component (see more in the docs https://github.com/parsable/react-truncate-markup/blob/master/README.md#truncatemarkupatom-).`,
      );
      /* eslint-enable */
    }

    return false;
  }

  if (node.props.children) {
    return React.Children.toArray(node.props.children).reduce(
      (isValid, child) => isValid && validateTree(child),
      true,
    );
  }

  return true;
};

export default class TruncateMarkup extends React.Component {
  static Atom = Atom;

  static propTypes = {
    children: PropTypes.element.isRequired,
    lines: PropTypes.number,
    ellipsis: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
      PropTypes.func,
    ]),
    lineHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onTruncate: PropTypes.func,
    // eslint-disable-next-line
    onAfterTruncate: (props, propName, componentName) => {
      if (props[propName]) {
        return new Error(
          `${componentName}: Setting \`onAfterTruncate\` prop is deprecated, use \`onTruncate\` instead.`,
        );
      }
    },
    tokenize: (props, propName, componentName) => {
      const tokenizeValue = props[propName];

      if (typeof tokenizeValue !== 'undefined') {
        if (!TOKENIZE_POLICY[tokenizeValue]) {
          /* eslint-disable no-console */
          return new Error(
            `${componentName}: Unknown option for prop 'tokenize': '${tokenizeValue}'. Option 'characters' will be used instead.`,
          );
          /* eslint-enable */
        }
      }
    },
  };

  static defaultProps = {
    lines: 1,
    ellipsis: '...',
    lineHeight: '',
    onTruncate: () => {},
    tokenize: 'characters',
  };

  constructor(props) {
    super(props);

    this.state = {
      text: this.childrenWithRefMemo(this.props.children),
    };
  }

  lineHeight = null;
  splitDirectionSeq = [];
  shouldTruncate = true;
  wasLastCharTested = false;
  endFound = false;
  latestThatFits = null;
  onTruncateCalled = false;

  toStringMemo = memoizeOne(toString);
  childrenWithRefMemo = memoizeOne(this.childrenElementWithRef);
  validateTreeMemo = memoizeOne(validateTree);

  get isValid() {
    return this.validateTreeMemo(this.props.children);
  }
  get origText() {
    return this.childrenWithRefMemo(this.props.children);
  }
  get policy() {
    return TOKENIZE_POLICY[this.props.tokenize] || TOKENIZE_POLICY.characters;
  }

  componentDidMount() {
    if (!this.isValid) {
      return;
    }

    // get the computed line-height of the parent element
    // it'll be used for determining whether the text fits the container or not
    this.lineHeight = this.props.lineHeight || getLineHeight(this.el);
    this.truncate();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.shouldTruncate = false;
    this.latestThatFits = null;

    this.setState(
      {
        text: this.childrenWithRefMemo(nextProps.children),
      },
      () => {
        if (!this.isValid) {
          return;
        }

        this.lineHeight = nextProps.lineHeight || getLineHeight(this.el);
        this.shouldTruncate = true;
        this.truncate();
      },
    );
  }

  componentDidUpdate() {
    if (this.shouldTruncate === false || this.isValid === false) {
      return;
    }

    if (this.endFound) {
      // we've found the end where we cannot split the text further
      // that means we've already found the max subtree that fits the container
      // so we are rendering that
      if (
        this.latestThatFits !== null &&
        this.state.text !== this.latestThatFits
      ) {
        /* eslint-disable react/no-did-update-set-state */
        this.setState({
          text: this.latestThatFits,
        });

        return;
        /* eslint-enable */
      }

      this.onTruncate(/* wasTruncated */ true);

      return;
    }

    if (this.splitDirectionSeq.length) {
      if (this.fits()) {
        this.latestThatFits = this.state.text;
        // we've found a subtree that fits the container
        // but we need to check if we didn't cut too much of it off
        // so we are changing the last splitting decision from splitting and going left
        // to splitting and going right
        this.splitDirectionSeq.splice(
          this.splitDirectionSeq.length - 1,
          1,
          SPLIT.RIGHT,
          SPLIT.LEFT,
        );
      } else {
        this.splitDirectionSeq.push(SPLIT.LEFT);
      }

      this.tryToFit(this.origText, this.splitDirectionSeq);
    }
  }

  componentWillUnmount() {
    this.lineHeight = null;
    this.latestThatFits = null;
    this.splitDirectionSeq = [];
  }

  onTruncate = (wasTruncated) => {
    if (!this.onTruncateCalled) {
      this.onTruncateCalled = true;
      this.props.onTruncate(wasTruncated);
    }
  };

  handleResize = (el, prevResizeObserver) => {
    // clean up previous observer
    if (prevResizeObserver) {
      prevResizeObserver.disconnect();
    }

    // unmounting or just unsetting the element to be replaced with a new one later
    if (!el) return null;

    /* Wrapper element resize handing */
    let initialRender = true;
    const resizeCallback = () => {
      if (initialRender) {
        // ResizeObserer cb is called on initial render too so we are skipping here
        initialRender = false;
      } else {
        // wrapper element has been resized, recalculating with the original text
        this.shouldTruncate = false;
        this.latestThatFits = null;

        this.setState(
          {
            text: this.origText,
          },
          () => {
            this.shouldTruncate = true;
            this.onTruncateCalled = false;
            this.truncate();
          },
        );
      }
    };

    const resizeObserver =
      prevResizeObserver || new ResizeObserver(resizeCallback);

    resizeObserver.observe(el);

    return resizeObserver;
  };

  truncate() {
    if (this.fits()) {
      // the whole text fits on the first try, no need to do anything else
      this.shouldTruncate = false;
      this.onTruncate(/* wasTruncated */ false);

      return;
    }

    this.truncateOriginalText();
  }

  setRef = (el) => {
    const isNewEl = this.el !== el;
    this.el = el;

    // whenever we obtain a new element, attach resize handler
    if (isNewEl) {
      this.resizeObserver = this.handleResize(el, this.resizeObserver);
    }
  };

  childrenElementWithRef(children) {
    const child = React.Children.only(children);

    return React.cloneElement(child, {
      ref: this.setRef,
      style: {
        wordWrap: 'break-word',
        ...child.props.style,
      },
    });
  }

  truncateOriginalText() {
    this.endFound = false;
    this.splitDirectionSeq = [SPLIT.LEFT];
    this.wasLastCharTested = false;

    this.tryToFit(this.origText, this.splitDirectionSeq);
  }

  /**
   * Splits rootEl based on instructions and updates React's state with the returned element
   * After React rerenders the new text, we'll check if the new text fits in componentDidUpdate
   * @param  {ReactElement} rootEl - the original children element
   * @param  {Array} splitDirections - list of SPLIT.RIGHT/LEFT instructions
   */
  tryToFit(rootEl, splitDirections) {
    if (!rootEl.props.children) {
      // no markup in container
      return;
    }

    const newRootEl = this.split(rootEl, splitDirections, /* isRootEl */ true);

    let ellipsis =
      typeof this.props.ellipsis === 'function'
        ? this.props.ellipsis(newRootEl)
        : this.props.ellipsis;

    ellipsis =
      typeof ellipsis === 'object'
        ? React.cloneElement(ellipsis, { key: 'ellipsis' })
        : ellipsis;

    const newChildren = newRootEl.props.children;
    const newChildrenWithEllipsis = [].concat(newChildren, ellipsis);

    // edge case tradeoff EC#1 - on initial render it doesn't fit in the requested number of lines (1) so it starts truncating
    // - because of truncating and the ellipsis position, div#lvl2 will have display set to 'inline-block',
    //   causing the whole body to fit in 1 line again
    // - if that happens, ellipsis is not needed anymore as the whole body is rendered
    // - NOTE this could be fixed by checking for this exact case and handling it separately so it renders <div>foo {ellipsis}</div>
    //
    // Example:
    // <TruncateMarkup lines={1}>
    //   <div>
    //     foo
    //     <div id="lvl2">bar</div>
    //   </div>
    // </TruncateMarkup>
    const shouldRenderEllipsis =
      toString(newChildren) !== this.toStringMemo(this.props.children);

    this.setState({
      text: {
        ...newRootEl,
        props: {
          ...newRootEl.props,
          children: shouldRenderEllipsis
            ? newChildrenWithEllipsis
            : newChildren,
        },
      },
    });
  }

  /**
   * Splits JSX node based on its type
   * @param  {null|string|Array|Object} node - JSX node
   * @param  {Array} splitDirections - list of SPLIT.RIGHT/LEFT instructions
   * @return {null|string|Array|Object} - split JSX node
   */
  split(node, splitDirections, isRoot = false, level = 1) {
    if (!node || isAtomComponent(node)) {
      this.endFound = true;

      return node;
    } else if (typeof node === 'string') {
      return this.splitString(node, splitDirections, level);
    } else if (Array.isArray(node)) {
      return this.splitArray(node, splitDirections, level);
    }

    const newChildren = this.split(
      node.props.children,
      splitDirections,
      /* isRoot */ false,
      level + 1,
    );

    return cloneWithChildren(node, newChildren, isRoot, level);
  }

  splitString(string, splitDirections = [], level) {
    if (!splitDirections.length) {
      return string;
    }

    if (splitDirections.length && this.policy.isAtomic(string)) {
      // allow for an extra render test with the current character included
      // in most cases this variation was already tested, but some edge cases require this check
      // NOTE could be removed once EC#1 is taken care of
      if (!this.wasLastCharTested) {
        this.wasLastCharTested = true;
      } else {
        // we are trying to split further but we have nowhere to go now
        // that means we've already found the max subtree that fits the container
        this.endFound = true;
      }

      return string;
    }

    if (this.policy.tokenizeString) {
      const wordsArray = this.splitArray(
        this.policy.tokenizeString(string),
        splitDirections,
        level,
      );

      // in order to preserve the input structure
      return wordsArray.join('');
    }

    const [splitDirection, ...restSplitDirections] = splitDirections;
    const pivotIndex = Math.ceil(string.length / 2);
    const beforeString = string.substring(0, pivotIndex);

    if (splitDirection === SPLIT.LEFT) {
      return this.splitString(beforeString, restSplitDirections, level);
    }
    const afterString = string.substring(pivotIndex);

    return (
      beforeString + this.splitString(afterString, restSplitDirections, level)
    );
  }

  splitArray(array, splitDirections = [], level) {
    if (!splitDirections.length) {
      return array;
    }

    if (array.length === 1) {
      return [this.split(array[0], splitDirections, /* isRoot */ false, level)];
    }

    const [splitDirection, ...restSplitDirections] = splitDirections;
    const pivotIndex = Math.ceil(array.length / 2);
    const beforeArray = array.slice(0, pivotIndex);

    if (splitDirection === SPLIT.LEFT) {
      return this.splitArray(beforeArray, restSplitDirections, level);
    }
    const afterArray = array.slice(pivotIndex);

    return beforeArray.concat(
      this.splitArray(afterArray, restSplitDirections, level),
    );
  }

  fits() {
    const { lines: maxLines } = this.props;
    const { height } = this.el.getBoundingClientRect();
    const computedLines = Math.round(height / parseFloat(this.lineHeight));

    return maxLines >= computedLines;
  }

  render() {
    return this.state.text;
  }
}
