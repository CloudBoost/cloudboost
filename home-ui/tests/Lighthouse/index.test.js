var lighthouse = require('./lightHouse.test');

for(var i=0;i<lighthouse.links.length;i++){
    describe(`${lighthouse.links[i]} Tests`,()=>{
        lighthouse.audit(lighthouse.links[i]);
    })
}