module.exports = {
    "key": "341977b3-7d53-425b-95cf-feb0e2eb76d5",
    "data": {
      "name": "friends",
      "appId": "exhtvjjssudk",
      "_type": "table",
      "type": "custom",
      "maxCount": 9999,
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
        }
      ]
    }
  }