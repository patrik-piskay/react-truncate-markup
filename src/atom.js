export const Atom = (props) => {
  return props.children || null;
};

export const isAtomComponent = (reactEl) => {
  return !!(reactEl && reactEl.type === Atom);
};

export const ATOM_STRING_ID = '<Atom>';
