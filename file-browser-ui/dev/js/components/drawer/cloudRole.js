import React from 'react'
import ReactDOM from 'react-dom'
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'


class CloudRole extends React.Component {
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
        let TABLE = "User";
        let columnsData = ["createdAt", "expires", "username"]
        return (
            <div>
                <div className="method">
                    <a id="CloudRole-constructor" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Instantiate a CloudRole Object"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            {/*overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        >*/}
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_initiateRole")}>

                                </span>
                                <pre id="pre_initiateRole">
                                    <span className="code-red">{`var`}</span>{` roleObj = `}<span className="code-red">{`new`}</span>{` CB.CloudRole(`}<span className="code-yellow">{`"${TABLE}"`}</span>{`);`}
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="Constructor : CloudRole( roleName )" expandable={true} subtitle=" Instantiates a CloudRole object." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>roleName</dt>
                                        <dd className>string <span>The name of the role you want to deal with</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>It returns an instance of a CloudRole, as its a constructor. </p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudUser-addToRole" name="CloudObject-fetch" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Get Role of current CloudUser"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_addRole")}>
                                    </span>
                                <pre id="pre_addRole">
                                    {
                                        `//role is an instance of CloudRole Object.
CB.CloudUser.current.addToRole(role, {
    success: `}<span className="code-red">{`function`}</span>{`(roleObj) {
        //given new role
        //to User successfully
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {    
        //Error occurred in assigning role
    }              
});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudObject.addToRole( role, [callback] )" expandable={true}
                            subtitle="Get the current Role of a current User." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>role</dt>
                                        <dd className>CloudRole Object <span>The CloudRole object of the role you want to add the user to.</span></dd>
                                        <div className="clearfix" />
                                        <dt>callback</dt>
                                        <dd className>Object <span>The CloudRole object of the role you want to add the user to.</span></dd>
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>[optional] if provided must have success and error functions to handle respective response.</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudObject-removeFromRole" name="CloudObject-delete" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="To remove current User from current Role"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_removeRole")}>
                                    </span>
                                <pre id="pre_removeRole">
                                    {
                                        `CB.CloudUser.current.removeFromRole(role, {
    success: `}<span className="code-red">{`function`}</span>{`(roleObj) {
        //user removed from role
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {    
        //Error occurred in removing role
    }              
});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudUser.removeFromRole( role , [callback] )" expandable={true}
                            subtitle="Removes the user from the given role provided in role object." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>role</dt>
                                        <dd className>
                                            CloudRole Object
                                        <span>The CloudRole object of the role you want to remove the user from.</span>
                                        </dd>
                                        <div className="clearfix" />
                                        <dt>callback</dt>
                                        <dd className>
                                            Object
                                        <span>[optional] if provided must have success and error functions to handle respective response.</span>
                                        </dd>
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>It returns a CloudUser object having the user information of the user who was logged in otherwise an error object along with JQuery promise (if callback is not provided).</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default CloudRole;