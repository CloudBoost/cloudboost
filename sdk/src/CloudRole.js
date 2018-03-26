import CB from './CB'
/*
 CloudRole
 */

class CloudRole {
    constructor(roleName) { //calling the constructor.
        if (!this.document) this.document = {};
        this.document._tableName = 'Role';
        this.document._type = 'role';
        this.document.name = roleName;
        this.document.expires = null;
        this.document.ACL = new CB.ACL();
        this.document.expires = null;
        this.document._isModified = true;
        this.document._modifiedColumns = ['createdAt','updatedAt','ACL','name','expires'];
    };
}
CloudRole.prototype = Object.create(CB.CloudObject.prototype)

Object.defineProperty(CloudRole.prototype, 'name', {
    get: function() {
        return this.document.name;
    },
    set: function(name) {
        this.document.name = name;
        CB._modified(this,name);
    }
})

CB.CloudRole = CB.CloudRole || CloudRole

export default CB.CloudRole