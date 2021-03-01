# About

My demo application for Code BootCamp 2021. It is a web search engine for upcoming movies on tv.

This application uses following libraries:

- ORM: SQLAlchemy
- Flask for web application development
- Beautiful Soup for pulling data out of HTML pages
- Pipenv for managing dependencies

Application can be easily deployed to Heroku or DigitalOcean. Have been tested only on Python 3.

# Config file

Make sure to create .env file in your project root (see .env_example) which contains your personal API KEY for accessing api data.

# Database

The application communicates with PostgreSQL database, running on Heroku.

# Running application

```shell
# Optional if you don't have pipenv installed
pip install pipenv
pipenv install
pipenv shell
python app.py
```

# Documentation

Documentation can be found in doc folder.

# Author

Mika Pulliainen
