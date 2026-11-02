const WebSocket = require('ws');
const crypto = require('crypto');



async function start() {

  for (let id = 1000; id < 6500; id++) {
    if (id % 1000 > 6) {
      continue;
    }

    for (let x = 1; x < 70; x++) {
      try {
        let ws = new WebSocket(`ws://localhost:8300?servid=${id}&uid=s${id}_${x}&token=robtest`);
        await new Promise((resolve, reject) => {
          setTimeout(e => {
            console.log(id, x, "连接")
            return resolve();
          }, 200)
        })

        // let data = {
        //   action: "API",
        //   data: {
        //     path: "role/info/battlearr/pre/set", data: {
        //       uid: '',
        //       servid: 1004,
        //     }
        //   }
        // }


        // ws.send(JSON.stringify(data))

        // let data1 = {
        //   action: "API",
        //   data: {
        //     path: "role/info/battlearr/pvpdef", data: {
        //       key: 'pvpdef',
        //       servid: 1004,
        //     }
        //   }
        // }
        // ws.send(JSON.stringify(data1))



        let data2 = {
          action: "API",
          data: {
            path: "role/pvp/challenge/start", data: {
              key: 'pvpdef',
              servid: 1004,
            }
          }
        }
        ws.send(JSON.stringify(data2))
      } catch (error) {
        console.error(error)
      }

    }
  }
}

start()









