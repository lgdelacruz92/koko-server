import sys
import json

LIMIT = 120 # limit 120 means hsl hue is 0 to 120 (i.e red to green)

def convert_percent_to_hsl(percent, max_val):
    h = LIMIT - int(percent * LIMIT / max_val)
    s = 90
    l = 61
    return (h, s, l)


if __name__ == '__main__':
    filein = sys.argv[1]

    with open(filein, 'r') as in_file:
        max_num = -100000
        min_num = 100000
        lines = []
        for line in in_file:
            file_line = json.loads(line)
            county = file_line[1]
            lines.append(file_line)
            num = float(county['percent'])
            if num > max_num:
                max_num = num
            if num < min_num:
                min_num = num
        for line in lines:
            geo_feature = line[0]
            county = line[1]
            h,s,l = convert_percent_to_hsl(float(county['percent']), max_num)
            geo_feature['properties']['fill'] = f'hsl({h},{s}%,{l}%)'
            print(json.dumps(geo_feature))

