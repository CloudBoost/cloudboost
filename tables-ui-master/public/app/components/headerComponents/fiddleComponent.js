import React from 'react'
import {observer} from "mobx-react"
import {Popover, PopoverAnimationVertical} from 'material-ui/Popover'
let editor,code;
@observer

class Fiddle extends React.Component {
    constructor() {
        super()
        this.state = {}
    }
    handleTouchTap(which, event) {
        // This prevents ghost click.
        event.preventDefault();
        this.state[which] = true
        this.state.anchorEl = event.currentTarget
        this.setState(this.state)
    }
    handleRequestClose(which) {
        this.state[which] = false
        this.setState(this.state)
    }

    executeCode(){
        let queryResult,
            thisObj = this;
        queryResult = Promise.resolve(eval(code))
        queryResult.then((obj) => {
            console.log(obj);
            if (obj != null) {
                if (obj[0]instanceof CB.CloudObject || (obj)instanceof CB.CloudObject) {
                    if (Object.prototype.toString.call(obj) === '[object Array]')
                        thisObj.props.tableStore.updateColumnsData(obj);
                    else
                        thisObj.props.tableStore.updateColumnsData([obj]);
                    }
                }
        })
    }

    componentDidUpdate() {
        if (document.getElementById('codesnippet_editable')) {
            editor = CodeMirror.fromTextArea(document.getElementById('codesnippet_editable'), {
                mode: "javascript",
                theme: "default",
                matchBrackets: true,
                autoCloseBrackets: true,
                lineNumbers: true
            });
            editor.on('keyup', function(cm, e) {
                 code = cm.getValue();  
            })
        }
    }
    render() {
        var defaultValue = "// Demo code for querying the CloudTable        \nvar query=new CB.CloudQuery('" + this.props.tableStore.TABLE + "');\nquery.find().then(function(obj){\n\n\t//Promise is returned to update the rows.\n\treturn Promise.resolve(obj);\n\n});		";
        return (
            <button className={"btn subhbtnpop"} onTouchTap={this.handleTouchTap.bind(this, 'openEditor')}>
                <i className="fa fa-code mr2" aria-hidden="true"></i>Fiddle
                <Popover open={this.state.openEditor} anchorEl={this.state.anchorEl} anchorOrigin={{
                    horizontal: 'left',
                    vertical: 'bottom'
                }} targetOrigin={{
                    horizontal: 'left',
                    vertical: 'top'
                }} onRequestClose={this.handleRequestClose.bind(this, 'openEditor')} animated={true} className="code-editor-popover">

                    <div className="codeEditorContainer">
                        <span className="code-label">JavaScript <span className="ion-play execute-code-icon" onClick={this.executeCode.bind(this)}>{" Execute"}</span></span>
                        <textarea name="codesnippet_editable" id="codesnippet_editable" defaultValue={defaultValue}></textarea>
                    </div>
                </Popover>
            </button>

        );
    }
}

export default Fiddle;
