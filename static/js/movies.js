$(document).ready(function(){
	$(".review_button").click(function () {

		   var parentdiv = $(this).parent();
		   var reviewer_name = parentdiv.find('#reviewer').val();
		   var review_txt = parentdiv.find('#review_txt').val();
		   var movie_name = parentdiv.find('#name').val();
		   var imdb_tt = parentdiv.find('#imdb_id').val();
		   var movie_fi = parentdiv.find('#fi_name').val();
		   var movie_year = parentdiv.find('#year').val();
		   var ts = Math.round(new Date().getTime()/1000);
		   var now = new Date;
		     
		   $.ajax({
			 type: 'POST',
			 url: "/submit_review",
			 data: {reviewer: reviewer_name, review: review_txt, 
				   name: movie_name, fi_name: movie_fi, imdb_id: imdb_tt, 
				   year: movie_year,timestamp: ts},
			 dataType: "text",
			 success: function(result){
					   // Clear review and reviewer's name on the form
					   var reviewPage = $('#' + imdb_tt + 'Comment')[0];
					   reviewPage.children.review_txt.value = "";
					   reviewPage.children.reviewer.value = "";
					   //
   
					   // Find review tab and display saved review
					   var reviews = $('#' + imdb_tt + 'Reviews')[0];
			   
					   const newReview = document.createElement('div');
					   newReview.style.backgroundColor = "#c2c8fc";
					   timestamp = now.toString().split("GMT")[0]
					   var innerTxt = "<p><b>" + reviewer_name + "</b>";
					   innerTxt += " wrote on " + timestamp + ":</p> ";
					   innerTxt += "<p>" + review_txt + "</p>";        
					   newReview.innerHTML = innerTxt    
				 	   reviews.prepend(newReview);
					   alert(result)
					  
				   }
		   });
	   });
});

// Data received, build HTML page

var dateStr = "";
var htmlStr = "";
var imdbStr = "https://www.imdb.com/title/"

// Sort data by showdate & time
movieData.sort((a, b) => {
	a_str = a.showdate.slice(6, 10) + a.showdate.slice(3, 5) + a.showdate.slice(0, 2);
	b_str = b.showdate.slice(6, 10) + b.showdate.slice(3, 5) + b.showdate.slice(0, 2);
	if (a_str+a.showtime < b_str+b.showtime) return -1
	return a.showdate > b.showdate ? 1 : 0
})

// Loop through data. First create container for everything.

console.log(movieData.length);

if (movieData.length < 1) {
	htmlStr += "<p>No results.</p>";
}

for (i = 0; i < movieData.length; i++) 
{
	if (movieData[i].showdate != dateStr)
	{
		// If next movie's showdate is different, close previous day's div
		// and present next date
		if (i > 0) { htmlStr += "</div>" };
	
		htmlStr += '<h2 style="text-align: center;">' + movieData[i].showdate + "</h2>";
		dateStr = movieData[i].showdate;
		
		// Display three movies (or less) on each row
		htmlStr += '<div class="row">';
	}

	/* Create column for a movie. Within column, toprow contains poster (left),
	director and cast (right).	*/
	htmlStr += '<div class="column" style="background-color:#898bed;">';
	htmlStr += '<div class="toprow">';
	
	htmlStr += '<div class="topleft">';
    htmlStr += '<a href=' + imdbStr + movieData[i].imdb_id + ' target="_blank">';
    htmlStr += '<img src="' + movieData[i].img + ' alt=""></a>';
	htmlStr += "</div>" // Close topleft
	
	htmlStr += '<div class="topright">';
	htmlStr += "<b>" + movieData[i].name + " (" + movieData[i].year + ")</b><br>";
	htmlStr += 'Directed by: ' + movieData[i].director + "<br>";
	htmlStr += "Starring: " + movieData[i].actors;
	htmlStr += "</div>"; // Close topright
		
	htmlStr += "</div>"; // Close toprow
	
	/* Create tab for movie, and buttons (tablinks) for tab content page selection. 
	Include imbd id for identification. There are three content pages for tab: 
	1) Info 2) Comment (write review) 3) Reviews */
	
	htmlStr += '<div id=' + movieData[i].imdb_id + ' class="tab">';
	htmlStr += '<button style="display:block" className = "active" class="tablinks" onclick="openPage(event,'; 
	htmlStr += "'Info'" + ",'";
	htmlStr += movieData[i].imdb_id + "'" + ')">Info</button>';
		
	htmlStr += '<button class="tablinks" onclick="openPage(event,'; 
	htmlStr += "'Comment'" + ",'";
	htmlStr += movieData[i].imdb_id + "'" + ')"> Comment</button > ';
	 
    htmlStr += '<button class="tablinks" onclick="openPage(event,';
	htmlStr += "'Reviews'" + ",'";
	htmlStr += movieData[i].imdb_id + "'" + ')">Reviews</button>';

	htmlStr += "<div id=";
	// Set selection on Info page and add contents
	htmlStr += movieData[i].imdb_id + "Info" + ' class="tabcontent" style="display:block">';	
	htmlStr += "<br>";
	htmlStr += '<p><b>' + movieData[i].channel + " " + movieData[i].showtime + "</b>";
	htmlStr += " (" + movieData[i].runtime + ")</p>";
	htmlStr += '<p>' + movieData[i].plot + "</p>"
    
    htmlStr += "</div>"; // Close Info page div

	/*  Create second content page for movie. Contains a review form with submit button.
	Use imdb id for identification. Hidden fields used to store information for the review */

	htmlStr += "<div id=";
	htmlStr += movieData[i].imdb_id + "Comment" + ' class="tabcontent">';
	htmlStr += '<input type="hidden" id="imdb_id" name="imdb_id"'; 
    htmlStr += 'value = "' + movieData[i].imdb_id + '"></input>';
    htmlStr += '<input type="hidden" id="name" name="name"';
	htmlStr += 'value = "' + movieData[i].name + '"></input>';
	htmlStr += '<input type="hidden" id="fi_name" name="fi_name"';
	htmlStr += 'value = "' + movieData[i].fi_name + '"></input>';
	htmlStr += '<input type="hidden" id="year" name="year"';
	htmlStr += 'value = "' + movieData[i].year + '"></input>'; 

	// Create input field for name, text area for review, and a submit button  
    
	htmlStr += '<input style="background-color: #c2c8fc; width:100%" type="text" id="reviewer" name="reviewer" placeholder = "Your name..." required>';
	htmlStr += '<textarea style="background-color: #c2c8fc; width:100%; height:50%" class="textinput" placeholder="Comment"></textarea>';
	htmlStr += '<button style="border: 1px solid grey;background-color: #c2c8fc;" class="review_button" id="but" value="but" name="but">Submit</button>';
	htmlStr += "</div>"; // Close Comment page div	

	/*  Create third content page, for reviews about the movie.
	Sort movie's reviews. Most recent is displayed first. */

    htmlStr += "<div " + 'style="font-size:0.8vw;overflow:scroll;"' + " id=";
	htmlStr += movieData[i].imdb_id + "Reviews" + ' class="tabcontent">';
     
    var reviewsTmp = movieData[i].reviews;
    var reviews = reviewsTmp.sort(SortByDate)

    for (r = 0; r < reviews.length; r++){
		htmlStr += "<br>";	
		htmlStr += '<div style="background-color:#c2c8fc;">';
        htmlStr += "<p><b>" + reviews[r].reviewer + "</b>";
        htmlStr += " wrote on " + reviews[r].timestamp.toString().split("GMT")[0] + ":</p>";
        htmlStr += "<p>" + reviews[r].review_txt + "</p>";        
		htmlStr += "</div>"; 
	}

	htmlStr += "</div>"; // Close Reviews page div.
	htmlStr += "</div>" // Close tab div
	htmlStr += '</div>'; // Close column div
		
}
// Close container div
htmlStr += '</div>';

// Set constructed HTML string as page content	
var el = document.querySelector("#app");
el.innerHTML = htmlStr;

// Set info tab as default selection for every movie
tl = document.getElementsByClassName("tablinks");
for (i = 0; i < tl.length; i++) {
    if (tl[i].innerText == "Info") {
        tl[i].className += " active";
	}
}
function SortByDate(a, b){
    var aD = new Date(a.timestamp).getTime(), bD = new Date(b.timestamp).getTime(); 
    return ((aD > bD) ? -1 : ((aD < bD) ? 1 : 0));
}
function openPage(evt, pageName, imdbId) {
	var i, tabcontent, tablinks;
	var imdbIdPageName = imdbId + pageName;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		if (tabcontent[i].parentNode.id == imdbId) {
			tabcontent[i].style.display = "none";
		}  	  
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
            if (tablinks[i].parentNode.id == imdbId) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
	}
	document.getElementById(imdbIdPageName).style.display = "block";
	evt.currentTarget.className += " active";
}