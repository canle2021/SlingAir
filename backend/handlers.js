"use strict";

const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const client = new MongoClient(MONGO_URI, options);
const db = client.db("SLINGAIR");
// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");

// use this data. Changes will persist until the server (backend) restarts.
const { flights, reservations } = require("./data");

// returns a list of all flights
const getFlights = async (req, res) => {
  const flightsList = [];
  try {
    await client.connect();

    const retrieveFlightList = await db
      .collection("flights")
      .find()
      .project({ flight: 1 })
      .toArray();
    //   0 means except this key show all other’s keys value of MongoDB Collection.
    // 1 means show only given keys value. Of MongoDB Collection.
    console.log("result", retrieveFlightList);
    if (retrieveFlightList) {
      retrieveFlightList.forEach((flight) => {
        flightsList.push(flight._id);
      });
      return res.status(200).json({
        status: 200,
        data: flightsList,
        message: "The flights list was found",
      });
    } else {
      return res.status(404).json({
        status: 404,
        data: {},
        message: "Could not find the flights list",
      });
    }
  } catch (err) {
    console.log("err from catch getFights", err);
  }
  client.close();
};

// returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const { flight } = req.params;
  // use flight becuase :flight is in the end point
  //    and the key name flight must be in collection (As a key)
  try {
    await client.connect();
    const retrieveFlight = await db.collection("flights").findOne({ flight });
    if (retrieveFlight) {
      return res.status(200).json({
        status: 200,
        data: retrieveFlight,
        message: `Your flight with ${flight} was successfully found`,
      });
    } else {
      return res.status(404).json({
        status: 404,
        data: req.body,
        message: `Your flight with ${flight} was not found`,
      });
    }
  } catch (err) {
    console.log("err from getFlight", err);
  }
  client.close();
};

// returns all reservations
const getReservations = async (req, res) => {
  try {
    await client.connect();
    const retrieveReservations = await db
      .collection("reservations")
      .find()
      .toArray();
    if (retrieveReservations) {
      return res.status(200).json({
        status: 200,
        data: retrieveReservations,
        message: "Successfully got data of reservations",
      });
    } else {
      return res.status(404).json({
        status: 404,
        data: {},
        message: "Flight reservations could not be found",
      });
    }
  } catch (err) {
    console.log("err from get reservations", err);
  }
  client.close();
};

// returns a single reservation
const getSingleReservation = async (req, res) => {
  const { _id } = req.params;
  try {
    await client.connect();
    const retrieveSingleReservation = await db
      .collection("reservations")
      .findOne({ _id });
    if (retrieveSingleReservation) {
      return res.status(200).json({
        status: 200,
        data: retrieveSingleReservation,
        message: `The reservation with id: ${_id} was successfully found`,
      });
    } else {
      return res.status(404).json({
        status: 404,
        data: {},
        message: `The reservation with id: ${_id} was NOT found`,
      });
    }
  } catch (err) {
    console.log("err from getSingleReservation", err);
  }
  client.close();
};

// creates a new reservation
const addReservation = async (req, res) => {
  const body = req.body;
  const newClient = {
    _id: uuidv4(),
    ...body,
  };
  // supposed the posting method wil have a req.body with this format: {

  // 	"flight": "SA231",
  // 	"seat": "4F",
  // 	"givenName": "Antonio",
  // 	"surname": "Free",
  // 	"email": "Antonio@bFree.com"
  // }
  if (
    !body.flight ||
    !body.seat ||
    !body.givenName ||
    !body.surname ||
    !body.email
  ) {
    return res.status(400).json({
      status: 400,
      data: {},
      message: "Please fill out all the required information",
    });
  }
  try {
    await client.connect();
    const findExistingEmailInThisFlight = await db
      .collection("reservations")
      .findOne({ email: body.email });
    if (findExistingEmailInThisFlight) {
      return res.status(400).json({
        status: 400,
        data: body.email,
        message: `The email ${body.email} is already used!`,
      });
    } else {
      const retrieveFlight = await db
        .collection("flights")
        // .findOne({ flight: body.flight })
        .findOne({ flight: body.flight });
      const checkSeatNotBookedYet = retrieveFlight.seats.find(
        (seat) => seat.id === body.seat && seat.isAvailable === true
      );
      if (checkSeatNotBookedYet) {
        const updateFlightSeat = await db
          .collection("flights")
          .updateOne(
            { flight: body.flight, "seats.id": body.seat },
            { $set: { "seats.$.isAvailable": false } }
          );
        if (updateFlightSeat.modifiedCount > 0) {
          // this step is a double check to make sure in the time our server does checkSeatNotBookedYet and
          // updateFlightSeat, no other customers finished booking same seat in  same flight just a very tiny moment before

          try {
            const addReservation = await db
              .collection("reservations")
              .insertOne(newClient);
            console.log("try to find", updateFlightSeat);
            return res.status(200).json({
              status: 200,
              data: req.body,
              message: `Your seat number: ${body.seat} at flight ${body.flight} was successfully booked `,
            });
          } catch (err) {
            console.log("addReservation err", err);
          }
        } else {
          // return for updateFlightSeat.modifiedCount
          return res.status(400).json({
            status: 400,
            data: req.body,
            message: ` Sorry, your seat number: ${body.seat} at flight ${body.flight} was already booked by another one `,
          });
        }
      } else {
        // return for checkSeatNotBookedYet
        return res.status(400).json({
          status: 400,
          data: req.body,
          message: ` Sorry, your seat number: ${body.seat} at flight ${body.flight} was already booked by another one `,
        });
      }
    }
  } catch (err) {
    console.log("err from addReservation", err);
  }
  client.close();
};

// updates an existing reservation
const updateReservation = async (req, res) => {
  const body = req.body;
  // supposed this method wil have a req.body with this format: {
  // this case we only verify by _id, much faster but incase we dont have this _id, we have to go with longer way
  //   "reservation_id": "56d9dcad-3827-4928-9119-736cf48de632"
  // 	"updateFlightNumberTo": "SA235",
  // 	"updateSeatTo": "4D",
  // 	"updateGivenNameTo": "Boll",
  // 	"updateSurnameTo": "Freezee",
  // 	"updateEmailTo": "Boll@bFreezee.com"
  // }
  if (
    !body.reservation_id ||
    !body.updateFlightNumberTo ||
    !body.updateSeatTo ||
    !body.updateGivenNameTo ||
    !body.updateSurnameTo ||
    !body.updateEmailTo
  ) {
    return res.status(400).json({
      status: 400,
      data: {},
      message: "Please fill out all the required informations",
    });
  }
  // make sure the user fill out all the information

  try {
    client.connect();
    const reservationWillBeUpdated = await db
      .collection("reservations")
      .findOne({ _id: body.reservation_id });
    // find the existing reservation with the provided reservation id
    console.log("update", reservationWillBeUpdated);

    if (reservationWillBeUpdated) {
      if (
        body.reservation_id.toUpperCase() ===
          reservationWillBeUpdated._id.toUpperCase() &&
        body.updateFlightNumberTo.toUpperCase() ===
          reservationWillBeUpdated.flight.toUpperCase() &&
        body.updateSeatTo.toUpperCase() ===
          reservationWillBeUpdated.seat.toUpperCase() &&
        body.updateGivenNameTo.toUpperCase() ===
          reservationWillBeUpdated.givenName.toUpperCase() &&
        body.updateSurnameTo.toUpperCase() ===
          reservationWillBeUpdated.surname.toUpperCase() &&
        body.updateEmailTo.toUpperCase() ===
          reservationWillBeUpdated.email.toUpperCase()
      ) {
        return res.status(400).json({
          status: 400,
          data: {},
          message: "You did not change any information",
        });
      } else {
        const returnOldSeatToAvailable = await db
          .collection("flights")
          .updateOne(
            {
              flight: reservationWillBeUpdated.flight,
              "seats.id": reservationWillBeUpdated.seat,
            },
            { $set: { "seats.$.isAvailable": true } }
          );
        const updateNewSeat = await db.collection("flights").updateOne(
          {
            flight: body.updateFlightNumberTo,
            "seats.id": body.updateSeatTo,
          },
          { $set: { "seats.$.isAvailable": false } }
        );
        // update all the information after switch isAvailable to true and false
        const updateInformation = await db.collection("reservations").updateOne(
          { _id: body.reservation_id },
          {
            $set: {
              flight: body.updateFlightNumberTo.toUpperCase(),
              seat: body.updateSeatTo.toUpperCase(),
              givenName: body.updateGivenNameTo,
              surname: body.updateSurnameTo,
              email: body.updateEmailTo,
            },
          }
        );

        const updatedReservation = {
          _id: uuidv4(),
          updated: reservationWillBeUpdated,
        };
        const pushToUpdatedReservation = await db
          .collection("updatedReservations")
          .insertOne(updatedReservation);
      }
      // push the updated reservation to updatedReservations collection for tracking purpose
      return res.status(200).json({
        status: 200,
        data: body,
        message: `You successfully update reservation with id: ${body.reservation_id} `,
      });
    }

    // return res.status(200).json({ data: retrieveSingleReservation });
    else {
      return res.status(404).json({
        status: 404,
        data: {},
        message: `Could not find the reservation with id: ${body.reservation_id}`,
      });
    }
  } catch (err) {
    console.log("err from updateReservation", err);
  }
  client.close();
};

// deletes a specified reservation
const deleteReservation = async (req, res) => {
  const { _id } = req.params;
  try {
    await client.connect();
    const lookUpReservationId = await db
      .collection("reservations")
      .findOne({ _id });
    console.log("lookUpReservationId", lookUpReservationId);
    const deletedReservation = {
      _id: uuidv4(),
      deleted: lookUpReservationId,
    };
    if (lookUpReservationId) {
      try {
        const updateFlightSeat = await db.collection("flights").updateOne(
          {
            flight: lookUpReservationId.flight,
            "seats.id": lookUpReservationId.seat,
          },
          { $set: { "seats.$.isAvailable": true } }
        );
        if (updateFlightSeat.modifiedCount > 0) {
          // make sure update successfully in flight seat before letting customer know that they completed deleting reservation
          const deleteOne = await db
            .collection("reservations")
            .deleteOne({ _id });
          const pushToDeletedCollection = await db
            .collection("deletedReservations")
            .insertOne(deletedReservation);
          // push deleted reservation to deletedReservations collection in mongoDb to keep track what has been deleted
          return res.status(204).json({
            status: 204,
            data: req.body,
            message: `Your reservation id: ${_id} at flight ${lookUpReservationId.flight} was successfully deleted `,
          });
        } else {
          return res.status(400).json({
            status: 400,
            data: _id,
            message: ` Sorry, something's wrong with your deleting request. `,
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      return res.status(400).json({
        status: 400,
        data: _id,
        message: ` Sorry, your reservation Id was not found. Please provide a correct one. `,
      });
    }
  } catch (err) {
    console.log("err from deleteReservation ", err);
  }
  client.close();
};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
