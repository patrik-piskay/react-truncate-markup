import React from 'react';
import PropTypes from 'prop-types';
import getLineHeight from 'line-height';
import ResizeObserver from 'resize-observer-polyfill';

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

const cloneWithChildren = (node, children, isRootEl) => ({
  ...node,
  props: {
    ...node.props,
    style: {
      ...node.props.style,
      ...(!isRootEl
        ? {
            display: (node.props.style || {}).display || 'inline',
          }
        : {}),
    },
    children,
  },
});

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
  };

  static defaultProps = {
    lines: 1,
    ellipsis: '...',
    lineHeight: '',
  };

  state = {
    text: this.childrenElementWithRef(this.props.children),
  };

  lineHeight = null;
  splitDirectionSeq = [];
  shouldTruncate = true;
  wasLastCharTested = false;
  endFound = false;
  latestThatFits = null;
  origText = null;
  clientWidth = null;

  componentDidMount() {
    this.origText = this.state.text;

    // get the computed line-height of the parent element
    // it'll be used for determining whether the text fits the container or not
    this.lineHeight = this.props.lineHeight || getLineHeight(this.el);

    this.truncate();

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
            this.truncate();
          },
        );
      }
    });

    this.resizeObserver.observe(this.el);
  }

  componentWillReceiveProps(nextProps) {
    this.shouldTruncate = false;
    this.latestThatFits = null;

    this.setState(
      {
        text: this.childrenElementWithRef(nextProps.children),
      },
      () => {
        this.origText = this.state.text;
        this.lineHeight = nextProps.lineHeight || getLineHeight(this.el);
        this.shouldTruncate = true;
        this.truncate();
      },
    );
  }

  componentDidUpdate() {
    if (this.shouldTruncate === false) {
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
        /* eslint-enable */
      } else if (this.el && this.el.clientWidth !== this.clientWidth) {
        // edge case - scrollbar (dis?)appearing might mess up the container width
        // causing strings that would normally fit on X lines to suddenly take up X+1 lines
        // ugly fix - recalculate again
        this.truncateOriginalText();
      }

      return;
    }

    if (this.splitDirectionSeq.length) {
      if (this.fits()) {
        this.latestThatFits = this.state.text;
        this.clientWidth = this.el.clientWidth;
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

  truncate() {
    if (this.fits()) {
      // the whole text fits on the first try, no need to do anything else
      this.shouldTruncate = false;

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

    const ellipsis =
      typeof this.props.ellipsis === 'function'
        ? this.props.ellipsis(newRootEl)
        : typeof this.props.ellipsis === 'object'
          ? React.cloneElement(this.props.ellipsis, { key: 'ellipsis' })
          : this.props.ellipsis;

    const newChildren = newRootEl.props.children;
    const newChildrenWithEllipsis = Array.isArray(newChildren)
      ? [...newChildren, ellipsis]
      : [newChildren, ellipsis];
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
  split(node, splitDirections, isRoot = false) {
    if (!node) {
      return node;
    } else if (typeof node === 'string') {
      return this.splitString(node, splitDirections);
    } else if (Array.isArray(node)) {
      return this.splitArray(node, splitDirections);
    }

    const newChildren = this.split(node.props.children, splitDirections);

    return cloneWithChildren(node, newChildren, isRoot);
  }

  splitString(string, splitDirections = []) {
    if (!splitDirections.length) {
      return string;
    }

    if (splitDirections.length && string.length === 1) {
      if (this.wasLastCharTested) {
        // we are trying to split further but we have nowhere to go now
        // that means we've already found the max subtree that fits the container
        this.endFound = true;
      } else {
        // TODO comment
        this.wasLastCharTested = true;
      }

      return string;
    }

    const [splitDirection, ...restSplitDirections] = splitDirections;
    const pivotIndex = Math.ceil(string.length / 2);

    if (splitDirection === SPLIT.LEFT) {
      const subString = string.substring(0, pivotIndex);

      return this.splitString(subString, restSplitDirections);
    }
    const beforeString = string.substring(0, pivotIndex);
    const afterString = string.substring(pivotIndex);

    return beforeString + this.splitString(afterString, restSplitDirections);
  }

  splitArray(array, splitDirections = []) {
    if (!splitDirections.length) {
      return array;
    }

    if (array.length === 1) {
      const [item] = array;

      if (typeof item === 'string') {
        return [this.splitString(item, splitDirections)];
      }
      const { children } = item.props;

      const newChildren = this.split(children, splitDirections);

      return [cloneWithChildren(item, newChildren)];
    }

    const [splitDirection, ...restSplitDirections] = splitDirections;
    const pivotIndex = Math.ceil(array.length / 2);

    if (splitDirection === SPLIT.LEFT) {
      const subArray = array.slice(0, pivotIndex);

      return this.splitArray(subArray, restSplitDirections);
    }
    const beforeArray = array.slice(0, pivotIndex);
    const afterArray = array.slice(pivotIndex);

    return beforeArray.concat(this.splitArray(afterArray, restSplitDirections));
  }

  fits() {
    const { lines: maxLines } = this.props;
    const { height } = this.el.getBoundingClientRect();
    const computedLines = Math.round(height / parseFloat(this.lineHeight));

    if (process.env.NODE_ENV !== 'production' && computedLines <= 0) {
      /* eslint-disable no-console */
      console.warn(
        `TruncateMarkup: number of currently rendered lines: ${computedLines}, not truncating...
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
