$(document).ready(function () {
	$( function() {
		$( "#selected_date" ).datepicker();
		// 02/02/2021
		var now = new Date();
		var day = ("0" + now.getDate()).slice(-2);
		var month = ("0" + (now.getMonth() + 1)).slice(-2);
		var today = (day)+"/"+(month)+"/"+now.getFullYear();  
		$('#selected_date').val(today);
	} );    
});
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