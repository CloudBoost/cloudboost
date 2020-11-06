/**
 * Created by Darkstar on 12/4/2016.
 */
import React from 'react';
import UserAccess from './userAccess';
import Keys from './keys';
import PropTypes from 'prop-types';

const OptionsModal = (props) => {
  return (
    <div>
      {
        (props.selectedTab === 'addDev') &&
        <UserAccess id={props.id}
          appId={props.appId}
          invited={props.invited}
          developers={props.developers} />
      }
      {
        (props.selectedTab === 'keys') &&
        <Keys id={props.id}
          appId={props.appId}
          clientKey={props.clientKey}
          masterKey={props.masterKey} />
      }
    </div>
  );
};

OptionsModal.propTypes = {
  selectedTab: PropTypes.any,
  appId: PropTypes.any,
  id: PropTypes.any,
  invited: PropTypes.any,
  masterKey: PropTypes.any,
  clientKey: PropTypes.any,
  developers: PropTypes.any
};

export default OptionsModal;
