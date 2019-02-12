import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const userRoles = 'Admin, Editor, Collaborator, User';
const userRolesPreceededByNbsps =
  '\xA0\xA0\xA0\xA0Admin, Editor, Collaborator, User';
const userRolesNbsp = '  \xA0Admin, Editor,\xA0Collaborator,&nbsp;User  ';
const userRolesAsJSX = (
  <span>&nbsp;Admin, Editor,&nbsp;Collaborator,&nbsp;User </span>
);
const arrayOfUserRoles = ['Admin,', '   ', 'Editor, Collaborator, ', 'User'];
const userRolesWithLineBreaks = userRoles.replace(/ /g, '\n');

const TestCase = () => (
  <div>
    <h3>Basic String</h3>
    <div style={style}>
      <TruncateMarkup tokenize="words">
        <div>
          <strong>User roles: </strong>
          {userRoles}
        </div>
      </TruncateMarkup>
    </div>

    <h3>String where Admin is preceeded by multiple &amp;nbsp;s</h3>
    <div style={style}>
      <TruncateMarkup tokenize="words">
        <div>
          <strong>User roles: </strong>
          {userRolesPreceededByNbsps}
        </div>
      </TruncateMarkup>
    </div>

    <h3>String with: Editor,&amp;nbsp;Collaborator</h3>
    <div style={style}>
      <TruncateMarkup tokenize="words">
        <div>
          <strong>User roles: </strong>
          {userRolesNbsp}
        </div>
      </TruncateMarkup>
    </div>

    <h3>JSX with: Editor,&amp;nbsp;Collaborator</h3>
    <div style={style}>
      <TruncateMarkup tokenize="words">
        <div>
          <strong>User roles: </strong>
          {userRolesAsJSX}
        </div>
      </TruncateMarkup>
    </div>

    <h3>Array of strings</h3>
    <div style={style}>
      <TruncateMarkup tokenize="words">
        <div>
          {[<strong key="title">User roles: </strong>].concat(arrayOfUserRoles)}
        </div>
      </TruncateMarkup>
    </div>

    <h3>String with words separated by newline characters \n</h3>
    <div style={style}>
      <TruncateMarkup tokenize="words">
        <div>
          <strong>User roles: </strong>
          {userRolesWithLineBreaks}
        </div>
      </TruncateMarkup>
    </div>
  </div>
);

export default TestCase;
