from flask import Flask, render_template, flash, request
import requests, json, time, datetime
from pony.orm import *
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
API_KEY = os.environ['API_KEY']
db = Database()

# Database classes

class Movie(db.Entity):
    movie_id = PrimaryKey(int, auto=True)
    imdb_id = Required(str, index=True)
    name = Required(str)
    fi_name = Required(str)
    year = Required(int)
    reviews = Set('Review')

class Review(db.Entity):
    review_id = PrimaryKey(int, auto=True)
    reviewer = Required(str) 
    review_txt = Required(str)
    timestamp = Required(datetime.datetime,default=datetime.datetime.now())
    movie = Required(Movie, column='movie_id')

db.bind(provider='sqlite', filename='mdb.sqlite', create_db=True)
db.generate_mapping(create_tables=True)

@db_session
def find_reviews(imdb_id):
        
        """ Find reviews for this movie from database, if there are any """
        film = Movie.get(imdb_id=imdb_id)
        reviews = []

        if film:
            for r in film.reviews:
                review = {"reviewer": r.reviewer, "review_txt": r.review_txt,
                          "timestamp": r.timestamp}
                reviews.append(review)
                
        return reviews

@db_session
def save_movie(name, fi_name, imdb_id, year, reviewer, review_txt, timestamp):
        
        """ Save review of this movie to database """
        movie_rec = Movie.get(imdb_id=imdb_id)
        
        if not movie_rec:

                movie_rec = Movie(name=name,
                             imdb_id=imdb_id,
                             year=int(year),
                             fi_name=fi_name)
        
                review_rec = Review(reviewer=reviewer,
                            review_txt=review_txt,
                            timestamp=datetime.datetime.now(),
                            movie=movie_rec)
        else:

            review_rec = Review(reviewer=reviewer,
            review_txt=review_txt,
            timestamp=datetime.datetime.now(),
            movie=movie_rec)
        
        return commit()

def find_movie_from_api(imdb_id):
        
        """ Fetch movie data in json format by imbd from omdbapi  """
        url = "http://www.omdbapi.com/?i=" + imdb_id + "&apikey="  + API_KEY
        response = requests.request("GET", url)
        data = json.loads(response.text)

        return data

@app.route('/')
def index():
        ##return render_template('index.html')
        todayFormatted = datetime.datetime.today().strftime('%d.%m.%Y')
        #return render_template('index3.html',todayFormatted=todayFormatted)
        return render_template('index.html',dateFrom=todayFormatted, dateTo=todayFormatted)

@app.route('/submit_review', methods=['POST'])
def submit_review():

        """ Save review and reviewer's name to database """
                   
        reviewer = request.form.get('reviewer')
        review = request.form.get('review')
        name = request.form.get('name')
        fi_name = request.form.get('fi_name')
        imdb_id = request.form.get('imdb_id')
        year = request.form.get('year')
        timestamp = request.form.get('timestamp')
 
        save_movie(name, fi_name, imdb_id, year, reviewer, review, timestamp)

        return "Thank you. Your review was saved!"            

@app.route('/tvresult', methods=['GET', 'POST'])
def tvresult():
       
        """ Find data about upcoming movies on tv """
        selected_date = request.args.get('selected_date')
        selected_date2 = request.args.get('selected_date2')
        actor = request.args.get('actor')
        genre = request.args.get('genre')
        ##days = request.args.get('days')
        
        if not selected_date:
            selectedDateFormatted = datetime.datetime.today().strftime('%Y-%m-%d')
        else:
            selectedDate = datetime.datetime.strptime(selected_date, '%d.%m.%Y')
            selectedDateFormatted = selectedDate.strftime('%Y-%m-%d')
            selectedDate2 = datetime.datetime.strptime(selected_date2, '%d.%m.%Y')
            selectedDate2Formatted = selectedDate2.strftime('%Y-%m-%d')
            
        dates = set()
        dates.add(selectedDateFormatted)
        #dates.add(selected_date)

        """ Collect dates for searching """

        nextDateFormatted = selectedDateFormatted
        x = 1

        while nextDateFormatted < selectedDate2Formatted:
            nextDate = selectedDate + datetime.timedelta(days=x)
            nextDateFormatted = nextDate.strftime ('%Y-%m-%d')
            dates.add(nextDateFormatted)
            x += 1

        """ Loop through dates  """
        movies = []
        for x in dates:

            searchUrl = "https://www.iltalehti.fi/telkku/tv-ohjelmat/" + x + "/peruskanavat/koko-paiva"
                  
            """ Gather data from telkku.com with BeautifulSoup. We are interested
            in movies on public television. From page content, look for 'li' tags.
            """

            page = requests.get(searchUrl)
            soup = BeautifulSoup(page.content, 'html.parser')

            programs = soup.find_all('li')

            """ Loop through tv programs data for current date """
            for y in programs:
               
                """ Movies have the class tag publication__imdb-link. Other data is skipped. """

                imdb_link_cl = y.find(class_="publication__imdb-link")
                if imdb_link_cl is None:
                    continue

                movie_title = y.get("title")    
        
                if movie_title is None:
                    continue     
    
                imdb_link = imdb_link_cl.get('href')
                showdatetime = y.find('time').get("datetime")
                (sdate_tmp, stime_tmp) = showdatetime.split("T")
                showdate = sdate_tmp[8:10] + "." + sdate_tmp[5:7] + "." + sdate_tmp[0:4]

                if showdate > selected_date2:
                    continue

                showtime = stime_tmp[0:5]
                imdb_temp = imdb_link.split("/")
                imdb_id = imdb_temp[len(imdb_temp) - 2]
                channel_cl = y.find(class_="publication__title")
                channel_name_href = channel_cl.get("href")
                channel = get_channel_name(channel_name_href)
                if channel == "Not found":
                    continue
        
                movie_data = find_movie_from_api(imdb_id)
            
                if actor:
                    actors = movie_data['Actors']
                    if not actor in actors:
                        continue
  
                if not genre is None and not "Any" in genre:
                    genres = movie_data['Genre']
                    if not genre in genres:
                        continue

                reviews = find_reviews(imdb_id)
            
                film = {"showtime": showtime, "fi_name": movie_title, "reviews": reviews,
                        "channel": channel, "showdate": showdate, "imdb_id": imdb_id,
                        "img": movie_data['Poster'], "name": movie_data['Title'],
                        "year": movie_data['Year'], "country": movie_data['Country'],
                        "director": movie_data['Director'], "actors": movie_data['Actors'],
                        "genre": movie_data['Genre'], "rated": movie_data['Rated'],
                        "runtime": movie_data['Runtime']}
                
                if film not in movies:
                    movies.append(film)

        #return render_template("results.html", movies=movies)
        #####return render_template("results.html", movies=movies)
        return render_template("results.html", movies=movies, dateFrom=selected_date, dateTo=selected_date2)

def get_channel_name(href_str):
        
        if "/yle-tv1/" in href_str: return "TV 1"
        if "/yle-tv2/" in href_str: return "TV 2"
        if "/mtv3/" in href_str: return "MTV3"
        if "/nelonen/" in href_str: return "Nelonen"
        if "/yle-teema-fem/" in href_str: return "Yle Teema"
        if "/sub/" in href_str: return "Sub"
        if "/tv5/" in href_str: return "TV 5"
        if "/liv/" in href_str: return "Liv"
        if "/jim/" in href_str: return "Jim"
        if "/kutonen/" in href_str: return "Kutonen"
        if "/tlc-finland/" in href_str: return "TLC"
        if "/fox/" in href_str: return "Fox"
        if "/ava/" in href_str: return "Ava"
        if "/hero/" in href_str: return "Hero"
        if "/alfatv/" in href_str: return "AlfaTv"
        if "/frii/" in href_str: return "Frii"

        return "Not found"

if __name__ == '__main__':
    app.run()