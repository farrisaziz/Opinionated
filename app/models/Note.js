var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Create article schema
var NoteSchema = new Schema({
	// `noteText` is required and of type String
	noteText: {type: String, required: true},
	// `date` defaults to Date.now and is of type Date
	date: {type: Date, default: Date.now}
});

// Create Note model using NoteSchema
var Note = mongoose.model('Note', NoteSchema);

// Export the Note model
module.exports = Note;