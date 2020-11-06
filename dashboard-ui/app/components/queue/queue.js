import React from 'react';
import { connect } from 'react-redux';
import FirstDisplay from './firstDisplay.js';
import { fetchQueue, resetQueueState } from '../../actions';
import QueueCRUD from './queueCRUD.js';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import PropTypes from 'prop-types';

export class Queue extends React.Component {
  static propTypes = {
    appData: PropTypes.any,
    onLoad: PropTypes.any,
    resetQueueState: PropTypes.any,
    loaded: PropTypes.any,
    noQueueFound: PropTypes.any
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
    this.props.resetQueueState();
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
      compToDisplay = this.props.noQueueFound ? <FirstDisplay /> : <QueueCRUD />;
    }
    return (
      <div className='panel-body' style={{ backgroundColor: '#FFF' }}>
        { compToDisplay }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let noQueueFound = state.queue.allQueues.length === 0;
  return {
    appData: state.manageApp,
    noQueueFound: noQueueFound,
    loaded: state.queue.loaded
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoad: () => dispatch(fetchQueue()),
    resetQueueState: () => dispatch(resetQueueState())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Queue);
