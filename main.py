# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python38_app]
# [START gae_python3_app]
from symtable import Symbol
from flask import Flask, send_from_directory, request
import requests
from datetime import datetime
from dateutil.relativedelta import relativedelta
import time

_GLOBAL = {
    "paths": {
        "HTML": './searchPage.html',
        "CSS": './styles.css',
        "Script": './script.js',
        "images": {
            "background-image": './images/back.svg',
            "search-icon": './images/search-solid.svg',
            "cancel-icon": './images/times-solid.svg',
            "warning-icon": './images/yellow-warning.jpg',
            "green-arrow": './images/GreenArrowUp.png',
            "red-arrow": './images/RedArrowDown.png'
        }
    },
    "API_URL": 'https://my-csci-homework-project.wl.r.appspot.com/',
    "FH_API_KEY" : 'c7tlkhqad3i8dq4u6hog',
    "FH_SANDBOX_API_KEY" : 'sandbox_c7tlkhqad3i8dq4u6hp0',
    "FH_URL" : 'https://finnhub.io/api/v1/'
}


# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__, static_url_path='/static_files')
app.config['STATIC_PATH'] = "./static_files"


@app.route('/homepage')
def homepage():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['HTML'])

@app.route('/resources/CSS')
def getCSS():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['CSS'])

@app.route('/resources/background_image')
def getBGImage():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['images']['background-image'])

@app.route('/resources/search_icon')
def getSearchIcon():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['images']['search-icon'])

@app.route('/resources/cancel_icon')
def getCancelIcon():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['images']['cancel-icon'])

@app.route('/resources/warning_icon')
def getWarningIcon():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['images']['warning-icon'])

@app.route('/resources/green_arrow')
def getGreenArrow():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['images']['green-arrow'])

@app.route('/resources/red_arrow')
def getRedArrow():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['images']['red-arrow'])

@app.route('/resources/script')
def getScript():
    return send_from_directory(app.config['STATIC_PATH'], _GLOBAL['paths']['Script'])

@app.route('/data/get_details_finnhub', methods=['GET'])
def getFinnhubDetails():
    symbol = request.args.get('symbol').upper()
    path = 'stock/profile2?symbol='
    r = requests.get(_GLOBAL['FH_URL'] + path + str(symbol) + "&token=" + _GLOBAL['FH_API_KEY'])
    result = r.json()
    return result

@app.route('/data/get_additional_details_finnhub', methods=['GET'])
def getAdditionalDetails():
    symbol = request.args.get('symbol').upper()
    result = {'ticker': symbol}
    path = 'quote?symbol='
    s = requests.get(_GLOBAL['FH_URL'] + path + str(symbol) + "&token=" + _GLOBAL['FH_API_KEY'])
    result.update(s.json())
    path = 'stock/recommendation?symbol='
    t = requests.get(_GLOBAL['FH_URL'] + path + str(symbol) + "&token=" + _GLOBAL['FH_API_KEY'])
    temp = {
        "recommendation": t.json()
    }
    result.update(temp)
    path = 'company-news?symbol='
    NOW = datetime.today()
    BEFORE_30 = NOW + relativedelta(days=-30)
    t = requests.get(_GLOBAL['FH_URL'] + path + str(symbol) + "&from=" + BEFORE_30.strftime('%Y-%m-%d') + "&to=" + NOW.strftime('%Y-%m-%d') + "&token=" + _GLOBAL['FH_API_KEY'])
    temp = {
        "news": t.json()
    }
    result.update(temp)
    path = 'stock/candle?symbol='
    BEFORE_6_MONTHS = NOW + relativedelta(months=-6, days=-1)
    t = requests.get(_GLOBAL['FH_URL'] + path + str(symbol) + "&resolution=D" + "&from=" + str(int(time.mktime(BEFORE_6_MONTHS.timetuple()))) +  "&to=" + str(int(time.mktime(NOW.timetuple()))) + "&token=" + _GLOBAL['FH_API_KEY'])
    temp = {
        "stock-time-series": t.json()
    }
    result.update(temp)
    return result

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    app.run(port=8080, debug=True)
# [END gae_python3_app]
# [END gae_python38_app]
