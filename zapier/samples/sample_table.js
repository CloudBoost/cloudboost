module.exports = {
    "_id": "5ae03703f2a67d889122c17d",
    "name": "Role",
    "_type": "table",
    "columns": [
      {
        "name": "id",
        "_type": "column",
        "dataType": "Id",
        "required": true,
        "unique": true,
        "relatedTo": null,
        "relationType": null,
        "isDeletable": false,
        "isEditable": false,
        "isRenamable": false,
        "editableByMasterKey": false
      },
      {
        "name": "expires",
        "_type": "column",
        "dataType": "DateTime",
        "required": false,
        "unique": false,
        "relatedTo": null,
        "relationType": null,
        "isDeletable": false,
        "isEditable": false,
        "isRenamable": false,
        "editableByMasterKey": false
      },
      {
        "name": "updatedAt",
        "_type": "column",
        "dataType": "DateTime",
        "required": true,
        "unique": false,
        "relatedTo": null,
        "relationType": null,
        "isDeletable": false,
        "isEditable": false,
        "isRenamable": false,
        "editableByMasterKey": false
      },
      {
        "name": "createdAt",
        "_type": "column",
        "dataType": "DateTime",
        "required": true,
        "unique": false,
        "relatedTo": null,
        "relationType": null,
        "isDeletable": false,
        "isEditable": false,
        "isRenamable": false,
        "editableByMasterKey": false
      },
      {
        "name": "ACL",
        "_type": "column",
        "dataType": "ACL",
        "required": true,
        "unique": false,
        "relatedTo": null,
        "relationType": null,
        "isDeletable": false,
        "isEditable": false,
        "isRenamable": false,
        "editableByMasterKey": false
      },
      {
        "name": "name",
        "_type": "column",
        "dataType": "Text",
        "required": true,
        "unique": true,
        "relatedTo": null,
        "relationType": null,
        "isDeletable": false,
        "isEditable": false,
        "isRenamable": false,
        "editableByMasterKey": false
      }
    ],
    "id": "p9QPlp88",
    "isEditableByClientKey": false,
    "type": "role"
  }