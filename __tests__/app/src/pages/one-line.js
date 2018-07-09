import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

const TestCase = () => (
  <div>
    <TruncateMarkup>
      <div style={style}>
        <strong>User roles: </strong>
        {userRoles.join(', ')}
      </div>
    </TruncateMarkup>
  </div>
);

export default TestCase;
