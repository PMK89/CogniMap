#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Jan 25 14:06:36 2022

@author: pmk
"""
import shutil
import os

versionsPath = '/home/pmk/cognimap/.stversions/data/cme/cmes.db/'
dbPath = Path = '/home/pmk/cognimap/data/cme/cmes.db/'
for file in os.listdir(versionsPath):
    for i in range(765, 796):
        searchStr = '000' + str(i)
        if file.find(searchStr) > -1:
            newFile = searchStr + '.ldb'
            shutil.copy(versionsPath + file, dbPath + newFile)
            print(newFile)
