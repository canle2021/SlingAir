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
        data: _id,
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
      message:
        "Sorry. Please provide all the required information including Flight number, Seat number, First name, Last name and Email address!",
    });
  }
  if (!body.email.includes("@")) {
    return res.status(400).json({
      status: 400,
      data: {},
      message:
        "Sorry. Please provide the correct form of email address(including @)",
    });
  }

  try {
    await client.connect();

    const findGroupOfreservations = await db
      .collection("reservations")
      .find({ flight: body.flight })
      .toArray();

    const findExistingEmailInThisFlight = findGroupOfreservations.find(
      (reservation) =>
        reservation.email.toLocaleLowerCase() === body.email.toLocaleLowerCase()
    );

    if (findExistingEmailInThisFlight) {
      return res.status(400).json({
        status: 400,
        data: body.email,
        message: `The email ${body.email} is already used!`,
      });
      // verrify the existing email
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

            return res.status(200).json({
              status: 200,
              data: req.body,
              reservationId: newClient._id,
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
  // this case we only verify by _id, much faster but incase we dont have this _id, we have to go with longer way
  // supposed this method wil have a req.body with this format: {
  //   "reservation_id": "56d9dcad-3827-4928-9119-736cf48de632",
  // 	"updateFlightNumberTo": "SA235",
  // 	"updateSeatTo": "8D",
  // 	"updateGivenNameTo": "Boll",
  // 	"updateSurnameTo": "Freezee",
  // 	"updateEmailTo": "Boll@bFreezee.com"
  // }
  //
  // make sure the user fill out all the information
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
  //

  try {
    client.connect();
    const reservationWillBeUpdated = await db
      .collection("reservations")
      .findOne({ _id: body.reservation_id });
    // find the existing reservation with the provided reservation id
    // console.log("update", reservationWillBeUpdated);

    //
    // Verify the reservation that user want to change is found by id before make some changes on it

    if (!reservationWillBeUpdated) {
      return res.status(404).json({
        status: 404,
        data: {},
        message: `Could not find the reservation with id: ${body.reservation_id}`,
      });
    }
    //
    //
    // Make sure we dont update anything if the user did not change anything

    const newFlight = body.updateFlightNumberTo.toUpperCase();
    const oldFlight = reservationWillBeUpdated.flight.toUpperCase();
    const newSeat = body.updateSeatTo.toUpperCase();
    const oldSeat = reservationWillBeUpdated.seat.toUpperCase();
    const newGivenName = body.updateGivenNameTo.toUpperCase();
    const oldGivenName = reservationWillBeUpdated.givenName.toUpperCase();
    const newSurname = body.updateSurnameTo.toUpperCase();
    const oldSurname = reservationWillBeUpdated.surname.toUpperCase();
    const newEmail = body.updateEmailTo.toUpperCase();
    const oldEmail = reservationWillBeUpdated.email.toUpperCase();
    if (
      newFlight === oldFlight &&
      newSeat === oldSeat &&
      newGivenName === oldGivenName &&
      newSurname === oldSurname &&
      newEmail === oldEmail
    ) {
      return res.status(400).json({
        status: 400,
        data: {},
        message: "You did not change any information",
      });
    }
    //

    //
    // in case the user does not change flight and seat number, we only update the reservations collection and keep tracking
    if (newFlight === oldFlight && newSeat === oldSeat) {
      const updateInformation = await db.collection("reservations").updateOne(
        { _id: body.reservation_id },
        {
          $set: {
            flight: newFlight,
            seat: newSeat,
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
      //push the updatedReservation to  pushToUpdatedReservation collection for keep tracking purpose
      return res.status(200).json({
        status: 200,
        data1: reservationWillBeUpdated,
        data: body,
        message: `You successfully update reservation with id: ${body.reservation_id}, (change from data1 to data) `,
      });
    }
    //

    // Verify the flight that user wants to update to is existing
    const findFlightWantToChange = await db
      .collection("flights")
      .findOne({ flight: newFlight });

    if (!findFlightWantToChange) {
      return res.status(404).json({
        status: 404,
        data: {},
        message:
          "The flight you want to change to does not exist, please try another one",
      });
    }
    //

    // Verify the seat number that user wants to update to is existing

    const checkSeatToChangeNotBookedYet = findFlightWantToChange.seats.find(
      (seat) => seat.id === newSeat && seat.isAvailable === true
    );
    if (!checkSeatToChangeNotBookedYet) {
      return res.status(404).json({
        status: 404,
        data: {},
        message: `The seat  ${body.updateSeatTo} in flight ${body.updateFlightNumberTo} that you want to change to was already booked by another one or it does not exist `,
      });
    }

    //
    // case new email is the same with esxting email. in that flight=>reject
    const findReservationsInFlight = await db
      .collection("reservations")
      .find({ flight: body.updateFlightNumberTo })
      .toArray();

    const findExistingEmailInThisFlight = findReservationsInFlight.find(
      (reservation) => reservation.email.toUpperCase() === newEmail
    );
    // console.log("findEmail", findExistingEmailInThisFlight);
    if (newEmail !== oldEmail && findExistingEmailInThisFlight) {
      return res.status(400).json({
        status: 400,
        data: {},
        message: `Sorry, the email you want to change to is existing in the flight ${newFlight}'s reservations!`,
      });
    }

    //
    // Incase the user wants to change flight or seat number after verifying those numbers are still available or existing

    if (newFlight !== oldFlight || newSeat !== oldSeat) {
      const updateNewSeat = await db.collection("flights").updateOne(
        {
          flight: newFlight,
          "seats.id": newSeat,
        },
        { $set: { "seats.$.isAvailable": false } }
      );
      if (updateNewSeat.modifiedCount > 0) {
        // This step make sure that the new updating book new seat successfully before transfer the old seat back to available
        try {
          // I use try...catch here to guarantee the slingair's money that the old seat should come back to available, if not we can see some err
          const returnOldSeatToAvailable = await db
            .collection("flights")
            .updateOne(
              {
                flight: oldFlight,
                "seats.id": oldSeat,
              },
              { $set: { "seats.$.isAvailable": true } }
            );

          // update all the information after switch isAvailable to true and false
          const updateInformation = await db
            .collection("reservations")
            .updateOne(
              { _id: body.reservation_id },
              {
                $set: {
                  flight: newFlight,
                  seat: newSeat,
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
          // push the updated reservation to updatedReservations collection for tracking purpose

          return res.status(200).json({
            status: 200,
            data1: reservationWillBeUpdated,
            data: body,
            message: `You successfully update reservation with id: ${body.reservation_id}, change from data1 to data  `,
          });
        } catch (err) {
          console.log("err from returnOldSeatToAvailable", err);
        }
      } else {
        return res.status(400).json({
          status: 400,
          data: {},
          message: `You DID NOT successfully update reservation with id: ${body.reservation_id} `,
        });
      }
    }

    //
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
            data: {},
            message: ` Sorry, something's wrong with your deleting request. `,
          });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      return res.status(400).json({
        status: 400,
        data: {},
        message: ` Sorry, your reservation Id: ${_id} was not found. Please provide a correct one. `,
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
