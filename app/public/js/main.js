// $(document).ready(function() {
	M.AutoInit();

	// functions
	var articleCommand = {
		save: function(id, headline) {
			$.ajax({
				url: '/save-article/' + id,
				type: 'PUT'
			})
			.then(function(results) {
				console.log("save success", results);
				M.toast({html: `Saved '${headline}'`, classes: 'truncate saved-toast'});
			})
			.catch(err => {
				console.error(err.message);
			});
		},
		unsave: function(id) {
			$.ajax({
				url: '/unsave-article/' + id,
				type: 'PUT'
			})
			.then(function(results) {
				console.log("unsave success", results);
			})
			.catch(err => {
				console.error(err.message);
			});
		},
		remove: function(id) {
			$.ajax({
				url: '/delete-article/' + id,
				type: 'DELETE'
			})
			.then(function(results) {
				console.log("delete success", results);
			})
			.catch(err => {
				console.error(err.message);
			});
		},
		removeAll: function(){
			$.ajax({
				url: '/deleteAll/',
				type: 'DELETE'
			})
			.then(results => {
				console.log("delete success", results);
				$(".card").remove();
			})
			.catch(err => {
				console.error(err.message);
			});
		}
	};

	$(".scrape-btn").on('click', function(event) {
		event.preventDefault();

		var scrapePath = $(this).attr('href');
		
		$.getJSON(scrapePath, function(data) {

			$("#articleCountText").text('Added '+ data.news.length + ' articles');

			var elem = document.querySelector('#articleCountModal');
			var instance = M.Modal.init(elem);
			instance.open();

			// generate articles on page
			generateArticles(data.news);
		});
		
	});

	function generateArticles(data) {

		$("#articleList .nothing").remove();

		const news_container = $("<div>").addClass('articles');

		for (var i = 0; i < data.length; i++) {
			const article_card = $("<div>").addClass('card hoverable blue-grey darken-1');
			news_container.append(article_card);

			// Image Holder 
			const article_img_holder = $("<a>").attr('href', data[i].article);
			const article_img = $("<div>").addClass('card-image');
			const article_img_tag = $("<img>").attr({
					src: data[i].img.url,
					'data-credit': data[i].img.credit,
					title: data[i].img.credit
				});
			const article_title = $("<span>").addClass('card-title').text(data[i].headline);


			if(data[i].img.url){
				article_img.append(article_img_tag,article_title);
			} else {
				article_img.append(article_title);
			}
			article_img_holder.append(article_img);

			// Add Credit/Byline
			const article_credit = $("<span>").addClass('credit').text(data[i].img.credit);
			const article_byline = $("<span>").addClass('credit').text('By '+data[i].byline);
			if(data[i].img.credit){
				article_img_holder.append(article_credit);
			} else if (data[i].byline){
				article_img_holder.append(article_byline);
			}

			const article_summary_holder = $("<a>").attr('href', data[i].article)
				.addClass('content-link');

			const article_summary_wrapper = $("<div>").addClass('card-content');
			const article_summary = $("<p>").text(data[i].summary);
			
			article_summary_wrapper.append(article_summary);
			article_summary_holder.append(article_summary_wrapper);

			article_card.append(article_img_holder);

			if(data[i].summary){
				article_card.append(article_summary_holder);
			}

			// Card Action
			const article_card_action = $("<div>").addClass('card-action');
			const article_card_action_link = $("<a>")
				.text('View Article')
				.attr('href', data[i].article);

			const article_card_action_save = $("<i>")
				.addClass('save-icon material-icons right')
				.attr({
					'data-article-id': data[i]._id,
					'data-article-headline': data[i].headline
				});
			if(data[i].saved){
				article_card_action_save.addClass('saved red-text');
				article_card_action_save.text('favorite');
			} else {
				article_card_action_save.addClass('black-text');
				article_card_action_save.text('favorite_border');
			}
			article_card_action.append(article_card_action_link, article_card_action_save)
			article_card.append(article_card_action);
		
			// Close Card
			article_close = $("<i>").addClass('close-icon white-text material-icons right')
				.attr('data-article-id', data[i]._id)
				.text('close');
			article_card.append(article_close);

		}
		$("#articleList").prepend(news_container);
		saveIconEventListeners();
	}


	// Update scraper buttons when a News source is chosen
	$("#news-source").change(function(event) {
		var newsSource = '/scrape-' + $(this).val();

		$(".scrape-btn").attr('href', newsSource);
	});

	// Favorite icon hover handler
function saveIconEventListeners(){

	$(".save-icon").hover(function() {
		/* Stuff to do when the mouse enters the element */
		
		if($(this).hasClass('saved')){
			$(this).text("cancel");
		} else {
			$(this).text("favorite").removeClass('black-text').addClass('red-text');
		}
	}, function() {
		/* Stuff to do when the mouse leaves the element */
		if($(this).hasClass('saved')){
			$(this).text("favorite");
		} else {
			$(this).text("favorite_border").removeClass('red-text').addClass('black-text');
		}
	});

	// Save the article if the favorite icon is clicked
	// Unsave the article if the favorite icon is clicked again
	$(".save-icon").on('click', function(event) {
		event.preventDefault();

		var articleID = $(this).data('article-id');
		var headline = $(this).data('article-headline');

		if($(this).hasClass('saved')){
			$(this).removeClass('saved red-text').addClass('black-text');
			$(this).text("favorite_border");
			// Run code to remove saved record from the db
			articleCommand["unsave"](articleID)
		} else {
			$(this).addClass('saved red-text').removeClass('black-text');
			$(this).text("favorite");
			// Run code to update record in the db
			articleCommand["save"](articleID,headline);
		}
	}).off('hover');
}

saveIconEventListeners();

	// Remove all cards from the DOM 
	$(".btn-removeAll").on('click', function(event) {
		event.preventDefault();

		articleCommand["removeAll"]();
	});

	$(".brand-logo").hover(function() {
		/* Stuff to do when the mouse enters the element */
		$(this).text("...on today's news?");
	}, function() {
		/* Stuff to do when the mouse leaves the element */
		$(this).text("What's your take...")
	});

// }