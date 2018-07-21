var controller = require('../controllers/controllers.js');

module.exports = function(app) {

	// GET routes
	// ====================================================
	app.get("/", controller.home);

	app.get("/saved", controller.viewSaved); 

	app.get("/scrape-npr", controller.scrape["npr"]);

	app.get("/scrape-vox", controller.scrape["vox"]);

	app.get("/scrape-nyt", controller.scrape["nyt"]);

	app.get("/articles/:id", controller.article_DEBUG);


	// Post Routes
	// ====================================================
	app.post("/articles/:id", controller.addComment);
	

	// PUT routes
	// ========================================================
	app.put("/save-article/:articleId", controller.saveArticle);

	app.put("/unsave-article/:articleId", controller.unsaveArticle);


	// Delete Routes
	// ====================================================
	app.delete("/deleteAll", controller.deleteAllArticles);

	app.delete("/delete-article/:articleId", controller.deleteOneArticle);

	app.delete("/delete-note/:noteId", controller.deleteOneNote);

};