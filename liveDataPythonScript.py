import requests
r = requests.get('http://13.233.77.13:5000/getLiveSensorData', auth=('user', 'pass'))
r.status_code
r.headers['content-type']
r.encoding
r.text
print(r.json())