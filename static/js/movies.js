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
					   // TYHJENNÄ KIRJOITETTU ARVIO JA ARVIOIJAN NIMI!!
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
// Data received, construct HTML page

var dateStr = "";
var htmlStr = "";
var imdbStr = "https://www.imdb.com/title/"

// Sort data by date and time.
movieData.sort((a, b) => {
	a_str = a.showdate.slice(6, 10) + a.showdate.slice(3, 5) + a.showdate.slice(0, 2);
	b_str = b.showdate.slice(6, 10) + b.showdate.slice(3, 5) + b.showdate.slice(0, 2);
	if (a_str+a.showtime < b_str+b.showtime) return -1
	return a.showdate > b.showdate ? 1 : 0
})

// Loop through received data
for (i = 0; i < movieData.length; i++) 
{		
	// NYT TARKISTUS, ONKO LAJITYYPPI / OHJAAJA / MUU MITÄ HAETTIIN...
	if (movieData[i].showdate != dateStr)
	{
		// If next movie's showdate is different, close previous day's div
		// and print next date
		if (i > 0) { htmlStr += "</div>" };
	
		htmlStr += '<h2 style="text-align: center;">' + movieData[i].showdate + "</h2>";
		dateStr = movieData[i].showdate;
				
		// Luo container class diveille
		
		htmlStr += '<div class="row">';
	}

	// NYT SITTEN TEE DIV JOKAISELLE TÄMÄN PÄIVÄN FILMILLE!

	htmlStr += '<div class="column" style="background-color:#898bed;">';
	htmlStr += '<div class="toprow">';
		
	// ALOITA TOP_LEFT
    // TEE KUVASTA LINKKI IMDb:hen!!!
	htmlStr += '<div class="topleft">';
    htmlStr += '<a href=' + imdbStr + movieData[i].imdb_id + ' target="_blank">';
    htmlStr += '<img src="' + movieData[i].img + ' alt=""></a>';

	htmlStr += "</div>" /* Suljetaan topleft */

	// ALOITA TOP_RIGHT	--->
	htmlStr += '<div class="topright">';

	htmlStr += "<b>" + movieData[i].name + " (" + movieData[i].year + ")</b><br>";
	htmlStr += 'Directed by: ' + movieData[i].director + "<br>";
	htmlStr += "Starring: " + movieData[i].actors;

	// KOKEILLAAN ARVION LISÄÄMISTÄ SIVULLE ERILLISELLÄ NAPILLA...

	htmlStr += "</div>"; // SULJE TOP_RIGHT
		
	// SULJE TOPROW!
	htmlStr += "</div>";
	
	// ALOITA MIDDLEROW, JONKA SISÄÄN KAKSI DIVIÄ:
	// NYT ALOITETAANKIN TAB!!
	// LAITETAAN ID PÄÄDIVILLE, KOSKA NÄITÄ TULEE USEAMPI
	htmlStr += '<div id=' + movieData[i].imdb_id + ' class="tab">';

	/* Create buttons for tab selection. Include imbd id for identification. 
	There are three tabs: 1) Info 2) Comment (write review) 3) Reviews */	

	htmlStr += '<button style="display:block" className = "active" class="tablinks" onclick="openPage(event,'; 
	htmlStr += "'Info'" + ",'";
	htmlStr += movieData[i].imdb_id + "'" + ')">Info</button>';
		
	htmlStr += '<button class="tablinks" onclick="openPage(event,'; 
	htmlStr += "'Comment'" + ",'";
	htmlStr += movieData[i].imdb_id + "'" + ')"> Comment</button > ';
	 
    htmlStr += '<button class="tablinks" onclick="openPage(event,';
	htmlStr += "'Reviews'" + ",'";
	htmlStr += movieData[i].imdb_id + "'" + ')">Reviews</button>';

	// <<=============== ENSIMMÄINEN TAB ========================>>

	// Create tab contents accordingly

	htmlStr += "<div id=";

	// Set selection on Info tab
	htmlStr += movieData[i].imdb_id + "Info" + ' class="tabcontent" style="display:block">';	

	htmlStr += "<br>";
	htmlStr += "<b>" + movieData[i].channel + " " + movieData[i].showtime + "</b>";
	htmlStr += " (" + movieData[i].runtime + ")";
	htmlStr += "<hr>";

    htmlStr += "<p><b>" + "Country: </b>" + movieData[i].country + "<br>";
	htmlStr += "<b>Genre: </b>" + movieData[i].genre + "<br>";
    htmlStr += "<b>Rated: </b>" + movieData[i].rated + "</p>"; 

    htmlStr += "</div>"; // SULJETAAN SISÄLTÖTAB

	// <<=============== TOINEN TAB ========================>>

	// Create second tab for movie. Includes a review form with submit button.
	// Use imdb id for identification

	htmlStr += "<div id=";
	htmlStr += movieData[i].imdb_id + "Comment" + ' class="tabcontent">';
		
	// Hidden fields used to store information for saving the review

	htmlStr += '<input type="hidden" id="imdb_id" name="imdb_id"'; 
    htmlStr += 'value = "' + movieData[i].imdb_id + '"></input>';
    htmlStr += '<input type="hidden" id="name" name="name"';
	htmlStr += 'value = "' + movieData[i].name + '"></input>';
	htmlStr += '<input type="hidden" id="fi_name" name="fi_name"';
	htmlStr += 'value = "' + movieData[i].fi_name + '"></input>';
	htmlStr += '<input type="hidden" id="year" name="year"';
	htmlStr += 'value = "' + movieData[i].year + '"></input>'; 

	// Create input field for name, text area for review, and a submit button  
    
    htmlStr+="<br>"
    htmlStr += 'Name: <input style="background-color: #c2c8fc;" type="text" id="reviewer" maxlength="20" size="20" name="reviewer" placeholder = "Your name..." required>';
	htmlStr += '<textarea class="reviews" id="review_txt" name="review_txt" rows="3"';
	htmlStr += 'cols = "35" placeholder = "Your review..." required></textarea><br>';
    htmlStr += '<button style="border: 1px solid grey;background-color: #c2c8fc;" class="review_button" id="but" value="but" name="but">Submit</button>';
    
	htmlStr += "</div>"; // SULJETAAN SISÄLTÖTAB	

	// <<=============== KOLMAS TAB ========================>>

    htmlStr += "<div " + 'style="font-size:0.8vw;overflow:scroll;"' + " id=";

	htmlStr += movieData[i].imdb_id + "Reviews" + ' class="tabcontent">';

    // Sort movie's reviews. Most recent is displayed first.    

    var reviewsTmp = movieData[i].reviews;
    var reviews = reviewsTmp.sort(SortByDate)    

    // LAJITTELU TEHTY

    for (r = 0; r < reviews.length; r++){
		htmlStr += "<br>";	
		htmlStr += '<div style="background-color:#c2c8fc;">';
        htmlStr += "<p><b>" + reviews[r].reviewer + "</b>";
        htmlStr += " wrote on " + reviews[r].timestamp.toString().split("GMT")[0] + ":</p>";
        htmlStr += "<p>" + reviews[r].review_txt + "</p>";        
		htmlStr += "</div>"; 
	}

	htmlStr += "</div>"; // SULJETAAN SISÄLTÖTAB
	htmlStr += "</div>" // Suljetaan tab class!

	// SITTEN MÄÄRITELLÄÄN SISÄLLÖT ----------->
	// NÄMÄ NYT PITÄS SAADA SINNE SISÄÄN...

	htmlStr += '</div>'; // COLUMN KIINNI KOKEEKSI TÄSSÄ, TÄMÄ OLI ALEMPANA KYL...
		
}
// Set constructed HTML string as page content	
var el = document.querySelector("#app");
el.innerHTML = htmlStr;

// Nyt vielä aseta kaikille Ensimmäinen tablin valituksi?!
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
	// NYT LUUPATAAN NE CONTENTIT, JOIDEN PARENTIN ID OIKEA...
	for (i = 0; i < tabcontent.length; i++) {
		if (tabcontent[i].parentNode.id == imdbId) {
			tabcontent[i].style.display = "none";
		}  	  
	}
	// JA NYT TABLINKSIT SAMALLA PERIAATTEELLA...
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		//if (tabcontent[i].parentNode.id == imdbId) {
            if (tablinks[i].parentNode.id == imdbId) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}
	}
	document.getElementById(imdbIdPageName).style.display = "block";
	evt.currentTarget.className += " active";
}