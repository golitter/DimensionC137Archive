**Import Database**:

```bash
cd .\mongodb\
```

```shell
mongoimport --db rm --collection episodes --jsonArray .\rm.episodes.json
mongoimport --db rm --collection users --jsonArray .\rm.users.json
```

**Start Backend Service**:

```bash
cd .\rm_service\
```

Install dependencies (conda):

```shell
conda env create -f environment.yml
```

Install dependencies (pip):

```shell
pip install -r requirements.txt
```

**Start the service**:

```shell
python app.py
```



**API Documentation**: [API: Rick & Morty TV series recording site (getpostman.com)](https://documenter.getpostman.com/view/36161327/2sAY4sjjxA)



**Import API Documentation and Test Content**: Open `postman`, click `Import`, and import the json files from `/postman/..`.

