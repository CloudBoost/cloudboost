/**
 * Created by Jignesh on 28-07-2017.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from "mobx-react"
import { Card, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'


@observer
class CloudBoostApi extends React.Component {
    constructor() {
        super();
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

    render() {
        let appId = this.props.appId;
        let jsKey = this.props.jsKey;
        let masterKey = this.props.masterKey;
        return (
            <div>
                <div className="method">
                    <a id="CloudBoostApi" name="cbapi" className="section-anchor" />
                    <a id="CloudBoostApi-install" name="CloudBoostApi-install" className="section-anchor" />
                    <Card style={{marginBottom:16}}>
                        <CardHeader
                            title="Install Cloudboost using NPM"
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard"
                                      title="Copy.."
                                      onClick={this.copyToClipboard.bind(this, "#pre_install")} />
                                <pre id="pre_install">
                                    {`npm install cloudboost`}
                                </pre>
                            </div>
                        </CardMedia>
                    </Card>

                    <a id="CloudBoostApi-include" name="CloudBoostApi-include" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Include CloudBoost SDK in Project"
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard"
                                      title="Copy.."
                                      onClick={this.copyToClipboard.bind(this, "#cb_include")} />
                                <pre id="cb_include">
                                    <span className="code-red">{`let`}</span>{` CB = require('`}<span className="code-yellow">{`cloudboost`}</span>`);
                                </pre>
                            </div>
                        </CardMedia>
                    </Card>

                    <a id="CloudBoost-initialize" name="CloudBoost-initialize" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Initialize App"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard"
                                      title="Copy.."
                                      onClick={this.copyToClipboard.bind(this, "#cb_initialize")}>
                                    </span>
                                <pre id="cb_initialize">
                                    {`CB.CloudApp.init(`}<span className="code-yellow">{appId?`'`+appId+`'`:`'YOUR APP ID'`}</span>{`,`}<span className="code-yellow">{jsKey?`'`+jsKey+`'`:`'YOUR APP KEY'`}</span>`);
                                </pre>
                            </div>
                        </CardMedia>
                        <CardTitle title="CloudApp.init( appId, appKey )"
                                   expandable={true}
                                   subtitle="Init's the app." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>appId</dt>
                                        <dd className>Application ID
                                            <span>with which your app is registered. You can find this on your CloudBoost Dashboard</span>
                                        </dd>
                                        <div className="clearfix" />
                                        <dt>appKey</dt>
                                        <dd className>Client / Master keyD
                                            <span>Secret Key for your app. You can find this on your CloudBoost Dashboard</span>
                                        </dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p><code>void</code></p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default CloudBoostApi;