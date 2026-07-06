const fs = require('fs');
let data = fs.readFileSync('src/albums.json', 'utf8');

data = data.replace(/"title": "BEYONCÉ.*"/, '"title": "BEYONCÉ"');
data = data.replace(/"title": "Vulnicura Strings.*"/, '"title": "Vulnicura Strings"');
data = data.replace(/"title": "At The Beach, In Every Life.*"/, '"title": "At The Beach, In Every Life"');
data = data.replace(/"title": "Requiem.*"/, '"title": "Requiem"');
data = data.replace(/"title": "DISCO.*"/, '"title": "DISCO"');
data = data.replace(/"title": "Tension.*"/, '"title": "Tension"');
data = data.replace(/"title": "Ultraviolence.*"/, '"title": "Ultraviolence"');
data = data.replace(/"title": "choke enough.*"/, '"title": "choke enough"');
data = data.replace(/"title": "Carrie.*"/, '"title": "Carrie & Lowell"');

fs.writeFileSync('src/albums.json', data);
