### import data to mongodb
mongoimport --db rm --collection episodes --jsonArray .\rm.episodes.json
mongoimport --db rm --collection users --jsonArray .\rm.users.json


### export data from mongodb
mongoexport --db rm --collection episodes --query '{}' --out rm.episodes.json
mongoexport --db rm --collection users --query '{}' --out rm.users.json