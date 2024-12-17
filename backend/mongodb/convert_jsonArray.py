import json
###
# 使用`mongoexport`导出是一个json数组，但是每行是一个json对象，这里将其转换为json数组
###
def convert_to_json_array(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        json_list = [json.loads(line) for line in lines]

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(json_list, f, indent=4) 

convert_to_json_array('rm.episodes.json', 'rm.episodes.json')
convert_to_json_array('rm.users.json', 'rm.users.json')
