import React from 'react';
import {connect} from 'react-redux';
import Toolbar from '../toolbar/toolbar.js';
import Footer from '../footer/footer.jsx';
import {saveUserImage, deleteUserImage, showAlert, updateUser} from '../../actions';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import RefreshIndicator from 'material-ui/RefreshIndicator';

class Profile extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            progress: false
        }
    }
    static get contextTypes() {
        return {router: React.PropTypes.object.isRequired}
    }
    changeFile(e) {
        if (e.target.files[0])
            this.props.saveUserImage(e.target.files[0])
    }
    openChangeFile() {
        document.getElementById("fileBox").click()
    }
    deleteFile(fileId) {
        if (fileId)
            this.props.deleteUserImage(fileId)
    }
    changePassword() {
        if (this.state.oldPassword && this.state.newPassword) {
            if (this.state.newPassword === this.state.confirmPassword) {
                this.setState({progress: true})
                updateUser(this.props.currentUser.user.name, this.state.oldPassword, this.state.newPassword).then(() => {
                    this.setState({oldPassword: '', newPassword: '', confirmPassword: '', progress: false})
                    showAlert('success', "Password Update Success.")
                }, (err) => {
                    if (err.response) {
                        let error = 'Invalid Password'
                        showAlert('error', error)
                    } else
                        showAlert('success', "Password Update Success.")
                    this.setState({oldPassword: '', newPassword: '', confirmPassword: '', progress: false})
                })
            } else
                showAlert('error', 'New passwords does not match.')
        } else {
            showAlert('error', 'Please fill all the fields.')
        }
    }
    changeHandler(which, e, value) {
        this.state[which] = value
        this.setState(this.state)
    }
    render() {
        let userImage = "src/assets/images/user_image.png"
        let fileId = null
        if (this.props.currentUser.file) {
            userImage = this.props.currentUser.file.document.url
            fileId = this.props.currentUser.file.document.id
        }
        return (
            <div id="" style={{
                backgroundColor: '#FFF'
            }}>
                <div className="profile tables">
                    <div className="profilediv">
                        <div className="imagediv">
                            <img src={userImage} className="userimage" style={{
                                opacity: (this.props.loading
                                    ? "0.3"
                                    : "1.0")
                            }}/>
                            <div className="btndivimage">
                                {this.props.loading
                                    ? <RefreshIndicator size={50} left={70} top={0} status="loading" className="loaderimageuser"/>
                                    : ''
}
                                <input type="file" style={{
                                    display: "none"
                                }} onChange={this.changeFile.bind(this)} id="fileBox" accept="image/*"/>
                                <IconButton tooltip="Edit Image" touch={true} tooltipPosition="bottom-right" className="iconbtns" onClick={this.openChangeFile.bind(this)}>
                                    <EditIcon/>
                                </IconButton>
                                <IconButton tooltip="Delete Image" touch={true} tooltipPosition="bottom-right" className="iconbtns" onClick={this.deleteFile.bind(this, fileId)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </div>
                        </div>
                        <div className="contentdiv">
                            <span className="heading">Profile</span>
                            <span className="labelunameemail">NAME</span>
                            <p className="username">{this.props.currentUser.user
                                    ? this.props.currentUser.user.name
                                    : ''}</p>
                            <span className="labelunameemail">EMAIL</span>
                            <p className="useremail">{this.props.currentUser.user
                                    ? this.props.currentUser.user.email
                                    : ''}</p>
                            <Divider/>
                            <span className="heading">Change Password</span>
                            <form>
                                <TextField hintText="Old Password" floatingLabelText="Old Password" className="textfieldspasword" type="password" onChange={this.changeHandler.bind(this, 'oldPassword')} value={this.state.oldPassword}/>
                                <TextField hintText="New Password" floatingLabelText="New Password" className="textfieldspasword" type="password" onChange={this.changeHandler.bind(this, 'newPassword')} value={this.state.newPassword}/>
                                <TextField hintText="Confirm New Password" floatingLabelText="Confirm New Password" className="textfieldspasword" type="password" onChange={this.changeHandler.bind(this, 'confirmPassword')} value={this.state.confirmPassword}/>
                                <RaisedButton disabled={this.state.progress} label="Change Password" primary={true} className="passwordsubmitbtn" onClick={this.changePassword.bind(this)}/>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = (state) => {

    return {currentUser: state.user, loading: state.loader.loading}
}

const mapDispatchToProps = (dispatch) => {
    return {
        saveUserImage: (file) => dispatch(saveUserImage(file)),
        deleteUserImage: (fileId) => dispatch(deleteUserImage(fileId))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
