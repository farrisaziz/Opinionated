var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
	headline: {type: String, unique: true},
	summary: String,
	article: String,
	byline: String,
	img: {url: String, credit: String},
	transcript: String,
	notes: [
	    {
	      // Store ObjectIds in the array
	      type: Schema.Types.ObjectId,
	      // The ObjectIds will refer to the ids in the Note model
	      ref: "Note"
	    }
	],
	saved: Boolean
});

ArticleSchema.methods.saveArticle = function(){
	this.saved = true;
	return this.saved;
};

ArticleSchema.methods.removeSavedArticle = function(){
	delete this.saved;
};

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;