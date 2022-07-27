import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import tombstone from "../assets/tombstone.png";
import { SeatContext } from "./SeatSelect/SeatContext";
const Reservation = () => {
  const { reservationId, setReservationId } = useContext(SeatContext);
  const [confirmedSeat, setConfirmedSeat] = useState({});
  const [retrievedFlightStatus, setRetrievedFlightStatus] = useState(null);
  useEffect(() => {
    fetch(`/api/get-reservation/${reservationId}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log("datafromConfirm", data.data);
        console.log("status", data.status);
        console.log("data", data);
        setConfirmedSeat(data.data);
        setRetrievedFlightStatus(data.status);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [reservationId]);
  console.log("confirmedSeat,", confirmedSeat);
  console.log("status", retrievedFlightStatus);
  return retrievedFlightStatus === 200 ? (
    <Wrapper>
      <h1> Your flight reservation:</h1>
      <p>Reservation number: {confirmedSeat._id}</p>
      <p>Flight number: {confirmedSeat.flight}</p>
      <p>Seat number: {confirmedSeat.seat}</p>
      <p>
        Name: {confirmedSeat.givenName} {confirmedSeat.surname}
      </p>
      <p>Email: {confirmedSeat.email}</p>
    </Wrapper>
  ) : (
    <Wrapper>
      <h1>
        Sorry! Please refresh your page or contact the customer service to see
        your reservation.
      </h1>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default Reservation;
