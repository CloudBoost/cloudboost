import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from "mobx-react"
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'

@observer
class CloudQueue extends React.Component {
    constructor() {
        super()
        this.state = {

        }
    }

    copyToClipboard(element) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val($(element).text()).select();
        document.execCommand("copy");
        $temp.remove();
    }


    handleExpandChange = (expanded) => {
        this.setState({ expanded: expanded });
    };

    handleToggle = (event, toggle) => {
        this.setState({ expanded: toggle });
    };

    handleExpand = () => {
        this.setState({ expanded: true });
    };

    handleReduce = () => {
        this.setState({ expanded: false });
    };

    render() {
        return (
            <div>
                <div className="method">
                    <a id="CloudQueue-constructor" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Initialise a Cloud Queue"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_queue")}>

                                </span>
                                <pre id="pre_queue">
                                    <span className="code-red">{`var`}</span>{` queue = `}<span className="code-red">{`new`}</span>{` CB.CloudQueue(`}<span className="code-yellow">{`"queueName" , "queueType"`}</span>{`);`}
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudQueue( queueName, queueType )" expandable={true} subtitle="Instantiate a Cloud Queue for your Application." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>queueName</dt>
                                        <dd className>string <span>The name of the queue you want to initialise.</span></dd>
                                        <div className="clearfix" />
                                        <dt>queueType</dt>
                                        <dd className>string <span>The type of the queue can be either push or pull.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>A Queue Object, which defines the property of new Queue.</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudQueue-add" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Add a new message to your Queue"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_qadd")}>

                                </span>
                                <pre id="pre_qadd">
                                     <span className="code-red">{`var`}</span>{` queue = `}<span className="code-red">{`new`}</span>{` CB.CloudQueue(`}<span className="code-yellow">{`"queueName" , "queueType"`}</span>{`);
 queue.addMessage( `}<span className="code-yellow">{` "Hi, There!!" `}</span>{`, {
    success: `}<span className="code-red">{`function`}</span>{`(obj) {
        //adds message to Queue
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in adding
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudQueue.addMessage( queueMessage, callback )" expandable={true} subtitle="Adds a message to a Queue" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                         <dt>queueMessage</dt>
                                        <dd className>string <span>The message you want to enter.</span></dd>
                                        <div className="clearfix" />
                                        <dt>callback</dt>
                                        <dd className>object <span>The callback actions you want to perform.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudQueue-getMessage" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Get the first message from the Queue"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_gmsg")}>

                                </span>
                                <pre id="pre_gmsg">
                                     {`queue.getMessage( {
    success: `}<span className="code-red">{`function`}</span>{`(queueMessage) {
        //queueMessage is an instance of CB.QueueMessage class.
        console.log(queueMessage.id);
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in retrieving
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudQueue.getMessage( callback )" expandable={true} subtitle="Adds a message to a Queue" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>callback</dt>
                                        <dd className>object <span>The callback actions you want to perform.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudQueue-delMessage" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="To delete a message from the Queue"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_delmsg")}>

                                </span>
                                <pre id="pre_delmsg">
                                     {`queue.deleteMessage(`}<span className="code-yellow">{` messageId`}</span>{`, {
    success: `}<span className="code-red">{`function`}</span>{`(queueMessage) {
        //message deleted
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudQueue.deleteMessage( messageId, callback )" expandable={true} subtitle="Adds a message to a Queue" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>messageId</dt>
                                        <dd className>string <span>The ID of the message you want to delete.</span></dd>
                                        <div className="clearfix" />
                                        <dt>callback</dt>
                                        <dd className>object <span>The callback actions you want to perform.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudQueue-delete" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Delete a Cloud Queue"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_qdel")}>

                                </span>
                                  <pre id="pre_qdel">
                                     <span className="code-red">{`var`}</span>{` queue = `}<span className="code-red">{`new`}</span>{` CB.CloudQueue(`}<span className="code-yellow">{`"queueName" , "queueType"`}</span>{`);
 queue.delete( {
    success: `}<span className="code-red">{`function`}</span>{`(obj) {
        //deletes Queue
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in delete
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudQueue.delete( callback )" expandable={true} subtitle="Deletes a Cloud Queue" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>callback</dt>
                                        <dd className>object <span>The callback actions you want to perform.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudQueue-clear" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Clears a Cloud Queue"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_qclear")}>

                                </span>
                                  <pre id="pre_qclear">
                                     <span className="code-red">{`var`}</span>{` queue = `}<span className="code-red">{`new`}</span>{` CB.CloudQueue(`}<span className="code-yellow">{`"queueName" , "queueType"`}</span>{`);
 queue.clear( {
    success: `}<span className="code-red">{`function`}</span>{`(obj) {
        //clears Queue
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in clearing
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudQueue.clear( callback )" expandable={true} subtitle="Clears a Cloud Queue" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>callback</dt>
                                        <dd className>object <span>The callback actions you want to perform.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default CloudQueue;