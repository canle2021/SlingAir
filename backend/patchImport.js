const { flights, reservations } = require("./data");

const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
console.log("URi", MONGO_URI);
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const flightsDataArray = [];
const reservationsArray = [];

reservations[0]._id = reservations[0].id;
delete reservations[0].id;
//  replace id by _id
const flightSa231DataObject = {};
const flightSa235DataObject = {};

flightSa231DataObject._id = "SA231";
flightSa231DataObject.flight = "SA231";
flightSa231DataObject.seats = flights.SA231;

flightSa235DataObject._id = "SA235";
flightSa235DataObject.flight = "SA235";
flightSa235DataObject.seats = flights.SA231;

flightsDataArray.push(flightSa231DataObject, flightSa235DataObject);
reservationsArray.push(reservations[0]);
const patchImport = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("SLINGAIR");
    result = await db.collection("flights").insertMany(flightsDataArray);
    result = await db.collection("reservations").insertMany(reservationsArray);
    console.log("reservation", reservations);
  } catch (err) {
    console.log("err from pathImport catch", err);
  }
  client.close();
};

patchImport();
