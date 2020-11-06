import React from 'react'
import ReactDOM from 'react-dom'
import { observer } from "mobx-react"
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'

@observer
class CloudTable extends React.Component {
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

    render() {
        // let { TABLE, columnsData } = this.props.contextData
        let TABLE = "Role";
        let columnsData = ["username", "expires", "createdAt"];
        return (
            <div>
                <div className="method">
                    <a id="CloudTable-constructor" name="CloudTable-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Create a CloudTable"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_create")} />
                                <pre id="pre_create">
                                    <span className="code-red">{
                                        `var`}</span>{` table = `}<span className="code-red">{`new`}</span>{` CB.CloudTable(`}<span className="code-yellow">{`"${TABLE}"`}</span>{`);`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudTable( tableName )" expandable={true}
                            subtitle="All the tables are in CloudBoost is a type of CloudTable. Pass the table name as a parameter to initialize a CloudTable." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Arguments</h6>
                                    <dl className="argument-list">
                                        <dt>tableName</dt>
                                        <dd className>String <span>Table should not start with a number and should not contain any spaces and special characters.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>A CloudTable object</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudTable-save" name="CloudTable-save" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Save a created Table"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_save")}>
                                    </span>
                                <pre id="pre_save">
                                    <span className="code-red">{
                                        `var`}</span>{` table;;
table = `}<span className="code-red">{`new`}</span>{` CB.CloudTable(`}<span className="code-yellow">{`"NewTable"`}</span>{`);
table.save().then(`}<span className="code-red">{`function`}</span>{`(response){
    //success response
},`}<span className="code-red">{`function`}</span>{`(){
    //get error response
});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudTable.save( [callback] )" expandable={true}
                            subtitle="Save a CloudTable Object. It will automatically create all default columns for a table. If you want to create a user table or role table then just pass 'User' or 'Role' as an argument while creating cloudtable object." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Arguments</h6>
                                    <dl>
                                        <dt>callback</dt>
                                        <dd className>Object <span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>CloudTable Object</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudTable-delete" name="CloudTable-delete" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Delete a created Table"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_delete")}>
                                    </span>
                                <pre id="pre_delete">
                                    <span className="code-red">{
                                        `var`}</span>{` table = `}<span className="code-red">{`new`}</span>{` CB.CloudTable(`}<span className="code-yellow">{`"${TABLE}"`}</span>{`);
table.delete().then(`}<span className="code-red">{`function`}</span>{`(response){
    //success response
},`}<span className="code-red">{`function`}</span>{`(){
    //get error response
});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudTable.delete( [callback] )" expandable={true}
                            subtitle="Delete a CloudTable object i.e. delete a table of an App." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Arguments</h6>
                                    <dl>
                                        <dt>callback</dt>
                                        <dd className>Object <span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>Success or Error Status</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default CloudTable;