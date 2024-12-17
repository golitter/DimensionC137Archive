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

