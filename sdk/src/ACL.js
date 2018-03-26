import CB from './CB'

CB.ACL = function() { //constructor for ACL class
    this.document = {};
    this.document['read'] = {"allow":{"user":['all'],"role":[]},"deny":{"user":[],"role":[]}}; //by default allow read access to "all"
    this.document['write'] = {"allow":{"user":['all'],"role":[]},"deny":{"user":[],"role":[]}}; //by default allow write access to "all"
    this.parent = null;
};
CB.ACL.prototype.setPublicWriteAccess = function(value) { //for setting the public write access
    if (value) { //If asked to allow public write access
        this.document['write']['allow']['user'] = ['all'];
    } else {
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1); //remove the "all" value from the "write" array of "this" object
        }
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setPublicReadAccess = function(value) { //for setting the public read access

    if (value) { //If asked to allow public read access
        this.document['read']['allow']['user'] = ['all'];
    } else {
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1); //remove the "all" value from the "read" array of "this" object
        }
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setUserWriteAccess = function(userId, value) { //for setting the user write access

    if (value) { //If asked to allow user write access
        //remove public write access.
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1);
        }
        if (this.document['write']['allow']['user'].indexOf(userId) === -1) {
            this.document['write']['allow']['user'].push(userId);
        }
    } else {
        var index = this.document['write']['allow']['user'].indexOf(userId);
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1); //remove the "userId" value from the "write" array of "this" object
        }
        this.document['write']['deny']['user'].push(userId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setUserReadAccess = function(userId, value) { //for setting the user read access

    if (value) { //If asked to allow user read access
        //remove public write access.
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1);
        }
        if (this.document['read']['allow']['user'].indexOf(userId) === -1) {
            this.document['read']['allow']['user'].push(userId);
        }
    } else {
        var index = this.document['read']['allow']['user'].indexOf(userId);
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1); //remove the "userId" value from the "read" array of "this" object
        }
        this.document['read']['deny']['user'].push(userId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setRoleWriteAccess = function(roleId, value) {

    if (value) {
        //remove public write access.
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1);
        }
        if (this.document['write']['allow']['role'].indexOf(roleId) === -1) {
            this.document['write']['allow']['role'].push(roleId);
        }
    } else {
        var index = this.document['write']['allow']['role'].indexOf(roleId);
        if (index > -1) {
            this.document['write']['allow']['role'].splice(index, 1);
        }
        var index = this.document['write']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['write']['allow']['user'].splice(index, 1);
        }

        this.document['write']['deny']['role'].push(roleId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};
CB.ACL.prototype.setRoleReadAccess = function(roleId, value) {

    if (value) {
        //remove public write access.
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1);
        }
        if (this.document['read']['allow']['role'].indexOf(roleId) === -1) {
            this.document['read']['allow']['role'].push(roleId);
        }
    } else {
        var index = this.document['read']['allow']['role'].indexOf(roleId);
        if (index > -1) {
            this.document['read']['allow']['role'].splice(index, 1);
        }
        var index = this.document['read']['allow']['user'].indexOf('all');
        if (index > -1) {
            this.document['read']['allow']['user'].splice(index, 1);
        }
        this.document['read']['deny']['role'].push(roleId);
    }

    if(this.parent){
        CB._modified(this.parent,'ACL');
    }
};


export default CB.ACL