import React from 'react'
import ReactDOM from 'react-dom'
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card'


class CloudFile extends React.Component {
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
                    <a id="CloudObject" name="CloudObject" className="section-anchor" />
                    <a id="CloudFile-constructor" name="CloudObject-constructor" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Instantiate a CloudFile Object"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            {/*overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        >*/}
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_initiatecf")}>

                                </span>
                                <pre id="pre_initiatecf">
                                    <span className="code-red">{`var`}</span>{` documentFile = `}<span className="code-red">{`new`}</span>{` Blob([`}<span className="code-yellow">{`"'This is the content of 
    my document blob'`}</span>{`],{type :`}<span className="code-yellow"> {`'text/plain'}`}</span>{`});`}
                                    <span className="code-red">{`
var`}</span>{` file = `}<span className="code-red">{`new `}</span>{`CB.CloudFile(documentFile);`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="Constructor : CloudFile( file/BLOB, typeOfFile )" expandable={true} subtitle=" Instantiates a CloudFile object." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>file</dt>
                                        <dd className>file/BLOB object <span>The file/BLOB that you want to save</span></dd>
                                        <div className="clearfix" />
                                        <dt>type</dt>
                                        <dd className>Object <span>Specify the type of text stored in File/BLOB</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>void</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudFile-save" name="CloudObject-set" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Save a CloudFile"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            {/*overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        >*/}
                            <div className="method-example" id="api-summary-example">

                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_savecf")}>
                                    </span>
                                <pre id="pre_savecf">
                                    <span className="code-red">{`var`}</span>{` documentFile = `}<span className="code-red">{`new`}</span>{` Blob([`}<span className="code-yellow">{`"'This is the content of 
    my document blob'`}</span>{`],{type :`}<span className="code-yellow"> {`'text/plain'}`}</span>{`});`}
                                    <span className="code-red">{`
var`}</span>{` file = `}<span className="code-red">{`new `}</span>{`CB.CloudFile(documentFile);
file.save({
    success: `}<span className="code-red">{`function`}</span>{`(obj) {
        //got the file object successfully 
        //with the url to the file
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in uploading file
    }
});`
                                    }
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudFile.save( [callback] )" expandable={true} subtitle="Saves the CloudFile object." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Arguments</h6>
                                    <dl className="argument-list">
                                        <dt>callback</dt>
                                        <dd className>Object <span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>It returns a CloudFile object having url attribute set to the URL of the blob uploaded to the server if the operation is successful otherwise returns an error object along with JQuery promise (if callback is not provided).</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudFile-delete" name="CloudObject-get" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Delete saved File"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            {/*overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        >*/}
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_delcf")}>
                                    </span>
                                <pre id="pre_delcf">
                                   {`file.`}<span className="code-red">{`delete`}</span>{`({
    success: `}<span className="code-red">{`function`}</span>{`(fileObj) {
        //file deletion successful
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in deleting file
    }
});`}
   
                                </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudFile.delete( [callback] )" expandable={true} subtitle="Deletes the CloudFile object." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>callback</dt>
                                        <dd className>Object <span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>It returns a CloudFile object having url attribute set to null if the operation is successful otherwise returns an error object along with JQuery promise (if callback is not provided).</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                    <a id="CloudFile-fetch" name="CloudObject-unset" className="section-anchor" />
                    <Card style={{marginBottom:16}} onExpandChange={this.handleExpandChange}>
                        <CardHeader
                            title="Fetch A File"
                            actAsExpander={true}
                            showExpandableButton={true}
                            style={{backgroundColor:"#f4f4f4", padding:"10px 16px"}}
                        />
                        <CardMedia>
                            {/*overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}
                        >*/}
                            <div className="method-example" id="api-summary-example">
                                <span className="pull-right flag fa fa-clipboard" title="Copy.." onClick={this.copyToClipboard.bind(this, "#pre_fetchcf")}>
                                    </span>
                                <pre id="pre_fetchcf">

                                    <span className="code-red">{
                                        `var`}</span>{` query = `}<span className="code-red">{`new`}</span>{` CB.CloudQuery(`}<span className="code-yellow">{`"Custom"`}</span>{`);
query.find().then(`}<span className="code-red">{`function`}</span>{`(res)
`}<span className="code-red">{`var`}</span>{` file = res.get(`}<span className="code-yellow">{`'file'`}</span>{`);
file.fetch({
    success: `}<span className="code-red">{`function`}</span>{`(fileObj) {
        //Gets File Object
    },
    error: `}<span className="code-red">{`function`}</span>{`(err) {
        //error in geting file
    }
},`}<span className="code-red">{`function`}</span>{`(){
    //error querying object
});
});`
}                            </pre>
                            </div>{/* method-example */}
                        </CardMedia>
                        <CardTitle title="CloudFile.fetch( [callback] ) " expandable={true} subtitle="Fetches the CloudFile object which has the URL along with other Properties of File." />
                        <CardText expandable={true}>
                            <div className="method-description">
                                <div className="method-list">
                                    <h6>Argument</h6>
                                    <dl className="argument-list">
                                        <dt>callback</dt>
                                        <dd className>Object <span>[optional] if provided must have success and error functions to handle respective response.</span></dd>
                                        <div className="clearfix" />
                                    </dl>
                                    <h6>Returns</h6>
                                    <p>It returns a CloudFile object having url if the operation is successful otherwise returns an error object along with JQuery promise (if callback is not provided).</p>
                                </div>
                            </div>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default CloudFile;