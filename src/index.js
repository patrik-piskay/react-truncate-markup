import React from 'react';
import PropTypes from 'prop-types';
import getLineHeight from 'line-height';
import ResizeObserver from 'resize-observer-polyfill';

const SPLIT = {
  LEFT: true,
  RIGHT: false,
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
    text: this._childrenElementWithRef(this.props.children),
  };

  componentDidMount() {
    this._origText = this.state.text;
    this._splitDirectionSeq = [];
    this._shouldTruncate = true;

    // get the computed line-height of the parent element
    // it'll be used for determining whether the text fits the container or not
    this._lineHeight = this.props.lineHeight || getLineHeight(this.el);

    this._truncate();

    /* Wrapper element resize handing */
    let initialRender = true;

    this.resizeObserver = new ResizeObserver(() => {
      if (initialRender) {
        // ResizeObserer cb is called on initial render too so we are skipping here
        initialRender = false;
      } else {
        // wrapper element has been resized, recalculating with the original text
        this.setState(
          {
            text: this._origText,
          },
          () => {
            this._shouldTruncate = true;
            this._truncate();
          },
        );
      }
    });

    this.resizeObserver.observe(this.el);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        text: this._childrenElementWithRef(nextProps.children),
      },
      () => {
        this._origText = this.state.text;
        this._lineHeight = nextProps.lineHeight || getLineHeight(this.el);
        this._shouldTruncate = true;
        this._truncate();
      },
    );
  }

  componentDidUpdate() {
    if (this._shouldTruncate === false) {
      return;
    }

    if (this._endFound) {
      // we've found the end where we cannot split the text further
      // that means we've already found the max subtree that fits the container
      // so we are rendering that
      if (this.state.text !== this._latestThatFits) {
        /* eslint-disable react/no-did-update-set-state */
        this.setState({
          text: this._latestThatFits,
        });
        /* eslint-enable */
      } else if (this.el && this.el.clientWidth !== this._clientWidth) {
        // edge case - scrollbar (dis?)appearing might mess up the container width
        // causing strings that would normally fit on X lines to suddenly take up X+1 lines
        // ugly fix - recalculate again
        this._truncateOriginalText();
      }

      return;
    }

    if (this._splitDirectionSeq.length) {
      if (this._fits()) {
        this._latestThatFits = this.state.text;
        this._clientWidth = this.el.clientWidth;
        // we've found a subtree that fits the container
        // but we need to check if we didn't cut too much of it off
        // so we are changing the last splitting decision from splitting and going left
        // to splitting and going right
        this._splitDirectionSeq.splice(
          this._splitDirectionSeq.length - 1,
          1,
          SPLIT.RIGHT,
          SPLIT.LEFT,
        );
      } else {
        this._splitDirectionSeq.push(SPLIT.LEFT);
      }

      this._tryToFit(this._origText, this._splitDirectionSeq);
    }
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();

    this._lineHeight = null;
    this._origText = null;
    this._latestThatFits = null;
    this._splitDirectionSeq = [];
  }

  _truncate() {
    if (this._fits()) {
      // the whole text fits on the first try, no need to do anything else
      this._shouldTruncate = false;

      return;
    }

    this._latestThatFits = null;

    this._truncateOriginalText();
  }

  _childrenElementWithRef(children) {
    const child = React.Children.only(children);

    return React.cloneElement(child, { ref: el => (this.el = el) });
  }

  _truncateOriginalText() {
    this._endFound = false;
    this._splitDirectionSeq = [SPLIT.LEFT];

    this._tryToFit(this._origText, this._splitDirectionSeq);
  }

  /**
   * Splits rootEl based on instructions and updates React's state with the returned element
   * After React rerenders the new text, we'll check if the new text fits in componentDidUpdate
   * @param  {ReactElement} rootEl - the original children element
   * @param  {Array} splitDirections - list of SPLIT.RIGHT/LEFT instructions
   */
  _tryToFit(rootEl, splitDirections) {
    if (!rootEl.props.children) {
      // no markup in container
      return;
    }

    const newRootEl = this._split(rootEl, splitDirections, /* isRootEl */ true);

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

    this.setState({
      text: {
        ...newRootEl,
        props: {
          ...newRootEl.props,
          children: newChildrenWithEllipsis,
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
  _split(node, splitDirections, isRoot = false) {
    if (!node) {
      return node;
    } else if (typeof node === 'string') {
      return this._splitString(node, splitDirections);
    } else if (Array.isArray(node)) {
      return this._splitArray(node, splitDirections);
    }

    const newChildren = this._split(node.props.children, splitDirections);

    return cloneWithChildren(node, newChildren, isRoot);
  }

  _splitString(string, splitDirections = []) {
    if (!splitDirections.length) {
      return string;
    }

    if (splitDirections.length && string.length === 1) {
      // we are trying to split further but we have nowhere to go now
      // that means we've already found the max subtree that fits the container
      this._endFound = true;

      return string;
    }

    const [splitDirection, ...restSplitDirections] = splitDirections;
    const pivotIndex = Math.ceil(string.length / 2);

    if (splitDirection === SPLIT.LEFT) {
      const subString = string.substring(0, pivotIndex);

      return this._splitString(subString, restSplitDirections);
    }
    const beforeString = string.substring(0, pivotIndex);
    const afterString = string.substring(pivotIndex);

    return beforeString + this._splitString(afterString, restSplitDirections);
  }

  _splitArray(array, splitDirections = []) {
    if (!splitDirections.length) {
      return array;
    }

    if (array.length === 1) {
      const [item] = array;

      if (typeof item === 'string') {
        return [this._splitString(item, splitDirections)];
      }
      const { children } = item.props;

      const newChildren = this._split(children, splitDirections);

      return [cloneWithChildren(item, newChildren)];
    }

    const [splitDirection, ...restSplitDirections] = splitDirections;
    const pivotIndex = Math.ceil(array.length / 2);

    if (splitDirection === SPLIT.LEFT) {
      const subArray = array.slice(0, pivotIndex);

      return this._splitArray(subArray, restSplitDirections);
    }
    const beforeArray = array.slice(0, pivotIndex);
    const afterArray = array.slice(pivotIndex);

    return beforeArray.concat(
      this._splitArray(afterArray, restSplitDirections),
    );
  }

  _fits() {
    const { lines: maxLines } = this.props;
    const { height } = this.el.getBoundingClientRect();
    const computedLines = Math.round(height / parseFloat(this._lineHeight));

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
