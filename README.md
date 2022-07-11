# React Truncate Markup

[![Travis](https://img.shields.io/travis/patrik-piskay/react-truncate-markup.svg?style=flat-square)](https://travis-ci.org/patrik-piskay/react-truncate-markup)
[![version](https://img.shields.io/npm/v/react-truncate-markup.svg?style=flat-square)](https://www.npmjs.com/package/react-truncate-markup)
[![License](https://img.shields.io/npm/l/react-truncate-markup.svg?style=flat-square)](https://github.com/patrik-piskay/react-truncate-markup/blob/master/LICENSE.md)

React component for truncating JSX markup.

[Examples with code snippets](https://react-truncate-markup.patrik-piskay.now.sh)  
[CodeSandbox demo](https://codesandbox.io/s/4w2jrplym4)

## Why?

Few use cases for using JS truncating instead of the CSS one:

- you need to support IE, Firefox or Edge (and cannot use `webkit-line-clamp`) for multi-line truncation
- you need a custom ellipsis, potentially with more text (`show more` link, indicator of how many records were hidden by truncation, etc.)

---

Most solutions that already exist (like [react-truncate](https://github.com/One-com/react-truncate) or [React-Text-Truncate](https://github.com/ShinyChang/React-Text-Truncate)) use HTML5 `canvas` (and its `measureText` method) for measuring text width to determine whether (and where) the provided text should be truncated.

While this approach is valid, it has its limitations - it works only for **plain text**, and not for **JSX markup**. You might want to use JSX when parts of the text have different style (like `color` or `font-weight`).

## How?

Because we need to determine how to truncate provided content _after_ all the layout and styles were applied, we need to actually render it in browser (instead of rendering it off-screen in canvas).

By using a binary search approach (_splitting JSX in half and checking if the text + ellipsis fit the container, and if not, splitting it in half again, and so on_), depending on the size (and depth) of the markup, it usually takes only a few rerenders to get the final, truncated markup.

Performance was not an issue for our use cases (e.g. using `TruncateMarkup` twice per list item in a dropdown list containing dozens of items), there is no text movement visible on the screen (but YMMV).

> **_Note:_** Because this package depends on browser rendering, all elements inside `<TruncateMarkup />` need to be visible. If you need to hide or show some parts of your UI, consider conditionally rendering them instead of setting `display: none`/`display: block` style on the elements.

## Installation

```bash
npm install --save react-truncate-markup
# or
yarn add react-truncate-markup
```

> This package also depends on `react` and `prop-types`. Please make sure you have those installed as well.

Importing:

```js
// using ES6 modules
import TruncateMarkup from 'react-truncate-markup';

// using CommonJS modules
const TruncateMarkup = require('react-truncate-markup').default;
```

Or using script tags and globals:

```html
<script src="https://unpkg.com/react-truncate-markup/umd/react-truncate-markup.min.js"></script>
```

And accessing the global variable:

```js
const TruncateMarkup = ReactTruncateMarkup.default;
```

## Usage

```jsx
<div style={{ width: '200px' }}> /* or any wrapper */
  <TruncateMarkup lines={2}>
    <div>
      /* ... any markup ... */
      <span style={{ color: 'red' }}>
        <strong>{this.props.subject}:</strong>
      </span>
      {` `}
      {this.props.message}
    </div>
  </TruncateMarkup>
</div>
```

> #### :warning: Warning
>
> Only inlined [DOM elements](https://reactjs.org/docs/dom-elements.html) are supported when using this library. When trying to truncate React components (class or function), `<TruncateMarkup />` will warn about it, skip truncation and display the whole content instead. For more details, please read [this comment](https://github.com/patrik-piskay/react-truncate-markup/issues/12#issuecomment-444761758).  
>  
> Or, since version 5, you can take advantage of the [`<TruncateMarkup.Atom />` component](#truncatemarkupatom-).

## Props

### `children`

It's required that only 1 element is passed as `children`.

> Correct:

```jsx
<TruncateMarkup>
  <div>
    /* ... markup ... */
  </div>
</TruncateMarkup>
```

> Incorrect:

```jsx
<TruncateMarkup>
  /* ... markup ... */
  <div>/* ... */</div>
  <div>/* ... */</div>
</TruncateMarkup>
```

### `lines`

> default value: `1`

Maximum number of displayed lines of text.

### `ellipsis`

> default value: `...`

Appended to the truncated text.

One of type: `[string, JSX Element, function]`

- `string`: `...`
- `JSX Element`: `<span>... <button>read more</button></span>`
- `function`: `function(jsxElement) { /* ... */ }`

Ellipsis callback function receives new _(truncated)_ `<TruncateMarkup />` children as an argument so it can be used for determining what the final ellipsis should look like.

```jsx
const originalText = '/* ... */';

const wordsLeftEllipsis = (rootEl) => {
  const originalWordCount = originalText.match(/\S+/g).length;
  const newTruncatedText = rootEl.props.children;
  const currentWordCount = newTruncatedText.match(/\S+/g).length;

  return `... (+${originalWordCount - currentWordCount} words)`;
}

<TruncateMarkup ellipsis={wordsLeftEllipsis}>
  <div>
    {originalText}
  </div>
</TruncateMarkup>
```

### `lineHeight`

> default value: auto-detected

Numeric value for desired line height in pixels. Generally it will be auto-detected but it can be useful in some cases when the auto-detected value needs to be overridden.

### `onTruncate`

> function(wasTruncated: bool) | optional

A callback that gets called after truncation. It receives a bool value - `true` if the input markup was truncated, `false` when no truncation was needed.

> _Note_: To prevent infinite loops, _onTruncate_ callback gets called only after the initial run (on mount), any subsequent props/children updates will trigger a recomputation, but _onTruncate_ won't get called for these updates.
>
> If you, however, wish to have _onTruncate_ called after some update, [change the `key` prop](https://reactjs.org/docs/reconciliation.html#keys) on the `<TruncateMarkup />` component - it will make React to remount the component, instead of updating it.

### `tokenize`

> default value: `characters`

By default, any single character is considered the smallest, undividable entity, so the input markup can be truncated at any point (even midword). 
To override this behaviour, you can set the `tokenize` prop to following values:
 - `characters` - _[default]_ the input text can be truncated at any point
 - `words` - each word, separated by a whitespace character, is undividable entity. The only exception to this are words separated by the `&nbsp` character, which are still honored and can be used in case you want to keep the words together

## `<TruncateMarkup.Atom />`

Atoms serve as a way to let `<TruncateMarkup />` know that the content they contain is not splittable - it either renders in full or does not render at all.

There are two main applications of Atoms:
1. you want to control at what level the truncation happens (and splitting on the word level using `tokenize="word"` is not enough), e.g. split text by paragraphs
2. you want/need to use other components inside `<TruncateMarkup />`

On itself, `<TruncateMarkup />` will not truncate any content that contains other components (see the [warning box](#warning-warning) above). But it's still a useful feature.  

Consider this case:
We want to render a list of avatars and if we run out of space, we want to render however many avatars fit, plus a custom message "+X more users", with X being the number of users that are not rendered.

```jsx
<TruncateMarkup ellipsis={() => {/* renders "+X more users" */}}>
  <div>
    {props.users.map((user) => (
      <Avatar key={user.id} user={user} />
    ))}
  </div>
</TruncateMarkup>
```

This would not work because `<TruncateMarkup />` cannot split anything inside other components _(in this case, `<Avatar />`)_, so it bails out and doesn't even attempt to truncate. But by explicitely wrapping these components in `<TruncateMarkup.Atom />` we say we are ok with it being treated as a single piece (rendered either in full or not rendered at all), whether they contain other components or not.

```jsx
<TruncateMarkup ellipsis={() => {/* renders "+X more users" */}}>
  <div>
    {props.users.map((user) => (
      <TruncateMarkup.Atom key={user.id}>
        <Avatar user={user} />
      </TruncateMarkup.Atom>
    ))}
  </div>
</TruncateMarkup>
```

You can see this example in action in the [examples/demo app](#react-truncate-markup).

## Contributing

Read more about project setup and contributing in [CONTRIBUTING.md](https://github.com/patrik-piskay/react-truncate-markup/blob/master/CONTRIBUTING.md)

## License

Released under MIT license.

Copyright &copy; 2022-present Patrik Piskay.
