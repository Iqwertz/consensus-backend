import { enviroment } from "./enviroment";
import * as express from "express";
import { createBrotliCompress } from "zlib";

const roomStore: Map<string, string> = new Map<string, string>(); //zweiten String mit dem room objekt ersetzen

const cors = require("cors");
const app = express();
const port = enviroment.port;
let bodyParser = require("body-parser");

export interface RoomIdsLog {
  data: RoomIds[];
}

export interface RoomIds {
  roomId: string;
  creatorId: string;
}

export interface roomlistentry {
  entrydata: string;
  date?: Date;
  votes: string[];
  id: number;
}

export interface RoomObject {
  titel: string;
  url: string;
  roomId: string;
  creatorId: string;
  creationDate: Date;
  description: string;
  parNames: string[];
  data: roomlistentry[];
}

export interface PollResponse {
  titel: string;
  description: string;
  roomId: string;
  parNames: string[];
  data: roomlistentry[];
}

export interface ServerStatusResponse {
  serverMessage: string;
}

export interface NewVote {
  roomId: string;
  name: string;
  voteIds: number[];
}

let usedIds: RoomIdsLog;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Servus! Hier gibts nix!");
});

app.listen(port, () => {
  console.log(`Server using Port:${port}`);
});

app.post("/new", (req, res) => {
  let newRoomIds: RoomIds;

  let fs = require("fs");

  fs.readFile(__dirname + "/data/roomIds.json", function (err, data) {
    if (err) {
      throw err;
    }
    let fileData: RoomIdsLog = JSON.parse(data.toString());
    usedIds = fileData;
    newRoomIds = {
      roomId: getNewRoomId(8),
      creatorId: getNewRoomId(10),
    };
    fileData.data.push(newRoomIds);

    let fsw = require("fs");

    fsw.writeFile(
      __dirname + "/data/roomIds.json",
      JSON.stringify(fileData),
      (err) => {
        if (err) throw err;
        console.log("Write Successfull");
        res.json(newRoomIds);
      }
    );
  });
});

app.post("/create", (req, res) => {
  let reqData: RoomObject = req.body;
  let fs = require("fs");

  fs.readFile(__dirname + "/data/roomIds.json", function (err, data) {
    if (err) {
      throw err;
    }
    let fileData: RoomIdsLog = JSON.parse(data.toString());
    if (fileData.data.some((ids) => ids.roomId == reqData.roomId)) {
      createRoom(reqData, res);
    }
  });
});

app.post("/getPollData", (req, res) => {
  let reqData: RoomIds = req.body;
  let fs = require("fs");

  fs.readFile(
    __dirname + "/data/rooms/" + reqData.roomId + "/poll.json",
    function (err, data) {
      if (err) {
        if (err.code == "ENOENT") {
          res.status(400).send({
            message: "PollIdNotFound",
          });
        } else {
          res.status(400).send({
            message: "ServerError",
          });
        }
      } else {
        let fileData: RoomObject = JSON.parse(data.toString());
        if (fileData.creatorId == reqData.creatorId) {
          res.json(fileData);
        } else {
          res.status(400).send({
            message: "PollIdNotFound",
          });
        }
      }
    }
  );
});

app.post("/getPoll", (req, res) => {
  let reqData = req.body;
  let fs = require("fs");

  fs.readFile(
    __dirname + "/data/rooms/" + reqData.roomId + "/poll.json",
    function (err, data) {
      if (err) {
        if (err.code == "ENOENT") {
          res.status(400).send({
            message: "PollIdNotFound",
          });
        } else {
          res.status(400).send({
            message: "ServerError",
          });
        }
      } else {
        let fileData: RoomObject = JSON.parse(data.toString());
        let responseData: PollResponse = {
          titel: fileData.titel,
          description: fileData.description,
          parNames: fileData.parNames,
          roomId: fileData.roomId,
          data: fileData.data,
        };
        res.json(responseData);
      }
    }
  );
});

app.post("/setVote", (req, res) => {
  let reqData: NewVote = req.body;
  let fs = require("fs");

  fs.readFile(
    __dirname + "/data/rooms/" + reqData.roomId + "/poll.json",
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        let fileData: RoomObject = JSON.parse(data.toString());
        if (!fileData.parNames.includes(reqData.name)) {
          fileData.parNames.push(reqData.name);
          for (let entry of fileData.data) {
            if (reqData.voteIds.includes(entry.id)) {
              entry.votes.push(reqData.name);
            }
          }
          let fsw = require("fs");

          fsw.writeFileSync(
            __dirname + "/data/rooms/" + reqData.roomId + "/poll.json",
            JSON.stringify(fileData)
          );
          let response: ServerStatusResponse = {
            serverMessage: "200",
          };
          res.json(response);
        } else {
          let response: ServerStatusResponse = {
            serverMessage: "ERR_Name_Exists",
          };
          res.json(response);
        }
      }
    }
  );
});

function createRoom(roomData: RoomObject, res) {
  let roomPath: string = __dirname + "/data/rooms/" + roomData.roomId;
  const fs = require("fs");

  // create new directory
  fs.mkdir(roomPath, (err) => {
    if (err) {
      throw err;
    }
    console.log("Directory is created.");
    fs.writeFile(roomPath + "/poll.json", JSON.stringify(roomData), (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("file Created");
        res.json({
          roomId: roomData.roomId,
          creatorId: roomData.creatorId,
        });
      }
    });
  });
}

function getNewRoomId(digits: number) {
  //creates a new room id
  let generatedId: string = getRandomId(digits, true, true, true);
  while (usedIds.data.some((ids) => ids.roomId == generatedId)) {
    generatedId = getRandomId(digits, true, true, true);
  }

  return generatedId;
}

function getRandomId( //universal function to generate random id
  digits: number,
  numbers: boolean,
  capitalLetter: boolean,
  letter: boolean
): string {
  const nChar = "123456789"; //All: const nChar = "0123456789"; /Removed easy mistaken Id letter
  const cChar = "ABCDEFGHJKLMNPQRSTUVWXYZ"; //All const cChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";  / Removed easy mistaken Id letter
  const lChar = "abcdefghijklmnopqrstuvwxyz";

  var characters = numbers ? nChar : "";
  characters += capitalLetter ? cChar : "";
  characters += letter ? lChar : "";

  var result = "";
  var charactersLength = characters.length;
  for (let i: number = 0; i < digits; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
