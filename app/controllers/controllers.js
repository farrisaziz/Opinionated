var request = require("request");
var cheerio = require("cheerio");

// Requiring the `Article` model
var Article = require("../models").Article;
var Note = require("../models").Note;

module.exports = {

	// Query: In our database, go to the articles collection, then "find" everything
	// sort in decending order then display results on index.hbs
	home: function(req, res) {
		Article.find({})
		.sort({_id: 1})
		.then(dbArticles => {
			// console.log(JSON.stringify(dbArticles, null, ' '));
			res.render("index", {news: dbArticles});
		})
		.catch(err => {
			res.json(err);
		});
	},

	// Query: In our database, go to the articles collection, then "find" saved articles
	// sort in decending order, populate notes then display results on saved.hbs
	viewSaved: function(req, res) {
		Article.find({saved: true})
		.sort({_id: 1})
		.populate("notes")
		.then(dbArticles => {
			// console.log(JSON.stringify(dbArticles, null, ' '));
			res.render("saved", {news: dbArticles});
		})
		.catch(err => {
			res.json(err);
		});
	},

	scrape: {
		npr: function(req ,res) {
		  request("https://www.npr.org/", function(error, response, html){
		    var $ = cheerio.load(html);

		    var articles = [];

		    $("article.hp-item.has-image").each(function(i, element){
		      var headline = $(element).find('.title').text();
		      var summary = $(element).find('.teaser').text();
		      var articleUrl = $(element).find('.title').parent().attr('href');
		      var imgUrl = $(element).find('.imagewrap').find('img').attr('src'); 
		      var transcriptUrl = $(element).find('.audio-tool-transcript').find('a').attr('href');
		      var imgCredit = $(element).find('.credit-caption').children('span').text();

		      if(imgUrl){
		        imgUrl = imgUrl.replace(/-c15/g,'-c85');
		      }
		      if(imgCredit){
		        imgCredit = imgCredit.replace(/\r?\n|\r/g,'').trim();
		      }

		      articles.push(new Article({
		        headline: headline,
		        summary: summary,
		        article: articleUrl,
		        img: {
		          url: imgUrl,
		          credit: imgCredit
		        },
		        transcript: transcriptUrl || ''
		      }));

		      console.log('Articles Count: ' + articles.length);

		    });

		    Article.insertMany(articles, function(err, docs) {
		    	res.json({news: docs});
		    });

		  });
		},

		vox: function(req ,res) {
		  request("https://www.vox.com/", function(error, response, html){
		    var $ = cheerio.load(html);

		    var articles = [];

		    $("div.c-entry-box--compact--article").each(function(i, element){
		      var headline = $(element).find('.c-entry-box--compact__title a').text();
		      var summary = $(element).find('.c-entry-box--compact__dek').text();
		      var articleUrl = $(element).find('a').attr('href');
		      var imgUrl = $(element).find('img').attr('src');
		      var byline = $(element).find('.c-byline__item a').text();

			  if(imgUrl === "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs"){
				imgUrl = $(element).find('img + noscript').html().split('"')[1];
			  }

		      // var newsArticle = new Article({
		      //   headline: headline,
		      //   summary: summary,
		      //   article: articleUrl,
		      //   byline: byline,
		      //   img: {
		      //     url: imgUrl || ''
		      //   }
		      // });

		      articles.push(new Article({
		        headline: headline,
		        summary: summary,
		        article: articleUrl,
		        byline: byline,
		        img: {
		          url: imgUrl || ''
		        }
		      }));

		      console.log('Articles Count: ' + articles.length);

		      // Save the article to MongoDB
		      // newsArticle.save(function(err, article){
		      //   if(err) return console.error(err);
		      //   console.log('Article '+ i +' saved successfully!');
		      //   // console.log(article);
		      // });
		    });

		    Article.insertMany(articles, function(err, docs) {
		    	res.json({news: docs});
		    });
		    // res.redirect('/');
		  });
		},

		nyt: function(req ,res) {
			request("https://www.nytimes.com/", function(error, response, html){
				var $ = cheerio.load(html);

				var articles = [];

				$("div.collection")
				  .not('.headlines')
				  .not('.insider-collection')
				  .not('.crosswords-collection').each(function(i, element){
					var headline = $(element).find('.story>.story-heading').children('a').text();
					var summary = $(element).find('.story>.summary').text().trim();
					var articleUrl = $(element).find('.story-heading').children('a').attr('href');
					var byline = $(element).find('.byline').text().trim();
					var imgUrl = $(element).find('.imagewrap').find('img').attr('src') ||
						$(element).find('[itemType="http://schema.org/ImageObject"]').attr('itemid');
					var imgCredit = $(element).find('.credit-caption').children('span').text();


					var articleInfo = {
						headline: headline,
						summary: summary,
						article: articleUrl,
						img: {
							url: imgUrl || '',
							credit: imgCredit || ''
						},
						byline: toTitleCase(byline.replace(/By/i,'')),
						saved: false
					}

					if(articleUrl){
						request(articleUrl, function(err, resp, html_tier2){
							let $ = cheerio.load(html_tier2);

							imgUrl = $("h1[itemprop='headline']+figure").attr('itemid');
							if(imgUrl){
								articleInfo.img.url = imgUrl;
							}

							// var newsArticle = new Article(articleInfo);

							articles.push(new Article(articleInfo));

							// Save the article to MongoDB
							// newsArticle.save(function(err, article){
							// 	if(err) return console.error(err);
							// 	console.log('Article '+ i +' saved successfully!');
							// 	console.log(article);
							// });
						});	
					}
					
				});

				Article.insertMany(articles, function(err, docs) {
			    	res.json({news: docs});
			    });

			});
		},

		wsj: function(req ,res) {
		  request("https://www.wsj.com/", function(error, response, html){
		    var $ = cheerio.load(html);

		    var results = [];

		    console.log('Number of Results: ', $(".wsj-card").length);

		    $(".wsj-card").each(function(i, element){
		      var headline = $(element).find('.title').text();
		      var summary = $(element).find('.teaser').text();
		      var articleUrl = $(element).find('.title').parent().attr('href');
		      var imgUrl = $(element).find('.imagewrap').find('img').attr('src'); 
		      var transcriptUrl = $(element).find('.audio-tool-transcript').find('a').attr('href');
		      var imgCredit = $(element).find('.credit-caption').children('span').text();

		      if(imgUrl){
		        imgUrl = imgUrl.replace(/-c15/g,'-c85');
		      }
		      if(imgCredit){
		        imgCredit = imgCredit.replace(/\r?\n|\r/g,'').trim();
		      }

		      var newsArticle = new Article({
		        headline: headline,
		        summary: summary,
		        article: articleUrl,
		        img: {
		          url: imgUrl,
		          credit: imgCredit
		        },
		        transcript: transcriptUrl || ''
		      });

		      // Save the article to MongoDB
		      newsArticle.save(function(err, article){
		        if(err) return console.error(err);
		        console.log('Article '+ i +' saved successfully!');

		      });
		    });
		    res.redirect('/');
		  });
		},
	},

	deleteAllArticles: function(req, res){
		Article.deleteMany({}, function(err, data) {
	    // Log any errors if the server encounters one
	    if (err) {
	      console.log(err);
	    }
	    else {
	      res.json(data);
	    }
	  });
	},

	deleteOneArticle: function(req, res){
		Article.deleteOne({_id: req.params.articleId}, function(err, data) {
	    // Log any errors if the server encounters one
	    if (err) {
	      console.log(err);
	    }
	    else {
	      res.json(data);
	    }
	  });
	},

	deleteOneNote: function(req, res){
		Note.deleteOne({_id: req.params.noteId}, function(err, data) {
	    // Log any errors if the server encounters one
	    if (err) {
	      console.log(err);
	    }
	    else {
	      res.json(data);
	    }
	  });
	},

	saveArticle: function(req, res){
		Article.updateOne({_id: req.params.articleId},{ $set: {saved: true} }, function(err, data) {
	    // Log any errors if the server encounters one
	    if (err) {
	      console.log(err);
	    }
	    else {
	      res.json(data);
	    }
	  });
	},

	unsaveArticle: function(req, res){
		Article.updateOne({_id: req.params.articleId},{$set: {saved: false}}, function(err, data) {
	    // Log any errors if the server encounters one
	    if (err) {
	      console.log(err);
	    }
	    else {
	      res.json(data);
	    }
	  });
	},

	addComment: function(req, res) {
		Note.create(req.body)
		  .then(dbNote => {
		  	return Article.findOneAndUpdate(
        {"_id": req.params.id}, 
        { $push: { notes: dbNote._id } },
        { new: true });
		  })
		  .then(dbArticle => {
		  	Article.findOne({"_id": dbArticle._id})
		    .populate("notes")
		    .then(dbArticle2 => {
		      res.json(dbArticle2);
		    })
		    .catch(err => {
		      res.json(err);
		    });
	    })
	    .catch(err => {
	      res.json(err);
	    });
	},

	article_DEBUG: function(req, res) {
	  Article.findOne({"_id": req.params.id})
	    .populate("notes")
	    .then(dbArticle => {
	      res.json(dbArticle);
	    })
	    .catch(err => {
	      res.json(err);
	    });
	}

};

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}