import expect from 'expect';

import TOKENIZE_POLICY from '../src/tokenize-rules';

describe('TOKENIZE_POLICY', () => {
  describe('words: isAtomic', () => {
    it('checks empty string', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('');
      expect(isAtomic).toBeTruthy();
    });
    it('checks string with only spaces', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('     ');
      expect(isAtomic).toBeTruthy();
    });
    it('checks string with spaces and &nbsp;', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('\xA0 \xA0\xA0 ');
      expect(isAtomic).toBeTruthy();
    });
    it('checks word with no space', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('word');
      expect(isAtomic).toBeTruthy();
    });
    it('checks word surrounded by spaces', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('  word  ');
      expect(isAtomic).toBeTruthy();
    });
    it('checks word surrounded by &nbsp;', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('\xA0word\xA0');
      expect(isAtomic).toBeTruthy();
    });
    it('checks word surrounded by spaces and then &nbsp;', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('\xA0 word \xA0');
      expect(isAtomic).toBeTruthy();
    });
    it('checks multiple &nbsp; separated by spaces', () => {
      const isAtomic = TOKENIZE_POLICY.words.isAtomic('\xA0 \xA0 \xA0');
      expect(isAtomic).toBeTruthy();
    });
  });
  describe('words: tokenizeString', () => {
    it('checks three words', () => {
      const string = 'foo and bar';
      const expectedTokens = ['foo', ' and', ' bar'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
    it('checks three words surrounded by spaces', () => {
      const string = ' foo and bar ';
      const expectedTokens = [' foo', ' and', ' bar'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
    it('checks three words surrounded by &nbsp;', () => {
      const string = '\xA0foo and bar\xA0';
      const expectedTokens = ['\xA0foo', ' and', ' bar\xA0'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
    it('checks three words surrounded by &nbsp; and then spaces', () => {
      const string = ' \xA0foo and bar\xA0 ';
      const expectedTokens = [' \xA0foo', ' and', ' bar\xA0'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
    it('checks three words surrounded by spaces and then &nbsp; - trims trailing spaces', () => {
      const string = '\xA0 foo and bar \xA0';
      const expectedTokens = ['\xA0 foo', ' and', ' bar'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
    it('checks three words where first two have multiple spaces and &nbsp; inbetween', () => {
      const string = 'foo \xA0 \xA0 and bar';
      const expectedTokens = ['foo', ' \xA0 \xA0 and', ' bar'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
    it('checks three words where first two have &nbsp; inbetween', () => {
      const string = 'foo\xA0and bar';
      const expectedTokens = ['foo\xA0and', ' bar'];

      const actualTokens = TOKENIZE_POLICY.words.tokenizeString(string);
      const isAtomic = TOKENIZE_POLICY.words.isAtomic(string);
      expect(isAtomic).toBeFalsy();
      expect(actualTokens).toEqual(expectedTokens);
    });
  });
});
