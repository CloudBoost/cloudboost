import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from 'material-ui/Dialog';
import Dropzone from 'react-dropzone';
import LinearProgress from 'material-ui/LinearProgress';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import CONFIG from '../../../config/app.js'
import NewFile from 'material-ui/svg-icons/file/file-upload'


class FilePicker extends React.Component {
    constructor() {
        super()
        this.state = {
            files: [],
            path: "/",
            progress:false,
            completed: 0,
        }
    }
    componentDidMount() {
        this.getAllfiles()
    }
    getAllfiles() {
        let query = new CB.CloudQuery("_File")
        query.setLimit(9999)
        query.find({
            success: function (list) {
                this.setState({ files: ( list || [] ) })
            }.bind(this),
            error: function (error) {
                console.log(error)
            }
        })
    }
    setFolder(folder){
        let path = folder.path.split("/")
        path.splice(0,2,"")
        path.push(folder.name)
        this.setState({path:path.join("/")})
    }
    navigate(where){
        if(where == '/'){
            this.setState({path:"/"})
        } else {
            let path = this.state.path.split("/")
            let pos = path.indexOf(where)
            this.setState({path:path.slice(0,pos+1).join("/")})
        }
    }
    addFile(e){
        let path = this.state.path == "/" ? null : ("/"+CB.appId+this.state.path)
        if(e.target.files[0]){
            let cloudFile = new CB.CloudFile(e.target.files[0],null,null,path)
            this.setState({progress:true})
            cloudFile.save({
                success: function(res) {
                    this.setState({progress:false,completed:0})
                    this.getAllfiles()
                }.bind(this), error: function(err) {
                    console.log(err)
                    this.setState({progress:false,completed:0})
                    this.getAllfiles()
                }.bind(this), uploadProgress : function(percentComplete){
                    this.setState({completed:(percentComplete*100)})
                }.bind(this)
            })
        }
    }
    getFileIcon(file){
        let fileType = file.type.split("/")[1]
        if(fileType){
            if(CONFIG.iconTypes.indexOf(fileType) > -1){
                return <img src={"public/app/assets/images/file/"+fileType+".png"} className="devfileicon" />
            } else {
                return <img src={"public/app/assets/images/file/file.png"} className="devfileicon" />
            }
        } else {
            return <img src={"public/app/assets/images/file/file.png"} className="devfileicon" />
        }
    }
    chooseFile(file){
        this.props.chooseFile(file)
        this.openCloseModal(false)
    }
    openAddFile(){
        document.getElementById("fileBox").click()
    }
    openCloseModal(what) {
        if(what === false && this.state.progress === true){
            return false
        }
        this.props.openCloseFilePicker(false)
    }
    handleClose() {

    }
    render() {
        let dialogTitle = <div className="modaltitle">
                            <span className="diadlogTitleText">File Picker</span>
                            <i className='fa fa-paperclip iconmodal'></i>
                        </div>
        let files = this.state.files.filter((file) => {
            let filePathExist = file.path.includes(this.state.path)
            let fileInFolder = file.path.split(this.state.path).filter(x => x !== "").length === 1
            return filePathExist && fileInFolder
        }).map((file, i) => {
            if (file.type == "folder/folder") {
                return   <TableRow key={ i } onDoubleClick={this.setFolder.bind(this, file)}>
                            <TableRowColumn><img src={"public/app/assets/images/file/folder.png"} className="devfileicon" /><span>{file.name}</span></TableRowColumn>
                            <TableRowColumn><span>{file.updatedAt ? ( new Date(file.updatedAt).toDateString() ) : ''}</span></TableRowColumn>
                        </TableRow>
            } else {
                return  <TableRow key={ i } onDoubleClick={this.chooseFile.bind(this,file)}>
                            <TableRowColumn>{ this.getFileIcon(file) }<span>{file.name}</span></TableRowColumn>
                            <TableRowColumn><span>{file.updatedAt ? ( new Date(file.updatedAt).toDateString() ) : ''}</span></TableRowColumn>
                        </TableRow>
            }
        })
        return (
            <div>
                <Dialog title={dialogTitle} modal={false} open={this.props.isFilePickerOpen || false} onRequestClose={this.openCloseModal.bind(this, false)} style={{zIndex:3000}}>
                    <div className={ this.state.progress ? "hide" : "topnav"}>
                        <span className="topnavsnav" onClick={ this.navigate.bind(this,'/') }>Home</span>
                        <span className="slash">/</span>
                        {
                            this.state.path.split("/").filter(x => x !== "").map((x,i)=>{
                                let lastFolder = i == this.state.path.split("/").filter(x => x !== "").length - 1
                                return  <div style={{display:"inline-block"}}>
                                            <span className={lastFolder ? "topnavsnavselected" : "topnavsnav" } onClick={ this.navigate.bind(this,x) } key={ i }>{ x }</span>
                                            <span className="slash">/</span>
                                        </div>
                            })
                        }
                        <span onClick={ this.openAddFile.bind(this) } className="addfiletext">+Add File</span>
                        <input type="file" style={{display:"none"}} onChange={ this.addFile.bind(this) } id="fileBox"/>
                        <NewFile className="file" onClick={ this.openAddFile.bind(this) }/>
                    </div>
                    <div className={ this.state.progress ? "hide" : "content"}>
                        <Table selectable={false} multiSelectable={false}>
                            <TableHeader displaySelectAll={false} adjustForCheckbox={false} enableSelectAll={false}>
                                <TableRow displayBorder={ false }>
                                    <TableHeaderColumn>Name</TableHeaderColumn>
                                    <TableHeaderColumn>Modified</TableHeaderColumn>
                                </TableRow>
                            </TableHeader>
                            <TableBody displayRowCheckbox={false}>
                                { files }
                            </TableBody>
                        </Table>
                    </div>

                    <p className={ !this.state.progress ? "hide" : "pprogresslineaer"}>Please wait while we upload your file.</p>
		            <p className={ !this.state.progress ? "hide" : "pprogresslineaer99"}>( { this.state.completed == 100 ? 99 : Math.floor(this.state.completed) }% )</p>
                    <LinearProgress mode="determinate" value={this.state.completed} className={ !this.state.progress ? "hide" : "linaerprogfile"}/>
                </Dialog>
            </div>
        );
    }
}

export default FilePicker;