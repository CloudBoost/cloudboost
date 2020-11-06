/**
 * Created by Darkstar on 11/29/2016.
 */
import React from 'react';
import CreateQueue from './createQueue';

class FirstDisplay extends React.Component {
  render () {
    return (
      <div className='tables cache queue'>
        <div className='row'>
          <div className='col-sm-12 col-md-12 col-lg-12 container-cache'>
            <div className='flex-general-column-wrapper-center first-visitto-cache' style={{}}>
              <div style={{ width: '600px', height: 340, border: '1px solid #C0D0DB', borderRadius: 2, backgroundColor: 'white', padding: 20 }}>
                <div className='cf' style={{ height: '25%', width: '100%' }}>
                  <div className='pull-left' style={{ width: '60%', height: '100%' }}>
                    <div style={{ width: '100%', height: '100%' }} className='flex-general-row-wrapper'>
                      <div style={{ width: '23%', height: '100%' }} className='flex-general-column-wrapper-center'>
                        <div className='flex-general-column-wrapper-center' style={{ width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#52d9a2' }}>
                          <i className='fa fa-exchange' style={{ color: 'white', fontSize: 30 }} />
                        </div>
                      </div>
                      <div style={{ width: '59%', height: '100%', marginLeft: 8 }} className='solo-vertical-center'>
                        <div className style={{ paddingLeft: 5 }}>
                          <div>
                            <span style={{ fontSize: 18, fontWeight: 600 }}>CloudBoost Queue</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 14 }}>Connect micro services with queue.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='pull-right' style={{ width: '28%', height: '100%' }}>
                    <div style={{ width: '100%', height: '100%' }} className='flex-general-row-wrapper'>
                      <div style={{ width: '100%', height: '54%', marginTop: 2 }}>
                        <CreateQueue>
                          <button style={{ width: '100%', height: '40px', backgroundColor: '#1280E0', color: 'white', fontSize: 14, borderRadius: 4, border: 'none' }} className='default-inputfield'>Create Queue</button>
                        </CreateQueue>
                      </div>
                      <div style={{ width: '100%' }} className='solo-horizontal-center'>
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ height: '68%', width: '100%', marginTop: 20 }} className='flex-general-row-wrapper'>
                  <div style={{ width: '60%', height: '100%', padding: 20, backgroundColor: '#F7FAFC' }}>
                    <div style={{ width: '100%', height: '80%' }} className>
                      <span style={{ fontSize: 18, fontWeight: 500 }}>
                              Queue helps you to glue different pieces and services of your app and make them work together. Create your first queue today.
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '10%', marginTop: 9 }} className='flex-general-row-wrapper'>
                      <div>
                        <span style={{ marginTop: 1 }}>
                          <i className='icon ion-ios-book' style={{ color: '#1280E0', fontSize: 16 }} />
                        </span>
                        <span>
                          <a href='https://tutorials.cloudboost.io/en/queues/basicqueues' target='_blank' style={{ color: '#1280E0', fontSize: 14, marginLeft: '4px', float: 'right' }}>Take the Tutorial</a>
                        </span>
                      </div>
                      <div style={{ marginLeft: 10 }} />
                    </div>
                  </div>
                  <div style={{ width: '39%', height: '100%', backgroundColor: '#F7FAFC' }} className='solo-vertical-center'>
                    <img src='public/assets/images/queue-cog.png' style={{ marginLeft: 15 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FirstDisplay;
