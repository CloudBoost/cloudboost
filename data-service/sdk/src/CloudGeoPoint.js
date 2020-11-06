import CB from './CB'
/*
 *CloudGeoPoint
 */

class CloudGeoPoint {
    constructor(longitude , latitude) {
        if((!latitude && latitude!==0) || (!longitude && longitude!==0))
            throw "Latitude or Longitude is empty.";

        if(isNaN(latitude))
            throw "Latitude "+ latitude +" is not a number type.";

        if(isNaN(longitude))
            throw "Longitude "+ longitude+" is not a number type.";

        this.document = {};
        this.document._type = "point";
        this.document._isModified = true;
        //The default datum for an earth-like sphere is WGS84. Coordinate-axis order is longitude, latitude.
        if((Number(latitude)>= -90 && Number(latitude)<=90)&&(Number(longitude)>= -180 && Number(longitude)<=180)) {
            this.document.coordinates = [Number(longitude), Number(latitude)];
            this.document.latitude = Number(latitude);
            this.document.longitude = Number(longitude);
        }
        else{
            throw "latitude and longitudes are not in range";
        }
    };
    get(name) { //for getting data of a particular column

        return this.document[name];
    };

    set(name,value) { //for getting data of a particular column

        if(name === 'latitude') {
            if(Number(value)>= -90 && Number(value)<=90) {
                this.document.latitude = Number(value);
                this.document.coordinates[1] = Number(value);
                this.document._isModified = true;
            }
            else
                throw "Latitude is not in Range";
        }
        else {
            if(Number(value)>= -180 && Number(value)<=180) {
                this.document.longitude = Number(value);
                this.document.coordinates[0] = Number(value);
                this.document._isModified = true;
            }
            else
                throw "Latitude is not in Range";
        }
    };
    distanceInKMs(point) {

        var earthRedius = 6371; //in Kilometer
        return earthRedius * greatCircleFormula(this, point);
    };

    distanceInMiles(point){

        var earthRedius = 3959 // in Miles
        return earthRedius * greatCircleFormula(this, point);

    };

    distanceInRadians(point){

        return greatCircleFormula(this, point);
    };
}

Object.defineProperty(CloudGeoPoint.prototype, 'latitude', {
    get: function() {
        return this.document.coordinates[1];
    },
    set: function(latitude) {
        if(Number(latitude)>= -90 && Number(latitude)<=90) {
            this.document.latitude = Number(latitude);
            this.document.coordinates[1] = Number(latitude);
            this.document._isModified = true;
        }
        else
            throw "Latitude is not in Range";
    }
});

Object.defineProperty(CloudGeoPoint.prototype, 'longitude', {
    get: function() {
        return this.document.coordinates[0];
    },
    set: function(longitude) {
        if(Number(longitude)>= -180 && Number(longitude)<=180) {
            this.document.longitude = Number(longitude);
            this.document.coordinates[0] = Number(longitude);
            this.document._isModified = true;
        }
        else
            throw "Longitude is not in Range";
    }
});

function greatCircleFormula(thisObj, point){

    var dLat =(thisObj.document.coordinates[1] - point.document.coordinates[1]).toRad();
    var dLon = (thisObj.document.coordinates[0] - point.document.coordinates[0]).toRad();
    var lat1 = (point.document.coordinates[1]).toRad();
    var lat2 = (thisObj.document.coordinates[1]).toRad();
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return c;
}

if (typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function() {
        return this * Math.PI / 180;
    }
}


CB.CloudGeoPoint = CB.CloudGeoPoint || CloudGeoPoint

export default CB.CloudGeoPoint