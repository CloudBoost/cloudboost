import React from 'react';
import {connect} from 'react-redux';
import {saveUserImage, deleteUserImage, showAlert, updateUser} from '../../actions';
import ChangeField from './ChangeField';

import FlatButton from 'material-ui/FlatButton';
import ReactTooltip from 'react-tooltip';
import Dialog from 'material-ui/Dialog';
import {
    Table,
    TableBody,
    TableRow,
    TableRowColumn
} from 'material-ui/Table';

const profileStyle = {
    dialogStyle: {width: 400},
    profileLabel: {
        fontWeight: 400,
        fontSize: 16,
        color: 'rgba(0,0,0,.5)',
        lineHeight: '24px',
        textAlign: 'left',
        letterSpacing: .03,
        paddingRight: 0,
        paddingLeft: 0,
        width: 140
    },
    profileLabelOutput: {
        fontWeight: 400,
        fontSize: 16,
        color: '#222',
        lineHeight: '24px',
        textAlign: 'left',
        letterSpacing: .03,
        paddingRight: 0,
        paddingLeft: 10
    },
    cutPadding: { paddingLeft: 0, paddingRight: 0 }
};

export class Profile extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            name: this.props.currentUser.user ? this.props.currentUser.user.name : '',
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

    changeUserData() {

        if ((this.state.oldPassword && this.state.newPassword) || this.state.name) {

            if (this.state.newPassword === this.state.confirmPassword) {

                this.setState({progress: true});

                updateUser(this.state.name, this.state.oldPassword, this.state.newPassword)
                    .then(() => this.setState({oldPassword: '', newPassword: '', confirmPassword: '', progress: false}))
                    .catch(err => {

                        if (err.response) {
                            let error = 'User Update Error'
                            showAlert('error', error)
                        }
                        this.setState({oldPassword: '', newPassword: '', confirmPassword: '', progress: false})
                    });
            }
            else {
                showAlert('error', 'New passwords does not match.')
            }

        }
        else {
            showAlert('error', 'Please fill all the fields.')
        }
    }

    changeHandler(which, e) {
        this.state[which] = e.target.value;
        this.setState(this.state)
    }

    keyUpHandler() {
        this.changeUserData();
    }

    render() {

        let userImage = "src/assets/user_image.png";
        let fileId = null;

        if (this.props.currentUser.file) {
            userImage = this.props.currentUser.file.document.url;
            fileId = this.props.currentUser.file.document.id
        }

        const actionsBtn = (<FlatButton label="Save"
                                        primary={true}
                                        disabled={this.state.progress}
                                        onTouchTap={this.changeUserData.bind(this)}/>);

        let profilepicobj = (
            <div className="edit-profile-photo">
                <div className="user-icon medium"
                     style={{backgroundImage: `url('${userImage}')`}}
                     onClick={this.openChangeFile.bind(this)}>
                    {
                        this.props.loading &&
                        <div className="profileimageloader">
                            <img src="src/assets/images/rolling.svg" alt=""/>
                        </div>
                    }

                    <input type="file"
                           style={{visibility: "collapse", width: "0"}}
                           onChange={this.changeFile.bind(this)}
                           id="fileBox"
                           accept="image/*"/>

                </div>
                <span onClick={this.openChangeFile.bind(this)}>Click to Edit</span>
            </div>
        );

        return (
            <Dialog title="Edit Profile"
                    modal={false}
                    open={this.props.open}
                    onRequestClose={this.props.close}
                    contentStyle={profileStyle.dialogStyle}
                    titleStyle={{padding: '21px 24px 14px'}}
                    actionsContainerStyle={{padding: '0 16px 15px 8px'}}
                    actions={actionsBtn}>

                <Table selectable={false}>
                    <TableBody displayRowCheckbox={false} showRowHover={false} className="profile-body">
                        <TableRow className="profile-row">
                            <TableRowColumn style={profileStyle.profileLabel}>Profile Pic</TableRowColumn>
                            <TableRowColumn children={profilepicobj} style={profileStyle.cutPadding}/>
                        </TableRow>
                        <TableRow className="profile-row">
                            <TableRowColumn style={profileStyle.profileLabel}>Name</TableRowColumn>
                            <TableRowColumn style={profileStyle.cutPadding}>
                                <ChangeField field="name"
                                             value={this.state.name}
                                             changeHandler={this.changeHandler.bind(this)}
                                             keyUpHandler={this.keyUpHandler.bind(this)}/>
                            </TableRowColumn>
                        </TableRow>
                        <TableRow className="profile-row">
                            <TableRowColumn style={profileStyle.profileLabel}>Email</TableRowColumn>
                            <TableRowColumn style={profileStyle.profileLabelOutput}
                                            data-tip={this.props.currentUser.user.email}>
                                {this.props.currentUser.user ? this.props.currentUser.user.email : ''}
                            </TableRowColumn>
                        </TableRow>
                        <TableRow className="profile-row">
                            <TableRowColumn style={profileStyle.profileLabel}>Old Password</TableRowColumn>
                            <TableRowColumn style={profileStyle.cutPadding}>
                                <ChangeField field="oldPassword"
                                             value={this.state.oldPassword}
                                             changeHandler={this.changeHandler.bind(this)}
                                             keyUpHandler={this.keyUpHandler.bind(this)}/>
                            </TableRowColumn>
                        </TableRow>
                        <TableRow className="profile-row">
                            <TableRowColumn style={profileStyle.profileLabel}>New Password</TableRowColumn>
                            <TableRowColumn style={profileStyle.cutPadding}>
                                <ChangeField field="newPassword"
                                             value={this.state.newPassword}
                                             changeHandler={this.changeHandler.bind(this)}
                                             keyUpHandler={this.keyUpHandler.bind(this)}/>
                            </TableRowColumn>
                        </TableRow>
                        <TableRow className="profile-row" style={{borderBottom: '1px solid rgb(224, 224, 224)'}}>
                            <TableRowColumn style={profileStyle.profileLabel}>Confirm Password</TableRowColumn>
                            <TableRowColumn style={profileStyle.cutPadding}>
                                <ChangeField field="confirmPassword"
                                             value={this.state.confirmPassword}
                                             changeHandler={this.changeHandler.bind(this)}
                                             keyUpHandler={this.keyUpHandler.bind(this)}/>
                            </TableRowColumn>
                        </TableRow>
                    </TableBody>
                </Table>
                <ReactTooltip place="bottom" type="dark" delayShow={100}/>
            </Dialog>
        );
    }

}

const mapStateToProps = (state) => {
    return {currentUser: state.user, loading: state.loader.loading}
};

const mapDispatchToProps = (dispatch) => {
    return {
        saveUserImage: (file) => dispatch(saveUserImage(file)),
        deleteUserImage: (fileId) => dispatch(deleteUserImage(fileId))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
