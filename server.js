const WebSocketServer = require('ws');

const wss = new WebSocketServer.Server({ port: 4300 });
const units = [
  {
    id: '4035234',
    type: 'human',
    fio: 'John Doe',
    action: 'Сбойка-1',
    strongestNode: 'А1-23415',
    timestamp: Date.now(),
    position: [0, 0],
  },
  {
    id: '56450349',
    type: 'human',
    fio: 'Albert Einstein',
    action: 'Вентиляционный штрек',
    strongestNode: 'А1-23415',
    timestamp: Date.now(),
    position: [0, 0],
  },
  {
    id: '6480123',
    type: 'vehicle',
    name: 'Car-1',
    action: 'Вентиляционный штрек',
    strongestNode: 'А1-23416',
    timestamp: Date.now(),
    position: [0, 0],
  },
  {
    id: '03455432',
    type: 'vehicle',
    name: 'Car-2',
    action: 'Сбойка-1',
    strongestNode: 'А1-23416',
    timestamp: Date.now(),
    position: [0, 0],
  },
];

wss.on('connection', function connection(ws) {
  ws.send(JSON.stringify(units));
  setInterval(() => {
    units.forEach((unit) => {
      switch (unit.type) {
        case 'human':
          unit.position = [
            unit.position[0] + (Math.random() - 0.5) * 2,
            unit.position[1] + (Math.random() - 0.5) * 2,
          ];
          unit.timestamp = Date.now();
          break;

        case 'vehicle':
          unit.position = [
            unit.position[0] + (Math.random() - 0.5) * 2,
            unit.position[1] + (Math.random() - 0.5) * 2,
          ];
          unit.timestamp = Date.now();
          break;
      }
    });
    ws.send(JSON.stringify(units));
  }, 5000);
});
