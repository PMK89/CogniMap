#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json

path = "/home/pmk/cognimap/data/"
dbname = "cognimap19.json"

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
