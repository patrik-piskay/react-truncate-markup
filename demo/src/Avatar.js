import * as React from 'react';

export default function Avatar({ user }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '0 3px' }}>
      <img
        src={user.image}
        style={{
          borderRadius: '20px',
          height: '40px',
          width: '40px',
          marginRight: '5px',
        }}
        alt={user.name}
      />
    </div>
  );
}
