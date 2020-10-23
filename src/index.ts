import { enviroment } from "./enviroment";
import * as express from "express";

export interface LogData {
  data: LogEntry[];
}

export interface LogEntry {
  date: Date;
  site: Object;
}

const cors = require("cors");
const app = express();
const port = enviroment.port;
let bodyParser = require('body-parser')

app.use(cors(), bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server using Port:${port}`);
});

app.post("/log", (req, res) => {
  let reqData: LogEntry = req.body;

  let logData: LogData;

  let fs = require('fs');

  fs.readFile(__dirname + '/logfiles/Log.txt', function (err, data) {
    if (err) {
      throw err;
    }
    let fileData: LogData = JSON.parse(data.toString());
    fileData.data.push(reqData);
    console.log("Data:", fileData);

    let fsw = require('fs');

    fsw.writeFile('src/logfiles/Log.txt', JSON.stringify(fileData), (err) => {
      if (err) throw err;
      console.log("Write Successfull")
    });
  });
});