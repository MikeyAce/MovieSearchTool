from flask import Flask, render_template, flash, request
import requests, json, time, datetime
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
# Alchemy alla
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine, Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship

app = Flask(__name__)
load_dotenv()

Base = declarative_base()

## Database classes 

class Movie(Base):
  
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True)
    imdb_id = Column(String(50))
    name = Column(String(255))
    fi_name = Column(String(255))
    reviews = relationship("Review")	
    
    def __repr__(self):
        return "<Movie (name='%s', fi_name='%s', imdb_id='%s')>" % (self.name, self.fi_name, self.imdb_id)

class Review(Base):
  
    __tablename__ = 'reviews'

    id = Column(Integer, primary_key=True)
    reviewer = Column(String(20))
    review_txt = Column(String(255))
    timestamp = Column(DateTime, default=datetime.datetime.now())
    movie_id = Column(Integer, ForeignKey('movies.id'))
    
    def __repr__(self):
        return "<Review (reviewer='%s', review_txt='%s', timestamp='%s')>" % (self.reviewer, self.review_txt, self.timestamp)

# Config vars and session
API_KEY = os.environ['API_KEY']
DATABASE_URL = os.environ['DATABASE_URL']
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

Base.metadata.create_all(engine)
""" Create tables """

# Method for returning session:
def __get_session():
    return Session()

def find_reviews(imdb_id):
        
        """ Find reviews for this movie from database, if there are any """
        film = __get_session().query(Movie).filter_by(imdb_id=imdb_id).first()
        reviews = []

        if film:
            for r in film.reviews:
                review = {"reviewer": r.reviewer, "review_txt": r.review_txt,
                          "timestamp": r.timestamp}
                reviews.append(review)
                
        return reviews

def save_movie_and_review(name, fi_name, imdb_id, reviewer, review):
        
        """ Save review of this movie to database """
        db = __get_session()
        movie_rec = db.query(Movie).filter_by(imdb_id=imdb_id).first()

        if not movie_rec:

            movie_rec = Movie(name=name,
                    imdb_id=imdb_id,
                    fi_name=fi_name)

            db.add(movie_rec)
            db.commit()

        movie_id = movie_rec.id

        review_rec = Review(reviewer=reviewer,
                    review_txt=review,
                    timestamp=datetime.datetime.now(),
                    movie_id=movie_id)

        db.add(review_rec)
        db.commit()
        review_id = review_rec.id
        db.close()

        return review_id

def save_movie(name, fi_name, imdb_id):
        
        """ Save this movie to database """
        
                #movie_rec = Movie(name=name,
                #             imdb_id=imdb_id,
                #             year=int(year),
                #             fi_name=fi_name)

        movie_rec = Movie(name=name,
                    imdb_id=imdb_id,
                    #year=int(year),
                    fi_name=fi_name)

        db = __get_session()
        db.add(movie_rec)
        db.commit()
        #id = movie_rec.id
        db.close()

        return movie_rec            

def save_review(movie_id, reviewer, review_txt):
        
        """ Save this review to database """

        review_rec = Review(reviewer=reviewer,
                            review_txt=review_txt,
                            timestamp=datetime.datetime.now(),
                            movie_id=movie_id)
                            #movie=movie_rec)

        db = __get_session()
        db.add(review_rec)
        db.commit()
        print("ARVIO IN TIETOKANTA!")
        #id = review_rec.id
        db.close()
        return review_rec            

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
        return render_template('index3.html',dateFrom=todayFormatted, dateTo=todayFormatted)

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

        # Save review and movie first, if no record yet
        review_id = save_movie_and_review(name, fi_name, imdb_id, reviewer, review)
        if review_id:
            return "Thank you, " + reviewer + ". Your review was saved!"
        else:
            return "Something went wrong!"            

@app.route('/tvresult', methods=['GET', 'POST'])
def tvresult():
       
        """ Find data about upcoming movies on tv """
        selected_date = request.args.get('selected_date')
        selected_date2 = request.args.get('selected_date2')
        actor = request.args.get('actor')
        genre = request.args.get('genre')
        
        if not selected_date:
            selectedDateFormatted = datetime.datetime.today().strftime('%Y-%m-%d')
        else:
            selectedDate = datetime.datetime.strptime(selected_date, '%d.%m.%Y')
            selectedDateFormatted = selectedDate.strftime('%Y-%m-%d')
            selectedDate2 = datetime.datetime.strptime(selected_date2, '%d.%m.%Y')
            selectedDate2Formatted = selectedDate2.strftime('%Y-%m-%d')
            
        dates = set()
        dates.add(selectedDateFormatted)

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

                showdate_obj = datetime.datetime.strptime(showdate, '%d.%m.%Y')

                if showdate_obj > selectedDate2:
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

        return render_template("results3.html", movies=movies, dateFrom=selected_date, dateTo=selected_date2)

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