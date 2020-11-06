import React from 'react';

const ArrowIcon = props => (
  <img
    src="https://res.cloudinary.com/otse/image/upload/v1552909271/down-icon_bo19y9.svg"
    style={{
      transform: `rotate(${props.direction === 'up' ? '180deg' : '0deg'})`,
    }}
    width={props.size}
  />
);

ArrowIcon.defaultProps = {
  size: 100,
  direction: 'down'
};

export default ArrowIcon;

