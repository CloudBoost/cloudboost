import React from 'react';
import {connect} from 'react-redux';

import {toggleDrawer} from '../../actions';

//ui items
import {IconButton} from 'material-ui';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import { Scrollbars } from 'react-custom-scrollbars';

//doc components
import CloudTable from './cloudTable.js'
import CloudObject from './cloudObject.js'
import CloudUser from './cloudUser.js'
import CloudRole from './cloudRole.js'
import CloudFile from './cloudFile.js'
import CloudEvent from './cloudEvent.js'
import CloudCache from './cloudCache.js'
import CloudQueue from './cloudQueue.js'
import CloudBoostApi from './cloudBoostApi'

//css
import '../../../css/drawer.css';

export class QuickDocs extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            migrateTo: ''
        }
    }

    learnMore() {
        let win = window.open("https://tutorials.cloudboost.io/", '_blank')
        win.focus()
    }

    componentWillMount(){
        this.setState({migrateTo:this.props.migrateTo});
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.migrateTo !== nextProps.migrateTo) {
            this.setState({migrateTo: nextProps.migrateTo}, this.forceUpdate);
        }
    }

    onCardStateChange = (newState, view) => {
        if (newState)
            this.setState({migrateTo: view});
        else
            this.setState({migrateTo: ""});
    };

    render() {

        const styles = {
            bgInfo: {backgroundColor: "#d9edf7"},
            bgPrimary: {backgroundColor: "#549afc"},
            title: {
                fontSize: 20,
                letterSpacing: "-.5px",
                fontWeight: 500,
                lineHeight: "1.1",
                fontFamily: "Avenir Next,Helvetica Neue,Helvetica,sans-serif",
                color: "#fff"
            }
        };

        return (
            <div>
                {
                    this.props.openDrawer &&
                    <Drawer className="drawer"
                            width={'40%'}
                            openSecondary={true}
                            open={this.props.openDrawer}
                            containerStyle={{
                                overflow: "hide",
                                bottom: 0,
                                height:"inherit",
                            }}
                            style={{overflow: "hide"}}
                    >

                        <AppBar className="doc-bar"
                                style={{
                                    backgroundColor: "#4F8EF7",
                                    height: 60
                                }}
                                title={<span style={styles.title}>Quick Documentation</span>}
                                iconElementLeft={
                                    <IconButton>
                                        <NavigationClose
                                            color="#fff"
                                            onClick={()=>this.props.toggleDrawer(false)}/>
                                    </IconButton>
                                }
                                iconElementRight={
                                    <FlatButton onClick={this.learnMore.bind(this)}
                                                label="More..."
                                                style={{...styles.title, fontSize: 14}}/>
                                }
                        />
                        <Scrollbars className="drawerSelector">

                            <Card id="cbapi"
                                  initiallyExpanded={this.state.migrateTo === "cbapi"}
                                  expanded={this.state.migrateTo === "cbapi"}
                                  onExpandChange={(newState) => this.onCardStateChange(newState, "cbapi")}>
                                <CardHeader
                                    title="Install CloudBoost"
                                    subtitle="Install and Integrate Cloudboost SDK in your project"
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudBoostApi {...this.props.manageApp}/>
                                </CardText>
                            </Card>

                            <Card id="objects"
                                  initiallyExpanded={this.state.migrateTo==="objects"}
                                  expanded={this.state.migrateTo==="objects"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"objects")}>
                                <CardHeader
                                    title="Cloud Object"
                                    subtitle="CloudObjects helps you to store JSON like structured in CloudBoost. "
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudObject />
                                </CardText>
                            </Card>

                            <Card id="tables"
                                  initiallyExpanded={this.state.migrateTo==="tables"}
                                  expanded={this.state.migrateTo==="tables"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"tables")}>
                                <CardHeader
                                    title="Cloud Table"
                                    subtitle="Cloud Table helps you to store your desired data in row-column format."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudTable />
                                </CardText>
                            </Card>

                            <Card id="user"
                                  initiallyExpanded={this.state.migrateTo === "user"}
                                  expanded={this.state.migrateTo==="user"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"user")}>
                                <CardHeader
                                    title="Cloud User"
                                    subtitle="Cloud User helps you to create User for your application."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudUser />
                                </CardText>
                            </Card>

                            <Card id="role"
                                  initiallyExpanded={this.state.migrateTo === "role"}
                                  expanded={this.state.migrateTo==="role"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"role")}>
                                <CardHeader
                                    title="Cloud Role"
                                    subtitle="Cloud Role helps you to assign a specific role to a particular user of your Application."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudRole />
                                </CardText>
                            </Card>

                            <Card id="file"
                                  initiallyExpanded={this.state.migrateTo === "file"}
                                  expanded={this.state.migrateTo === "file"}
                                  onExpandChange={(newState) => this.onCardStateChange(newState, "file")}>
                                <CardHeader
                                    title="Cloud File"
                                    subtitle="Cloud File helps you to store information onto the CloudBoost Server in BLOB/File formats."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudFile />
                                </CardText>
                            </Card>

                            <Card id="analytics"
                                  initiallyExpanded={this.state.migrateTo === "analytics"}
                                  expanded={this.state.migrateTo==="analytics"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"analytics")}>
                                <CardHeader
                                    title="Cloud Event"
                                    subtitle="Cloud Events helps you to track User Activity around your Application."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudEvent />
                                </CardText>
                            </Card>

                            <Card id="cache"
                                  initiallyExpanded={this.state.migrateTo === "cache"}
                                  expanded={this.state.migrateTo==="cache"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"cache")}>
                                <CardHeader
                                    title="Cloud Cache"
                                    subtitle="Cloud Cache helps you maintain data."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}/>
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudCache />
                                </CardText>
                            </Card>

                            <Card id="queue"
                                  initiallyExpanded={this.state.migrateTo === "queue"}
                                  expanded={this.state.migrateTo==="queue"}
                                  onExpandChange={(newState)=>this.onCardStateChange(newState,"queue")}>
                                <CardHeader
                                    title="Cloud Queue"
                                    subtitle="Cloud Queue helps you to line up your events."
                                    actAsExpander={true}
                                    showExpandableButton={true}
                                    style={{fontWeight:"normal !important"}}
                                />
                                <CardText expandable={true} style={{paddingTop:0}}>
                                    <CloudQueue />
                                </CardText>
                            </Card>

                        </Scrollbars>
                    </Drawer>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        migrateTo: state.drawer.migrateTo,
        openDrawer: state.drawer.openDrawer
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleDrawer: (toggle) => dispatch(toggleDrawer(toggle))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(QuickDocs);