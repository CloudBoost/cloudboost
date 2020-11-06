/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FirstDisplay from './firstDisplay.js';
import CacheCRUD from './cacheCRUD.js';
import { fetchCache, resetCacheState } from '../../actions';
import RefreshIndicator from 'material-ui/RefreshIndicator';

export class Cache extends React.Component {
  static propTypes = {
    appData: PropTypes.shape({
      viewActive: PropTypes.bool
    }),
    onLoad: PropTypes.func,
    resetCacheState: PropTypes.func,
    loaded: PropTypes.bool,
    noCacheFound: PropTypes.bool
  }

  constructor (props) {
    super(props);
    this.state = {};
  }

  static get contextTypes () {
    return {
      router: React.PropTypes.object.isRequired
    };
  }

  componentWillMount () {
    // redirect if active app not found
    if (!this.props.appData.viewActive) {
      this.context.router.push(window.DASHBOARD_BASE_URL);
    } else {
      this.props.onLoad();
    }
  }

  componentWillUnmount () {
    this.props.resetCacheState();
  }

  render () {
    let compToDisplay = <RefreshIndicator
      size={40}
      left={-33}
      top={106}
      status='loading'
      style={{ marginLeft: '50%', position: 'relative' }}
    />;
    if (this.props.loaded) {
      compToDisplay = this.props.noCacheFound ? <FirstDisplay /> : <CacheCRUD />;
    }
    return (
      <div className='panel-body' style={{ backgroundColor: '#FFF' }}>
        { compToDisplay }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let noCacheFound = state.cache.allCaches.length === 0;
  return {
    appData: state.manageApp,
    allCache: state.cache.allCaches,
    noCacheFound: noCacheFound,
    loaded: state.cache.loaded
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: () => dispatch(fetchCache()),
    resetCacheState: () => dispatch(resetCacheState())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Cache);
