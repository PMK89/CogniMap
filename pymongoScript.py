#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Jan  9 11:21:47 2023

@author: pmk
"""

import pymongo
import json

myclient = pymongo.MongoClient("mongodb://localhost:27017/")

mydb = myclient["cognimap"]

path = '/home/pmk/cognimap/data/'

jsonDb = json.load(open(path + 'cognimap23.json', 'r'))

cmElements = mydb['cmes']

cme = jsonDb[1234]

for cme in jsonDb:
    if '_id' in cme:
        del cme['_id']
    cmElements.insert_one(cme)