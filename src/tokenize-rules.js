const TOKENIZE_POLICY = {
  characters: {
    tokenizeString: null,
    isAtomic: (str) => str.length <= 1,
  },
  words: {
    tokenizeString: (str) => str.match(/(\s*\S[\S\xA0]*)/g),
    isAtomic: (str) => /^\s*[\S\xA0]*\s*$/.test(str),
  },
};

export default TOKENIZE_POLICY;
