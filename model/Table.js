module.exports = function(mongoose){

	var mongooseSchema = mongoose.Schema;

	var tableSchema = new mongooseSchema({
	  appId: String,
	  name: String, 
	  columns : Array,
	  type: String,
	  id : String,
	  _type: String //table for type of object identification.

	});

	return mongoose.model('Table', tableSchema);
};