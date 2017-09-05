#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Sat Sep  2 10:44:51 2017

@author: rodgeryuan
"""
import requests
import pandas as pd
import numpy as np

def main():
    
    years = range(2000,2017)
    
    for year in years:
        print 'DOING YEAR: ' + str(year)
        
        link_year = str(year) + '-' + str(year+1)[2:4]
        
        uast_url = 'http://stats.nba.com/stats/leaguedashplayerstats' + \
            '?College=&Conference=&Country=&DateFrom=&DateTo=&Division=&' + \
            'DraftPick=&DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&'+ \
            'LeagueID=00&Location=&MeasureType=Scoring&Month=0&OpponentTeamID=0&' + \
            'Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&' + \
            'PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=' + \
            link_year + \
            '&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&' + \
            'StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight='  
    
        eff_url = 'http://stats.nba.com/stats/leaguedashplayerstats?College=' + \
            '&Conference=&Country=&DateFrom=&DateTo=&Division=&DraftPick=&' + \
            'DraftYear=&GameScope=&GameSegment=&Height=&LastNGames=0&LeagueID=00' + \
            '&Location=&MeasureType=Advanced&Month=0&OpponentTeamID=0&Outcome=' + \
            '&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=' + \
            '&PlayerPosition=&PlusMinus=N&Rank=N&Season=' + \
            link_year + \
            '&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=' + \
            '&StarterBench=&TeamID=0&VsConference=&VsDivision=&Weight='

        uast_response = requests.get(
                uast_url, headers = {'User-Agent': 'Mozilla/5.0'}
                ).json()['resultSets'][0]['rowSet'] 
        
        eff_response = requests.get(
                eff_url, headers = {'User-Agent': 'Mozilla/5.0'}
                ).json()['resultSets'][0]['rowSet'] 

        data_array = []
        
        for index in range(len(uast_response)):
            if uast_response[index][5] > 30 and \
                            uast_response[index][9] > 10: #GP>20 and min/g>10
                data_array.append(
                        [uast_response[index][1], #name
                         uast_response[index][3], #team
                         uast_response[index][9], #min
                         uast_response[index][24], #uast
                         eff_response[index][21] #ts
                        ])

        data = pd.DataFrame(data_array, columns = ['name', 'team', 'min', 'uast', 'ts'])
    
        for team_abr in list(data['team'].unique()):
            data.to_csv('../../data/' + link_year + '_effvsts.csv', index = False)
