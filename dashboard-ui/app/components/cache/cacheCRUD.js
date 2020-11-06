/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  addItemToCache,
  deleteItemFromCache,
  deleteCache,
  clearCache
} from '../../actions';
import { FormControl, FormGroup, InputGroup } from 'react-bootstrap';
import CreateCache from './createCache';
import ReactTooltip from 'react-tooltip';
import DeleteCache from './deleteCache';

const formStyle = {
  border: 'none',
  background: '#FFF',
  fontFamily: "'FontAwesome',sans-serif"
};

export class CacheCRUD extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      searchCache: '',
      itemListByCacheId: {},
      itemNewByIndex: {}
    };
  }

  static propTypes = {
    deleteCache: PropTypes.func,
    clearCache: PropTypes.func,
    addItemToCache: PropTypes.func,
    deleteItemFromCache: PropTypes.func,
    allCache: PropTypes.array,
    loading: PropTypes.bool
  }

  showDeleteModal = (cache) => (e) => {
    e.stopPropagation();
    this.setState({ selectedCache: cache, showDeleteModal: true });
  };

  closeDeleteModal = () => this.setState({ showDeleteModal: false });

  deleteCache = (cache) => () => {
    this.props.deleteCache(cache);
    this.setState({ showDeleteModal: false });
  }

  clearCache = (cache) => (e) => {
    e.stopPropagation();
    this.props.clearCache(cache);
  }

  changeHandlerSearch = (e) => this.setState({ searchCache: e.target.value });

  addItem = (cache, i) => () => {
    if (this.state.itemNewByIndex[i].key.length > 0 && this.state.itemNewByIndex[i].value.length) {
      this.props.addItemToCache(cache, this.state.itemNewByIndex[i].key, this.state.itemNewByIndex[i].value);
      this.state.itemNewByIndex[i] = { key: '', value: '' };
      this.setState(this.state.itemNewByIndex);
    }
  }

  deleteItemFromCache = (cache, key) => () => this.props.deleteItemFromCache(cache, key);

  changeHandler = (which, i) => (e) => {
    this.state.itemNewByIndex[i][which] = e.target.value;
    this.setState({ itemNewByIndex: this.state.itemNewByIndex });
  };

  handleKeyChange = (x, i) => (e) => {
    if (e.keyCode === 13 && this.state.itemNewByIndex[i].key.length > 0 && this.state.itemNewByIndex[i].value.length > 0) { this.addItem(x); }
  }

  componentWillMount () {
    let promises = this.props.allCache.map((x, i) => {
      return new Promise((resolve, reject) => {
        x.getAll({
          success: function (items) {
            if (items) {
              resolve({ [i]: [].concat(items) });
            } else { resolve({ [i]: [] }); }
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
        let itemListByCacheId = {};
        let itemNewByIndex = {};
        allObjs.forEach((itemObj, i) => {
          itemListByCacheId = { ...itemListByCacheId, ...itemObj };
          itemNewByIndex[i] = { key: '', value: '' };
        });
        this.setState({ itemListByCacheId: itemListByCacheId, itemNewByIndex: itemNewByIndex });
      });
  };

  componentWillReceiveProps (nextProps) {
    let promises = nextProps.allCache.map((x, i) => {
      return new Promise((resolve, reject) => {
        x.getAll({
          success: function (items) {
            if (items) { resolve({ [i]: [].concat(items) }); } else { resolve({ [i]: [] }); }
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
        let itemListByCacheId = {};
        let itemNewByIndex = {};
        allObjs.forEach((itemObj, i) => {
          itemListByCacheId = { ...itemListByCacheId, ...itemObj };
          itemNewByIndex[i] = { key: '', value: '' };
        });
        this.setState({ itemListByCacheId: itemListByCacheId, itemNewByIndex: itemNewByIndex });
      });
  };

  render () {
    let caches = this.props.allCache
      .filter(x => {
        if (this.state.searchCache === '') {
          return true;
        } else {
          let string = x.name.toLowerCase();
          return string.includes(this.state.searchCache.toLowerCase());
        }
      })
      .map((x, i) => {
        return (
          <div key={i} className='small-form-row' style={{ marginBottom: 0 }}>
            <div className='control-label' style={{ paddingTop: 15 }}>
              <label className='danger'> {x.name.toUpperCase()}</label>
              <div style={{ display: 'inline-block' }} className='pull-right'>
                                  &nbsp;&nbsp;&nbsp;&nbsp;
                <span className='icon-align cp' onClick={this.showDeleteModal(x)}>
                  <i className='fa fa-trash-o icon' aria-hidden='true' />
                </span>
                                  &nbsp;&nbsp;&nbsp;&nbsp;
                <span className='icon-align cp'
                  onClick={this.clearCache(x)}>
                  <i className='fa fa-eraser icon' aria-hidden='true' />
                </span>
                                  &nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            </div>

            <div className='control'>
              <div>
                <table className='table table-ionic table-action table-social'
                  style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr className='single-row'>
                      <td colSpan={5} style={{ fontSize: 12, width: '35%', borderBottom: 0 }}>
                                              KEY
                      </td>
                      <td colSpan={5} style={{ fontSize: 12, width: '35%', borderBottom: 0 }}>
                                              VALUE
                      </td>
                      <td colSpan={2} className='row-actions'
                        style={{ paddingTop: 9, paddingBottom: 9, width: '30%', borderBottom: 0 }}>
                        <li>
                          <span><i className='fa fa-database icon' /></span>
                          {x.size || '00.00 KB'}
                        </li>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className='control'>
              <div>
                <table className='table table-ionic table-action table-social'
                  style={{ marginBottom: 0 }}>
                  <tbody>
                    <tr className='single-row'>
                      <td colSpan={5}
                        style={{
                          fontSize: 12,
                          paddingTop: 6,
                          paddingBottom: 6,
                          width: '35%',
                          borderBottom: 0
                        }}>
                        <input type='text'
                          className='form form-control'
                          placeholder='Key'
                          onKeyUp={this.handleKeyChange(x, i)}
                          onChange={this.changeHandler('key', i)}
                          value={this.state.itemNewByIndex[i] ? this.state.itemNewByIndex[i].key : ''}
                        />
                      </td>
                      <td colSpan={5}
                        style={{
                          fontSize: 12,
                          paddingTop: 6,
                          paddingBottom: 6,
                          width: '35%',
                          borderBottom: 0
                        }}>
                        <input type='text'
                          className='form form-control'
                          placeholder='Value'
                          onKeyUp={this.handleKeyChange(x, i)}
                          onChange={this.changeHandler('value', i)}
                          value={this.state.itemNewByIndex[i] ? this.state.itemNewByIndex[i].value : ''}
                        />
                      </td>
                      <td colSpan={2}
                        className='row-actions'
                        style={{ paddingTop: 9, paddingBottom: 9, width: '30%', borderBottom: 0 }}>
                        <li>
                          <span className='icon-align' onClick={this.addItem(x, i)}>
                            <i className='fa fa-plus icon' />
                          </span>
                        </li>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {
              x.items && x.items.length > 0 && x.items.map((y, j) => {
                return (
                  <div key={j} className='control'>
                    <div>
                      <table className='table table-ionic table-action table-social'
                        style={{ marginBottom: 0 }}>
                        <tbody>
                          <tr className='single-row'>
                            <td colSpan={5} style={{ fontSize: 12, width: '35%', borderBottom: 0 }}>
                              {y.key}
                            </td>

                            <td colSpan={5} style={{ fontSize: 12, width: '35%', borderBottom: 0 }}>
                              {JSON.stringify(y.value)}
                            </td>

                            <td colSpan={2}
                              className='row-actions'
                              style={{
                                paddingTop: 9,
                                paddingBottom: 9,
                                width: '30%',
                                borderBottom: 0
                              }}>
                              <li>
                                <span className='icon-align'>
                                  <i className='fa fa-trash-o icon'
                                    onClick={this.deleteItemFromCache(x, y.key)} />
                                </span>
                              </li>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            }

            <ReactTooltip place='bottom' type='dark' delayShow={100} />

            <DeleteCache show={this.state.showDeleteModal}
              close={this.closeDeleteModal}
              loading={this.props.loading}
              deleteCache={this.deleteCache(x)}
              selectedCache={x} />
          </div>
        );
      });

    return (
      <div>
        <h2 className='head'>Cache</h2>
        <div className='tables cache queue'>
          <div className='queue-head' style={{ width: '100%' }}>
            <FormGroup className='col-md-4 col-sm-4 col-xs-4' style={{ paddingLeft: 0 }}>
              <InputGroup className='search'>
                <FormControl type='text'
                  style={formStyle}
                  placeholder='&#xF002;&nbsp;&nbsp;Search Cache'
                  value={this.state.searchCache}
                  onChange={this.changeHandlerSearch}
                />
              </InputGroup>
            </FormGroup>
            <CreateCache className='col-md-8 col-sm-8 col-xs-8' style={{ paddingRight: 0 }}>
              <div className='btn pull-right' onClick={this.open}>+ Create Cache</div>
            </CreateCache>
          </div>
        </div>

        {caches}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    name: state.manageApp.name,
    allCache: state.cache.allCaches || [],
    loading: state.loader.loading
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addItemToCache: (cache, item, value) => dispatch(addItemToCache(cache, item, value)),
    deleteItemFromCache: (cache, item) => dispatch(deleteItemFromCache(cache, item)),
    deleteCache: (cache) => dispatch(deleteCache(cache)),
    clearCache: (cache) => dispatch(clearCache(cache))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CacheCRUD);
