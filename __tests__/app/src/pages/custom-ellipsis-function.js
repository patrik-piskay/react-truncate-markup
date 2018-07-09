import React from 'react';
import TruncateMarkup from '../../../../src';

const style = {
  border: '1px dashed #c7c7c7',
  width: '250px',
};

const userRoles = ['Admin', 'Editor', 'Collaborator', 'User'];

class TestCase extends React.Component {
  rolesLeftEllipsis = node => {
    const displayedRoles = node.props.children[1];

    const originalRolesCount = userRoles.length;
    const displayedRolesCount = displayedRoles
      ? displayedRoles.split(', ').filter(Boolean).length
      : 0;

    return <span>... (+{originalRolesCount - displayedRolesCount} roles)</span>;
  };

  render() {
    return (
      <div>
        <TruncateMarkup lines={1} ellipsis={this.rolesLeftEllipsis}>
          <div style={style}>
            <strong>User roles: </strong>
            {userRoles.join(', ')}
          </div>
        </TruncateMarkup>
      </div>
    );
  }
}

export default TestCase;
