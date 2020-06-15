export const Atom = (props) => {
  return props.children || null;
};
Atom.__rtm_atom = true;

export const isAtomComponent = (reactEl) => {
  return !!(reactEl && reactEl.type && reactEl.type.__rtm_atom === true);
};

export const ATOM_STRING_ID = '<Atom>';
