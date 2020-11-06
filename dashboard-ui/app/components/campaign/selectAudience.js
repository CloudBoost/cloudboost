import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import {} from '../../actions';
import FilterIcon from 'material-ui/svg-icons/content/filter-list';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Chip from 'material-ui/Chip';

export class SelectAudience extends React.Component {
  static propTypes = {
    open: PropTypes.any,
    buildQuery: PropTypes.any
  }
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      value: '',
      os: ['ios', 'android', 'edge', 'chrome', 'firefox', 'windows'],
      channels: [],
      osPop: false,
      channelPop: false,
      channelInput: ''
    };

    if (this.props.open) { this.setState({ showModal: true }); }
  }

    close = () => this.setState({ showModal: false, value: '' });

    open = () => this.setState({ showModal: true });

    handleTouchTap = (which) => (event) => {
      event.preventDefault();
      this.state[which] = true;
      this.state['anchorEl'] = event.currentTarget;
      this.setState(this.state);
    };

    handleRequestClose = (which) => () => {
      this.state[which] = false;
      this.setState(this.state);
    };

    changeHandler = (which) => (e) => {
      this.state[which] = e.target.value;
      this.setState(this.state);
    }

    addReomoveOS = (which) => (e) => {
      if (which === 'all') {
        if (e.target.checked) {
          this.state.os = ['ios', 'android', 'edge', 'chrome', 'firefox', 'windows'];
        } else {
          this.state.os = [];
        }
      } else {
        if (e.target.checked) {
          this.state.os.push(which);
        } else {
          this.state.os = this.state.os.filter(x => x !== which);
        }
      }
      this.setState(this.state);
    }

    addChannel = () => {
      if (this.state.channelInput) {
        this.state.channels.push(this.state.channelInput);
        this.setState(this.state);
        this.setState({ channelInput: '' });
      }
    }

    removeChannel = (which) => () => {
      this.state.channels = this.state.channels.filter(x => x !== which);
      this.setState(this.state);
    }

    buildAudienceQuery = () => {
      let finalQuery = new CB.CloudQuery('Device');
      if (this.state.os.length > 0 && this.state.os.length < 6) {
        finalQuery.equalTo('deviceOS', this.state.os[0]);
        let osQueries = [];
        this.state.os.map((x, i) => {
          let query = new CB.CloudQuery('Device');
          query.equalTo('deviceOS', x);
          osQueries.push(query);
        });
        if (osQueries.length > 0) finalQuery = CB.CloudQuery.or(osQueries, finalQuery);
      }
      if (this.state.channels.length > 0) {
        finalQuery.containedIn('channels', this.state.channels);
      }

      this.props.buildQuery(finalQuery, this.state.os, this.state.channels);
      this.close();
    };

    render () {
      return (
        <ul>
          <li className='setup' onClick={this.open}>
                    Modify Audience
          </li>

          <Modal show={this.state.showModal} onHide={this.close}
            dialogClassName='custom-modal select-audience-modal'>
            <Modal.Header>
              <span className='modal-title-style'>Select Audience</span>
              <i className='fa fa-filter modal-icon-style pull-right' />
              <div className='modal-title-inner-text'>
                            Target notifications to a specific audience
              </div>
            </Modal.Header>
            <Modal.Body>
              <div style={{ height: '150px' }} className='audcontdivs'>
                <div style={{ width: '30%', height: 150, 'backgroundColor': '#f6f7f8', float: 'left' }}
                  className='flex-general-column-wrapper-center'>
                  <span style={{ color: '#353446', fontSize: 17, fontWeight: 500 }}>Channels</span>
                </div>
                <div className='secondcontentdivselaud' style={{ height: 150 }}>

                  <input className='inptchannel'
                    type='text'
                    value={this.state.channelInput}
                    onChange={this.changeHandler('channelInput')} />

                  <button className='inptchannelbtn'
                    onClick={this.addChannel}>
                                    Add Channel
                  </button>
                  {
                    this.state.channels.map((x, i) => (
                      <Chip style={{ backgroundColor: 'rgb(235, 236, 237)' }}
                        className='oschip'
                        key={i}
                        onRequestDelete={this.removeChannel(x)}>
                        { x }
                      </Chip>
                    ))
                  }
                </div>
              </div>
              <div className='audcontdivs'>
                <div style={{ width: '30%', height: 100, 'backgroundColor': '#f6f7f8', float: 'left' }}
                  className='flex-general-column-wrapper-center os-div'>
                  <span style={{ color: '#353446', fontSize: 17, fontWeight: 500 }}>OS</span>
                </div>
                <div className='secondcontentdivselaud os-div'>
                  <IconButton tooltip='Edit OS' className='filtericonmodalaud'
                    onTouchTap={this.handleTouchTap('osPop')}>
                    <FilterIcon />
                  </IconButton>
                  <Popover
                    open={this.state.osPop}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    onRequestClose={this.handleRequestClose('osPop')}
                    className='osPop'
                    style={{ padding: '10px 0', overflowY: 'hidden', overflowX: 'hidden' }}
                  >
                    <div className='filterrowplane'>
                      <span className='tailnamefilter'>
                                            All Devices
                        <input type='checkbox'
                          checked={this.state.os.length === 6}
                          onChange={this.addReomoveOS('all')}
                          className='checkcardfilter pull-right' />
                      </span>
                      <span className='tailnamefilter'>
                                            IOS
                        <input type='checkbox'
                          checked={this.state.os.indexOf('ios') !== -1}
                          onChange={this.addReomoveOS('ios')}
                          className='checkcardfilter pull-right' />
                      </span>
                      <span className='tailnamefilter'>
                                            Android
                        <input type='checkbox'
                          checked={this.state.os.indexOf('android') !== -1}
                          onChange={this.addReomoveOS('android')}
                          className='checkcardfilter pull-right' />
                      </span>
                      <span className='tailnamefilter'>
                                            Chrome
                        <input type='checkbox'
                          checked={this.state.os.indexOf('chrome') !== -1}
                          onChange={this.addReomoveOS('chrome')}
                          className='checkcardfilter pull-right' />
                      </span>
                      <span className='tailnamefilter'>
                                            Windows
                        <input type='checkbox'
                          checked={this.state.os.indexOf('windows') !== -1}
                          onChange={this.addReomoveOS('windows')}
                          className='checkcardfilter pull-right' />
                      </span>
                      <span className='tailnamefilter'>
                                            Firefox
                        <input type='checkbox'
                          checked={this.state.os.indexOf('firefox') !== -1}
                          onChange={this.addReomoveOS('firefox')}
                          className='checkcardfilter pull-right' />
                      </span>
                      <span className='tailnamefilter'>
                                            Edge
                        <input type='checkbox'
                          checked={this.state.os.indexOf('edge') !== -1}
                          onChange={this.addReomoveOS('edge')}
                          className='checkcardfilter pull-right' />
                      </span>
                    </div>
                  </Popover>
                  <div className='oschipdiv'>
                    {
                      this.state.os.map((x, i) => (
                        <Chip style={{ backgroundColor: 'rgb(235, 236, 237)' }}
                          className='oschip'
                          key={i}>
                          { x }
                        </Chip>
                      ))
                    }
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.close}>Cancel</Button>
              <Button bsStyle='primary' onClick={this.buildAudienceQuery}>Select Audience</Button>
            </Modal.Footer>
          </Modal>
        </ul>
      );
    }
}

export default SelectAudience;
