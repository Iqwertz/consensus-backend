import { enviroment } from "./enviroment";
import * as express from "express";
import { createBrotliCompress } from "zlib";

const roomStore: Map<string, string> = new Map<
  string,
  string
>();  //zweiten String mit dem room objekt ersetzen

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

app.post("/new", (req, res) => {
  let newRoomId = getNewRoomId(8);
  createRoom(newRoomId);
  res.json({ roomId: newRoomId }); //send the session is as respons back
});

function createRoom(id: string) {

}

function getNewRoomId(digits: number) {
  //creates a new room id
  let generatedId: string = getRandomId(digits, true, true, true);
  while (roomStore.has(generatedId)) {
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