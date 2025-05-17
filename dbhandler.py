#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import shutil

path0 = "/home/pmk/cognimap/"
path = path0 + "data/"
dbname = "cognimap19.json"

bckpPath = path0 + ".stversions/data/cme/cmes.db/"
dbPath = path + "cme/cmes.db/"
files = []

for file in os.listdir(bckpPath):
    if '~' not in file:
        continue
    fileList = file.split('~')
    try:
        fileInt = int(fileList[0])
    except:
        continue
    if fileInt > 1293 and ('0012' in fileList[0] or '0013' in fileList[0]):
        newPath = dbPath + fileList[0] + '.ldb'
        oldPath = bckpPath + file
        
        shutil.copy2(oldPath, newPath)
        print(oldPath, newPath)
        files.append(file)

cmdb = json.loads(open(path + dbname, 'r').read())

cmmarkers = []
cmlinks = []
cmproblems = []
cmproblemspos = []
newdb = []

for i in range(len(cmdb)):
    try:
        if cmdb[i]['id'] > 0:
            cmmarkers.append(cmdb[i])
        elif cmdb[i]['id'] < 0:
            cmlinks.append(cmdb[i])
        if cmdb[i]['x0'] < 0 or cmdb[i]['x1'] < 0 or cmdb[i]['y0'] < 0 or \
                cmdb[i]['y0'] < 0:
            cmproblems.append(cmdb[i])
            cmproblemspos.append(i)
        else:
            newdb.append(cmdb[i])
    except:
        cmproblems.append(cmdb[i])
        cmproblemspos.append(i)


len(cmdb)
cmproblems

len(newdb)
with open(path + 'cmnew.json', 'w') as f:
    json.dump(newdb, f)
