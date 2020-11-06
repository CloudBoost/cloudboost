import React from 'react'
import ReactDOM from 'react-dom'
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'

class CloudEvent extends React.Component {
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
                    <a id="CloudEvent-track" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Track an Event"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            {/*overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        >*/}
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_track")}>

                                </span>
                                <pre id="pre_track">
                                    <span className="code-red">{`var`}</span>{` eventObj = `}<span className="code-red">{`new`}</span>{` CB.CloudEvent.track(`}<span className="code-yellow">{`Signup`}</span>{`,{`
    }<span className="code-yellow">{` 
    username: thisObj.username,
    email: thisObj.email`}</span>{`},{
    success: `}<span className="code-red">{`function`}</span>{`(fileObj) {
        //Gets Event Object
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in geting Event Object
    }});`
    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudEvent( name, data, [type], [callback] )" expandable={true} subtitle="Track Down an Event" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>name</dt>
                                        <dd className>string <span>The name of the event you want to track.</span></dd>
                                        <div className="clearfix" />
                                        <dt>data</dt>
                                        <dd className> Object <span>The information you want to send to the event.</span></dd>
                                        <div className="clearfix" />
                                        <dt>type</dt>
                                        <dd className> [optional]Object <span></span></dd>
                                        <div className="clearfix" />
                                        <dt>type</dt>
                                        <dd className> [optional]callback <span>The callback actions you want to perform.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>Void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default CloudEvent;