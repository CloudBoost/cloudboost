var fs = require('fs');

module.exports = {
    checkServerVersion: function () {
        console.log("in")
        var fileList = getFiles(__dirname);
        for (var i in fileList) {
            if(fileList[i] == "versionChecker.js"){
                continue;
            }
            var fileVersion = fileList[i].split('_');
            fileVersion[1] = fileVersion[1].substring(0, fileVersion[1].lastIndexOf('.'));
            if (fileVersion[1] > global.keys.server_version) {
                console.log("Upgrading to New Server Version..........");
                var serverUpgrader = require(__dirname + "/" + fileList[i]);
                serverUpgrader.upgradeServer(fileVersion[1], global.keys.server_version);
                break;
            } else {
                continue;
            }
        }
    }
}

function getFiles(dir) {
    fileList = [];

    var files = fs.readdirSync(dir);
    for (var i in files) {
        if (!files.hasOwnProperty(i)) continue;
        var name = files[i];
        fileList.push(name);
    }
    return fileList;
}
