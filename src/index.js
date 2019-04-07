import React from 'react';
import PropTypes from 'prop-types';
import getLineHeight from 'line-height';
import ResizeObserver from 'resize-observer-polyfill';
import TOKENIZE_POLICY from './tokenize-rules';

const SPLIT = {
  LEFT: true,
  RIGHT: false,
};

const toString = (node, string = '') => {
  if (!node) {
    return string;
  } else if (typeof node === 'string') {
    return string + node;
  } else if (Array.isArray(node)) {
    let newString = string;
    node.forEach(child => {
      newString = toString(child, newString);
    });

    return newString;
  }

  return toString(node.props.children, string);
};

const getTokenizePolicyByProp = tokenize => {
  if (process.env.NODE_ENV !== 'production' && !TOKENIZE_POLICY[tokenize]) {
    /* eslint-disable no-console */
    console.warn(
      `ReactTruncateMarkup: Unknown option for prop 'tokenize': '${tokenize}'. Option 'characters' will be used instead.`,
    );
    /* eslint-enable */
  }

  return TOKENIZE_POLICY[tokenize] || TOKENIZE_POLICY.characters;
};

const cloneWithChildren = (node, children, isRootEl, level) => ({
  ...node,
  props: {
    ...node.props,
    style: {
      ...node.props.style,
      ...(isRootEl
        ? {
            // root element cannot be an inline element because of the line calculation
            display: (node.props.style || {}).display || 'block',
          }
        : level === 2
          ? {
              // level 2 elements (direct children of the root element) need to be inline because of the ellipsis.
              // if level 2 element was a block element, ellipsis would get rendered on a new line, breaking the max number of lines
              display: (node.props.style || {}).display || 'inline-block',
            }
          : {}),
    },
    children,
  },
});

const validateTree = node => {
  if (typeof node === 'string') {
    return true;
  } else if (typeof node.type === 'function') {
    if (process.env.NODE_ENV !== 'production') {
      /* eslint-disable no-console */
      console.error(
        `ReactTruncateMarkup tried to render <${node.type
          .name} />, but truncating React components is not supported, the full content is rendered instead. Only DOM elements are supported.`,
      );
      /* eslint-enable */
    }

    return false;
  }

  if (node.props.children) {
    if (Array.isArray(node.props.children)) {
      return node.props.children.reduce(
        (isValid, child) => isValid && validateTree(child),
        true,
      );
    }

    return validateTree(node.props.children);
  }

  return true;
};

export default class TruncateMarkup extends React.Component {
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
    tokenize: PropTypes.oneOf(['characters', 'words']),
  };

  static defaultProps = {
    lines: 1,
    ellipsis: '...',
    lineHeight: '',
    onTruncate: () => {},
    tokenize: 'characters',
  };

  state = {
    text: this.childrenElementWithRef(this.props.children),
  };

  isValid = validateTree(this.props.children);
  lineHeight = null;
  splitDirectionSeq = [];
  shouldTruncate = true;
  wasLastCharTested = false;
  endFound = false;
  latestThatFits = null;
  origText = null;
  onTruncateCalled = false;
  policy = null;

  componentDidMount() {
    if (!this.isValid) {
      return;
    }

    this.origText = this.state.text;

    // get the computed line-height of the parent element
    // it'll be used for determining whether the text fits the container or not
    this.lineHeight = this.props.lineHeight || getLineHeight(this.el);
    this.policy = getTokenizePolicyByProp(this.props.tokenize);
    this.truncate();

    this.handleResize();
  }

  componentWillReceiveProps(nextProps) {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.policy = getTokenizePolicyByProp(nextProps.tokenize);
    this.shouldTruncate = false;
    this.latestThatFits = null;
    this.isValid = validateTree(nextProps.children);

    this.setState(
      {
        text: this.childrenElementWithRef(nextProps.children),
      },
      () => {
        if (!this.isValid) {
          return;
        }

        this.origText = this.state.text;
        this.lineHeight = nextProps.lineHeight || getLineHeight(this.el);
        this.shouldTruncate = true;
        this.truncate();

        this.handleResize();
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
      if (this.state.text !== this.latestThatFits) {
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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.lineHeight = null;
    this.origText = null;
    this.latestThatFits = null;
    this.splitDirectionSeq = [];
  }

  onTruncate = wasTruncated => {
    if (!this.onTruncateCalled) {
      this.onTruncateCalled = true;
      this.props.onTruncate(wasTruncated);
    }
  };

  handleResize = () => {
    /* Wrapper element resize handing */
    let initialRender = true;

    this.resizeObserver = new ResizeObserver(() => {
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
    });

    this.resizeObserver.observe(this.el);
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

  childrenElementWithRef(children) {
    const child = React.Children.only(children);

    return React.cloneElement(child, { ref: el => (this.el = el) });
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
    const newChildrenWithEllipsis = Array.isArray(newChildren)
      ? [...newChildren, ellipsis]
      : [newChildren, ellipsis];

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
      toString(newChildren) !== toString(this.origText);

    this.setState({
      text: {
        ...newRootEl,
        props: {
          ...newRootEl.props,
          style: {
            wordWrap: 'break-word',
            ...newRootEl.props.style,
          },
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
    if (!node) {
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
      const [item] = array;

      if (typeof item === 'string') {
        return [this.splitString(item, splitDirections, level)];
      }
      const { children } = item.props;

      const newChildren = this.split(
        children,
        splitDirections,
        /* isRoot */ false,
        level + 1,
      );

      return [cloneWithChildren(item, newChildren, /* isRoot */ false, level)];
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

    if (process.env.NODE_ENV !== 'production' && computedLines <= 0) {
      /* eslint-disable no-console */
      console.warn(
        `ReactTruncateMarkup: number of currently rendered lines: ${computedLines}, not truncating...
  It may be caused by target element not being visible at the time of computation.`,
      );
      /* eslint-enable */
    }

    return maxLines >= computedLines;
  }

  render() {
    return this.state.text;
  }
}
