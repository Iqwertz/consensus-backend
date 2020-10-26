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
}

export interface RoomObject {
  titel: string;
  roomId: string;
  creatorId: string;
  creationDate: Date;
  description: string;
  data: roomlistentry[];
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

  fs.readFile(__dirname + "/data/roomIds.txt", function (err, data) {
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
      __dirname + "/data/roomIds.txt",
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

  fs.readFile(__dirname + "/data/roomIds.txt", function (err, data) {
    if (err) {
      throw err;
    }
    let fileData: RoomIdsLog = JSON.parse(data.toString());
    if (fileData.data.some((ids) => ids.roomId == reqData.roomId)) {
      createRoom(reqData, res);
    }
  });
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
    fs.writeFile(
      __dirname + "/data/rooms/poll.txt",
      JSON.stringify(roomData),
      (err) => {
        if (err) {
          throw err;
        }
        console.log("file Created");
        res.json({
          roomId: roomData.roomId,
          creatorId: roomData.creatorId,
        });
      }
    );
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
