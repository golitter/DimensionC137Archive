import os
import yaml
from types import SimpleNamespace
from pymongo import MongoClient


# Gets the directory of the current file
current_dir = os.path.dirname(__file__)

# Constructs the path to the config.yml file, utils sibling
config_path = os.path.join(current_dir, '../config.yml')

# Recursively convert the dictionary to SimpleNamespace
def dict_to_namespace(d):
    if isinstance(d, dict):
        return SimpleNamespace(**{k: dict_to_namespace(v) for k, v in d.items()})
    elif isinstance(d, list):
        return [dict_to_namespace(item) for item in d]
    else:
        return d

# Parses yaml files into Python objects
def load_config(file_path):
    with open(file_path, 'r') as file:
        config_dict = yaml.safe_load(file)
        return dict_to_namespace(config_dict)

# The configuration is loaded using the constructed relative path
config = load_config(config_path)

client = MongoClient(config.mongo.url)
db = client[config.mongo.database]
# Output config object
print(config)
