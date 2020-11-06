import React from 'react';
import { Card, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';

class CloudObject extends React.Component {
  constructor () {
    super();
    this.state = {

    };
  }

  copyToClipboard = (element) => () => {
    var $temp = $('<input>');
    $('body').append($temp);
    $temp.val($(element).text()).select();
    document.execCommand('copy');
    $temp.remove();
  }

  render () {
    // let { TABLE, columnsData } = this.props.contextData
    let TABLE = 'User';
    let columnsData = ['username', 'expires', 'createdAt'];
    return (
      <div>
        <div className='method'>
          <a id='CloudObject' name='CloudObject' className='section-anchor' />
          <a id='CloudObject-constructor' name='CloudObject-constructor' className='section-anchor' />
          <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
            <CardHeader
              title='Instantiate a CloudObject'
              actAsExpander
              showExpandableButton
              style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
            />
            <CardMedia>
              {/* overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        > */}
              <div className='method-example' id='api-summary-example'>

                <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_initiate')} />
                <pre id='pre_initiate'>
                  {
                    `//creates an object for ${TABLE} table
 `}<span className='code-red'>{`var`}</span>{` cloudObj = `}<span className='code-red'>{`new`}</span>{` CB.CloudObject(`}<span className='code-yellow'>{`"${TABLE}"`}</span>{`);`
                  }
                </pre>
              </div>{/* method-example */}
            </CardMedia>
            <CardTitle title='Constructor : CloudObject( columnName, [objectId] )' expandable subtitle=' Instantiates a CloudObject object.' />
            <CardText expandable>
              <div className='method-description'>
                <div className='method-list'>
                  <h6>Argument</h6>
                  <dl className='argument-list'>
                    <dt>tableName</dt>
                    <dd className>string <span>The name of the table you want to deal with</span></dd>
                    <div className='clearfix' />
                    <dt>objectId</dt>
                    <dd className>[optional] string <span>The id of the object you want it to be. <b>Important : Use this parameter only when you're working on relations. For more information</b></span></dd>
                    <div className='clearfix' />
                  </dl>
                  <h6>Returns</h6>
                  <p>It returns an instance of a CloudObject, as its a constructor. </p>
                  <h6>Properties</h6>
                  <p>Every instance of CloudObject has these properties </p>
                  <dl className='argument-list'>
                    <dt>id</dt>
                    <dd className>string <span>The id of the CloudObject which is populated after the object is saved.</span></dd>
                    <div className='clearfix' />
                    <dt>createdAt</dt>
                    <dd className>Date <span>The Date and time when the object was saved in the database.</span></dd>
                    <div className='clearfix' />
                    <dt>updatedAt</dt>
                    <dd className>Date <span>The Date and time when the object was updated in the database.</span></dd>
                    <div className='clearfix' />
                    <dt>ACL</dt>
                    <dd className>ACL <span>Access Control List, by default this object is publicily readable and writeable. You set object level security here. Refer ACL's</span></dd>
                    <div className='clearfix' />
                  </dl>
                </div>
              </div>
            </CardText>
          </Card>
          <a id='CloudObject-save' name='CloudObject-save' className='section-anchor' />
          <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
            <CardHeader
              title='Save a CloudObject'
              actAsExpander
              showExpandableButton
              style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
            />
            <CardMedia>
              {/* overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        > */}
              <div className='method-example' id='api-summary-example'>
                <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_save')} />
                <pre id='pre_save'>
                  <span className='code-red'>{`var`}</span>{` cloudObj = new CB.CloudObject(`}<span className='code-yellow'>{`"${TABLE}"`}</span>{`);
cloudObj.set(`}<span className='code-yellow'>{`"${columnsData[0].name}", "${columnsData[0].value}"`}</span>{`);
cloudObj.save({
    success: `}<span className='code-red'>{`function`}</span>{`(cloudObj) {
        //cloudObj saved
    },
    error: `}<span className='code-red'>{`function`}</span>{`(err) {
        //Error occured in saving object
    }
});`
                  }
                </pre>
              </div>{/* method-example */}
            </CardMedia>
            <CardTitle title='CloudObject.save( [callback] )' expandable
              subtitle='Saves the CloudObject object to CloudBoost.' />
            <CardText expandable>
              <div className='method-description'>
                <div className='method-list'>
                  <h6>Argument</h6>
                  <dl className='argument-list'>
                    <dt>callback</dt>
                    <dd className>Object <span> [optional] if provided must have success and error functions to handle
                            respective response.</span></dd>
                    <div className='clearfix' />
                  </dl>
                  <h6>Returns</h6>
                  <p>It returns a <code>Promise</code> which when resolved and returns instance of <code>CloudObject </code> saved .If the promise is rejected, you get an error object back. (if <code>callback</code> is not provided).</p>
                </div>
              </div>
            </CardText>
          </Card>
          <a id='CloudObject-fetch' name='CloudObject-fetch' className='section-anchor' />
          <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
            <CardHeader
              title='Fetch a CloudObject'
              actAsExpander
              showExpandableButton
              style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
            />
            <CardMedia>
              <div className='method-example' id='api-summary-example'>
                <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_fetch')} />
                <pre id='pre_fetch'>
                  {
                    `cloudObj.fetch({
    success: `}<span className='code-red'>{`function`}</span>{`(cloudObj) {
        //cloudObj fetched
    },
    error: `}<span className='code-red'>{`function`}</span>{`(err) {    
        //Error occurred in fetching data
    }              
});`
                  }
                </pre>
              </div>{/* method-example */}
            </CardMedia>
            <CardTitle title='CloudObject.fetch( [callback] )' expandable
              subtitle='Refreshes a CloudObject object to by fetching its values from the database.' />
            <CardText expandable>
              <div className='method-description'>
                <div className='method-list'>
                  <h6>Argument</h6>
                  <dl className='argument-list'>
                    <dt>callback</dt>
                    <dd className>Object <span> [optional] if provided must have success and error functions to handle respective response.</span></dd>
                    <div className='clearfix' />
                  </dl>
                  <h6>Returns</h6>
                  <p>It returns <code>Promise</code> whcih resolves or rejects (if <code>callback</code> is not provided).</p>
                </div>
              </div>
            </CardText>
          </Card>
          <a id='CloudObject-delete' name='CloudObject-delete' className='section-anchor' />
          <Card style={{ marginBottom: 16 }} onExpandChange={this.handleExpandChange}>
            <CardHeader
              title='Delete a CloudObject'
              actAsExpander
              showExpandableButton
              style={{ backgroundColor: '#f4f4f4', padding: '10px 16px' }}
            />
            <CardMedia>
              <div className='method-example' id='api-summary-example'>
                <span className='pull-right flag fa fa-clipboard' title='Copy..' onClick={this.copyToClipboard('#pre_delete')} />
                <pre id='pre_delete'>
                  {
                    `cloudObj.delete({
    success: `}<span className='code-red'>{`function`}</span>{`(cloudObj) {    
        //success
    },
    error: `}<span className='code-red'>{`function`}</span>{`(err) {
        //Error
    }              
});`
                  }
                </pre>
              </div>{/* method-example */}
            </CardMedia>
            <CardTitle title='CloudObject.delete( [callback] )' expandable
              subtitle='Delete a CloudObject object, if it is saved in the database.' />
            <CardText expandable>
              <div className='method-description'>
                <div className='method-list'>
                  <h6>Argument</h6>
                  <dl className='argument-list'>
                    <dt>callback</dt>
                    <dd className>
                                            Object
                      <span> [optional] if provided must have
                                        success and error functions to handle
                                        respective response.</span>
                    </dd>
                    <div className='clearfix' />
                  </dl>
                  <h6>Returns</h6>
                  <p>It returns <code>Promise</code> whcih resolves or rejects (if <code>callback</code> is not provided).</p>
                </div>
              </div>
            </CardText>
          </Card>
        </div>
      </div>
    );
  }
}

export default CloudObject;
