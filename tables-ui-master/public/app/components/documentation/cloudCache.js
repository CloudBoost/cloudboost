import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from "mobx-react"
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'

@observer
class CloudCache extends React.Component {
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
                    <a id="CloudCache-constructor" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Initialise a Cloud Cache"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_cache")}>

                                </span>
                                <pre id="pre_cache">
                                    <span className="code-red">{`var`}</span>{` cache = `}<span className="code-red">{`new`}</span>{` CB.CloudCache(`}<span className="code-yellow">{`"cacheName"`}</span>{`);`}
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudCache( cacheName )" expandable={true} subtitle="Instantiate a Cloud Cache" />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>cacheName</dt>
                                        <dd className>string <span>The name of the cache you want to initialise.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>A CloudCache Object containing details of Cache being created.</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudCache-clear" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Clear a Cloud Cache"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_cclear")}>

                                </span>
                                <pre id="pre_cclear">
                                    <span className="code-red">{`var`}</span>{` cache = `}<span className="code-red">{`new`}</span>{` CB.CloudCache(`}<span className="code-yellow">{`"cacheName"`}</span>{`); 
cache.clear( {
    success: `}<span className="code-red">{`function`}</span>{`(obj) {
        //clears the cache
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in clearing cache
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudCache.clear( callback )" expandable={true} subtitle="Clears an existing Cloud Cache" />
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
                    <a id="CloudCache-delete" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Delete a Cloud Cache"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_cdel")}>

                                </span>
                                <pre id="pre_cdel">
                                    <span className="code-red">{`var`}</span>{` cache = `}<span className="code-red">{`new`}</span>{` CB.CloudCache(`}<span className="code-yellow">{`"cacheName"`}</span>{`);
cache.delete( {
    success: `}<span className="code-red">{`function`}</span>{`(obj) {
        //deletes the cache
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in deleting cache
    }});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudCache.delete( callback )" expandable={true} subtitle="Deletes a Cloud Cache" />
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

export default CloudCache;