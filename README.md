# chipz
Virtual poker chips for real poker

## Purpose
The purpose of the app is to allow people to play poker with actual cards with their friends without the need for lugging round a case of chips or betting with smarties and peanuts.

## Usage
One player setups the game choosing the starting chips, whether to use blinds, what the starting blinds are and the blind interval. They will be given a unique code for their game with which other players will use to join the game from their devices.
The host will have the chance to arrange the players in the order they are sitting.

When the game starts all players place their phones in-front of them and when it is their turn they are presented with the options fold, check, call or bet (with additional options such as minimum bet, 1/2 the pot, the pot and maximum) as well as a slider to set any amount they choose.

---

# Code
## Server
The server is written in Flask.  
In the directory create an environment (optional) and install the dependencies in requirements.txt (required) with
```bash
$ cd server
server$ python3 -m venv env
server$ source env/bin/activate
(env) server$ pip install -r requirements.txt
(env) server$ python run.py
```
## Client (App)
The app is written in React Native with the Expo framework.  
In the directory, install the dependencies (required) and run with expo/npm/yarn
```bash
cd chipz-app
chipz-app$ npm install
chipz-app$ expo start
```
