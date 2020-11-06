'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export const Progressbar = (props) => (
  <div className='progress_bar' onClick={() => props.onProjectClick()}>
    <p style={{ display: 'flex' }}>
      <span style={{ flex: '1' }}>
        <b style={{ fontSize: 15 }}>API</b>
      </span>
      {
        props.numMaxAPI
          ? <span style={{ flex: '2' }}> <b>{props.apiUsed}%</b> &nbsp;used of&nbsp;<b>{props.maxAPI}</b> </span>
          : <span style={{ flex: '2' }}> <b>{props.apiUsed}</b>&nbsp;calls &nbsp;made </span>
      }
    </p>
    {
      props.numMaxAPI
        ? <div className='apihead'>
          <div className={props.planExceeded ? 'api_bar plan-exceeded' : 'api_bar'}
            style={{ width: props.apiUsed + '%' }} />
        </div>
        : <div className='apihead'>
          <div className='api_bar' style={{ width: '0%' }} />
        </div>
    }
    <p style={{ display: 'flex' }}>
      <span style={{ flex: '1' }}>
        <b style={{ fontSize: 15 }}>Storage</b>
      </span>
      {
        props.numMaxStorage
          ? <span style={{ flex: '2' }}> <b>{props.storageUsed}%</b> &nbsp;used of&nbsp; <b>{props.maxStorage} </b></span>
          : <span style={{ flex: '2' }}> <b>{props.storageUsed || 0} MB</b> &nbsp;used</span>
      }
    </p>
    {
      props.numMaxStorage
        ? <div className='storagehead'>
          <div className={props.planExceeded ? 'storage_bar plan-exceeded' : 'storage_bar'}
            style={{ width: props.storageUsed + '%' }} />
        </div>
        : <div className='storagehead'>
          <div className='storage_bar' style={{ width: '0%' }} />
        </div>
    }
  </div>
);

Progressbar.propTypes = {
  onProjectClick: PropTypes.func,
  planExceeded: PropTypes.any,
  numMaxAPI: PropTypes.any,
  apiUsed: PropTypes.any,
  maxAPI: PropTypes.any,
  numMaxStorage: PropTypes.any,
  storageUsed: PropTypes.any,
  maxStorage: PropTypes.any
};

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps, null)(Progressbar);
