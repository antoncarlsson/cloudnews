#!/usr/bin/python3.7
# -*- coding: iso-8859-15 -*-
import os
import sys
import requests
import json
import math
import uuid
import random

from time import sleep
from dateutil import parser
from datetime import datetime, date, time, timedelta
from bs4 import BeautifulSoup
#from flask import jsonify

import pytz
UTC=pytz.UTC

try:
    # For Python 3.0 and later
    from urllib.request import urlopen
except ImportError:
    # Fall back to Python 2's urllib2
    from urllib2 import urlopen

try:
    # If runing from restapi
    from scrapers.data.svt_globals import URL_SVT, URL_API, svt_regions, used_regions, param_limit, param_page, params
    from scrapers.data.constants import FIRST, LAST, LATER, EARLIER, BEFORE, AFTER
    from scrapers.util.location_search import search_cloud_news
    from scrapers.util.time_checks import *
except ImportError:
    from data.svt_globals import URL_SVT, URL_API, svt_regions, used_regions, param_limit, param_page, params
    from util.location_search import search_cloud_news
    from data.constants import FIRST, LAST, LATER, EARLIER, BEFORE, AFTER
    from util.time_checks import *

BEFORE = True
AFTER = False

def check_svt_name(name):
    if name == 'Väst':
        return 'Västra Götaland'

    if name == 'Sörmland':
        return 'Södermanland'
    
    if name == 'Öst':
        return 'Östergötland'

    return name

def get_news(url, region):


    # Initiate the Beautiful soup
    content = urlopen(url).read()
    soup = BeautifulSoup(content, features='lxml')

    # Get the article part
    main = soup.find(attrs={"class" : "nyh_body__main"})

    # Three texts of the news HEAD - LEAD - BODY
    head = main.find(attrs={"class" : "nyh_article__heading"})
    lead = main.find(attrs={"class" : "nyh_article__lead"})
    body = main.find(attrs={"class" : "nyh_article-body lp_body"})

    # Media of the news
    pict = main.find(attrs={"class" : "lp_track_artikelbild"})

    # Time 
    time = main.find('time')
    date = time['datetime']

    img_url = None
    if pict is not None:
        img_url = pict.find(attrs={"class" : "pic__img pic__img--preloaded pic__img--wide "})['src']

    # A parser making a datetime from the SVT time convention
    dt = parser.parse(date)

    news = {}
    if head is not None:
        news['title'] = head.text
    if lead is not None:
        news['lead']  = lead.text
    if body is not None:
        news['body']  = body.text
    if dt is not None:
        news['datetime']  = dt
    if img_url is not None:  
        news['imgurl'] = img_url

    region = check_svt_name(region)
    news['location'] = {}
    news['location']['county'] = region
    news['location']['country'] = "Sweden"
    news['source'] = "svt"
    news['url']   = url

    return news

def reform_api_news(svt_news_list):
    cloud_news = []

    for svt_news in svt_news_list:
        news = {}
        #print(svt_news['image'])
        # Extract the wanted information
        if 'title'              in svt_news:
            news['title']       = svt_news['title']

        if 'vignette'           in svt_news:
            news['lead']        = svt_news['vignette']

        if 'text'               in svt_news:
            news['body']        = svt_news['text']

        if 'published'          in svt_news:
            news['datetime']    = svt_news['published']

        if 'sectionDisplayName' in svt_news:
            county = check_svt_name(svt_news['sectionDisplayName'])
            news['location']    = { 'county' : county , 'country' : 'Sweden'}

        if 'teaserURL'          in svt_news:
            news['url']         = svt_news['teaserURL']

        if 'image'              in svt_news:
            news['imgurl']      = svt_news['image']['url']

        
        news['id'] = str(uuid.uuid4())
        news['source']  = 'svt'
        #json_news = json.dumps(news, indent=4, sort_keys=True, default=str)
        cloud_news.append(news)

    return cloud_news

def reform_api_news_scrape(svt_news_list):
    cloud_news = []
    for svt_news in svt_news_list:
        URL = svt_news['teaserURL']
        REGION = svt_news['sectionDisplayName']
        cloud_news.append(get_news(URL, REGION))

    return cloud_news

def get_api_news_region(region="/nyheter/lokalt/uppsala/", page=0, amount=50): 
    params_struct = params + param_limit + str(amount) + param_page + str(page)   
    r = requests.get(url = URL_API + region + params_struct)
    
    region_news = r.json(encoding='utf-16')

    region_news = reform_api_news(region_news['auto']['content'])
    return region_news

def get_api_object(region="/nyheter/lokalt/uppsala/", page=0, amount=50):
    params_struct = params + param_limit + str(amount) + param_page + str(page)   
    r = requests.get(url = URL_API + region + params_struct)
    
    region_news = r.json(encoding='utf-16')

    return region_news

def get_news_region(from_, until_, region, use_web = False):


    selected_news = []

    # Get max page info from this region
    start_obj = get_api_object(region = region)
    items = start_obj['auto']['pagination']['totalAvailableItems']
    items = int(items)
    max_pages = math.ceil(items / 50)

    print( "{}{:20}{}{}".format("Region: ", start_obj['auto']['content'][0]['sectionDisplayName'], "pages: ", max_pages))
    region_name = start_obj['auto']['content'][0]['sectionDisplayName']
    obj_list = start_obj['auto']['content']

    # Calculating the approriate start_page
    # by see how many days the first page envelops
    days_per_page = get_time_diff(obj_list[0], obj_list[-1])
    time_diff = get_time_diff(obj_list[0], until_)
    start_page = math.floor(time_diff/days_per_page)

    # page 1 is the starting page, anything lower also works but is redundant        
    if start_page < 1:
        start_page = 1


    # The loops starts with the most recent news, ends with the oldest
    page_nmr = start_page
    can_start = False
    while True:

        if page_nmr > max_pages:
            break

        # This itterates backwards to find the starting position,
        # its a precaution for an underestimated days_per_page
        if page_nmr <= start_page and page_nmr >= 2 and not can_start:
            news_list = get_api_news_region(region=region, page=page_nmr)
            print("Page: ", page_nmr, "  datetime: ", news_list[FIRST]['datetime'], " vs:", until_)
            if check_time(news_list[FIRST], BEFORE, until_):
                page_nmr -= 1
                continue
            else:
                can_start = True

        news_list = get_api_news_region(region=region, page=page_nmr)

        print("Page: ", page_nmr, "  datetime: ", news_list[FIRST]['datetime'], " Len: ", len(news_list))

        # Check if the last item is newer then the until time limit
        if check_time(news_list[LAST], AFTER, until_):
            page_nmr += 1
            continue
        elif check_time(news_list[FIRST], BEFORE, from_):
            break
        else:
            page_nmr += 1
            selected_news += filter(lambda x: check_time_range(x, from_, until_), news_list)
    


    news_list = [ele for ele in selected_news if 'Nyheter från dagen' not in ele['title']]
    print("Amount of news:", len(news_list))
    news_list = [search_cloud_news(ele) for ele in news_list]
    amount = 0
    located_news = []

    for found, ele in news_list:
        if not found and use_web:
            temp_news = get_news(ele['url'], region_name)
            #print(temp_news)
            temp_news = search_cloud_news(temp_news)[1]
            ele['location'] = temp_news['location']
        if 'city' in ele['location']:
            amount += 1
        located_news.append(ele)
        # print (json.dumps(ele, indent=4, sort_keys=True, default=str))

    print("Amount of found cities:", amount)
    #for ele in news:
        #search_text(ele)

    #return selected_news
    print("")
    return located_news

def get_news_selected_regions(from_, until_, regions=used_regions):
    selected_news = []
    for region in regions:
        selected_news += get_news_region(from_, until_, region)
    return selected_news