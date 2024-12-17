**导入数据库**：

```bash
cd .\mongodb\
```

```shell
mongoimport --db rm --collection episodes --jsonArray .\rm.episodes.json
mongoimport --db rm --collection users --jsonArray .\rm.users.json
```

**启动后端服务**：

```bash
cd .\rm_service\
```

安装库依赖（conda）：

```shell
conda env create -f environment.yml
```

安装库依赖（pip）：

```shell
pip install -r requirements.txt
```

启动服务：

```shell
python app.py
```



**API文档**：[API: Rick & Morty TV series recording site (getpostman.com)](https://documenter.getpostman.com/view/36161327/2sAY4sjjxA)

**API文档和测试内容导入**：打开`postman`，点击`Import`，将`/postman/..`内的json文件导入。

