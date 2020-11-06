/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { deleteQueue, deleteItemFromQueue, selectQueue } from '../../actions';
import { FormControl, FormGroup, InputGroup } from 'react-bootstrap';
import CreateQueue from './createQueue';
import MessageModal from './addMessageModal';
import EditMessage from './editMessageModal';
import DeleteQueue from './deleteQueue';
import ACL from './ACL';

const formStyle = {
  border: 'none',
  background: '#FFF',
  fontFamily: "'FontAwesome',sans-serif"
};

export class QueueCRUD extends React.Component {
  static propTypes = {
    deleteQueue: PropTypes.any,
    allQueues: PropTypes.any,
    deleteItemFromQueue: PropTypes.any,
    loading: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      key: '',
      value: '',
      searchQueue: '',
      showEditMessageModal: false,
      showACLModal: false,
      selectedMessage: null,
      selectedQueue: null,
      showDeleteModal: false,
      messageListByQueueId: {}
    };
  }

  showDeleteModal = (queue) => (e) => {
    e.stopPropagation();
    this.setState({ selectedQueue: queue, showDeleteModal: true });
  }

    closeDeleteModal = () => this.setState({ showDeleteModal: false });

    deleteQueue = (queue) => {
      this.props.deleteQueue(queue);
      this.setState({ showDeleteModal: false });
    }

    showACLModal = (queue) => (e) => {
      e.stopPropagation();
      this.setState({ showACLModal: true, selectedQueue: queue });
    }

    closeACLModal = () => this.setState({ showACLModal: false });

    changeHandlerSearch = (e) => this.setState({ searchQueue: e.target.value });

    closeEditMessageModal = () => this.setState({ showEditMessageModal: false, selectedMessage: null });

    updateMessage = (message) => () => this.setState({ showEditMessageModal: true, selectedMessage: message });

    dateFormat (date) {
      if (date) {
        return new Date(date).toISOString().slice(0, 10).replace(/-/g, '/') +
                ', ' + new Date(date).getHours() + ':' + new Date(date).getMinutes();
      }
    }

    componentWillMount () {
      let promises = this.props.allQueues.map((x, i) => {
        return new Promise((resolve, reject) => {
          x.getAllMessages({
            success: function (list) {
              if (list) { resolve({ [x.id]: [].concat(list) }); } else { resolve({ [x.id]: [] }); }
            },
            error: function (error) {
              console.log('Queue select error ', error);
              reject(error);
            }
          });
        });
      });

      Promise.all(promises)
        .then(allObjs => {
          let messageListByQueueId = {};
          allObjs.forEach(messageObj => {
            messageListByQueueId = { ...messageListByQueueId, ...messageObj };
          });
          this.setState({ messageListByQueueId: messageListByQueueId });
        });
    };

    componentWillReceiveProps (nextProps) {
      let promises = nextProps.allQueues.map((x, i) => {
        return new Promise((resolve, reject) => {
          x.getAllMessages({
            success: function (list) {
              if (list) { resolve({ [x.id]: [].concat(list) }); } else { resolve({ [x.id]: [] }); }
            },
            error: function (error) {
              console.log('Queue select error ', error);
              reject(error);
            }
          });
        });
      });

      Promise.all(promises)
        .then(allObjs => {
          let messageListByQueueId = {};
          allObjs.forEach(messageObj => {
            messageListByQueueId = { ...messageListByQueueId, ...messageObj };
          });
          this.setState({ messageListByQueueId: messageListByQueueId });
        })
        .catch(error => {
          console.log(error);
        });
    }

    render () {
      let queues = this.props.allQueues
        .filter((x) => {
          if (this.state.searchQueue === '') {
            return true;
          } else {
            let string = x.name.toLowerCase();
            return string.includes(this.state.searchQueue.toLowerCase());
          }
        })
        .map((x, i) => {
          return <div key={i} className='small-form-row'>
            <div className='control-label' style={{ paddingTop: 15 }}>
              <label className='danger'>
                {x.name.toUpperCase()}
              </label>
              <div style={{ display: 'inline-block' }} className='pull-right'>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                <span className='icon-align cp' onClick={this.showDeleteModal(x)}>
                  <i className='fa fa-trash-o icon' aria-hidden='true' />
                </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                <span className='icon-align cp' onClick={this.showACLModal(x)}>
                  <i className='fa fa-lock icon' aria-hidden='true' />
                </span>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                <MessageModal selectedQueue={x} />
              </div>
            </div>
            {
              this.state.messageListByQueueId[x.id] &&
                this.state.messageListByQueueId[x.id].length > 0
                ? this.state.messageListByQueueId[x.id]
                  .map((y, i) => {
                    return <div className='control' key={i}>
                      <div>
                        <table className='table table-ionic table-action table-social'
                          style={{ marginBottom: 0 }}>
                          <tbody>
                            <tr className='single-row'>
                              <td colSpan={2} style={{ fontSize: 12 }}>
                                                                    TIMEOUT: {y.timeout}
                              </td>
                              <td colSpan={2} style={{ fontSize: 12 }}>
                                                                    DELAY: {y.delay}
                              </td>
                              <td colSpan={2} style={{ fontSize: 12 }}>
                                                                    EXPIRES:{y.expires ? this.dateFormat(y.expires) : 'NOT SET'}
                              </td>
                              <td colSpan={2} className='row-actions' style={{ paddingTop: 9, paddingBottom: 9 }}>
                                <li>
                                  <span
                                    onClick={this.props.deleteItemFromQueue.bind(this, x, y.id)} // eslint-disable-line
                                    className='icon-align'>
                                    <i className='fa fa-trash-o icon' />
                                  </span>
                                </li>
                                <li>
                                  <span onClick={this.updateMessage(y)}
                                    className='icon-align'>
                                    <i className='fa fa-pencil  icon' />
                                  </span>
                                </li>
                              </td>
                            </tr>
                            <tr className='config-row'>
                              <td colSpan={12} className='' style={{ padding: 0, borderBottom: 0 }}>
                                <div className='config-container' style={{ padding: 20 }}>
                                  <div className='small-form-row' style={{
                                    marginBottom: 0,
                                    height: 58,
                                    minHeight: 58
                                  }}>

                                    <div className='control-label' style={{
                                      minWidth: 300,
                                      height: 58,
                                      overflow: 'hidden',
                                      position: 'relative'
                                    }}>
                                      <label className='danger'>
                                                                                    Message
                                      </label>
                                      <br />
                                      <div className='label-desc' style={{
                                        marginBottom: 0,
                                        overflowY: 'scroll',
                                        position: 'absolute',
                                        top: 22,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        overflow: 'auto'
                                      }}>
                                        {y.message}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        {
                          this.state.showEditMessageModal &&
                            <EditMessage closeEditMessageModal={this.closeEditMessageModal}
                              showEditMessageModal={this.state.showEditMessageModal}
                              selectedQueue={x}
                              messageData={y} />
                        }
                      </div>
                    </div>;
                  })
                : <div className='control'>
                  <div>
                    <table className='table table-ionic table-action table-social' style={{ marginBottom: 0 }}>
                      <tbody>
                        <tr className='single-row'>
                          <td colSpan={12}>
                                                            Please add message to Queue
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
            }
            <DeleteQueue show={this.state.showDeleteModal}
              close={this.closeDeleteModal}
              loading={this.props.loading}
              deleteQueue={this.deleteQueue}
              selectedQueue={x} />
            {
              this.state.showACLModal && <ACL closeACLModal={this.closeACLModal}
                showACLModal={this.state.showACLModal}
                selectedQueue={this.state.selectedQueue} />
            }
          </div>;
        });

      return (
        <div>
          <h2 className='head'>Queues</h2>
          <div className='tables cache queue'>
            <div className='queue-head' style={{ width: '100%' }}>
              <FormGroup className='col-md-4 col-sm-4 col-xs-4' style={{ paddingLeft: 0 }}>
                <InputGroup className='search'>
                  <FormControl type='text'
                    style={formStyle}
                    placeholder='&#xF002;&nbsp;&nbsp;Search Queue'
                    value={this.state.searchQueue}
                    onChange={this.changeHandlerSearch}
                  />
                </InputGroup>
              </FormGroup>
              <CreateQueue className='col-md-8 col-sm-8 col-xs-8' style={{ paddingRight: 0 }}>
                <div className='btn pull-right' onClick={this.open}>+ Create Queue</div>
              </CreateQueue>
            </div>
          </div>
          {queues}
        </div>
      );
    }
}

const mapStateToProps = (state) => {
  return {
    name: state.manageApp.name,
    allQueues: state.queue.allQueues || [],
    loading: state.loader.loading
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    selectQueue: (queue) => dispatch(selectQueue(queue)),
    deleteQueue: (queue) => dispatch(deleteQueue(queue)),
    deleteItemFromQueue: (queue, itemId) => dispatch(deleteItemFromQueue(queue, itemId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(QueueCRUD);
