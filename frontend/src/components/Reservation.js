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

  return (
    <ReservationDiv>
      {retrievedFlightStatus === 200 ? (
        <Wrapper>
          <ReservationTitle> Your flight reservation:</ReservationTitle>
          <BreakLine></BreakLine>
          <p>Reservation #: {confirmedSeat._id}</p>
          <p>Flight #: {confirmedSeat.flight}</p>
          <p>Seat #: {confirmedSeat.seat}</p>
          <p>
            Name: {confirmedSeat.givenName} {confirmedSeat.surname}
          </p>
          <p>Email: {confirmedSeat.email}</p>
        </Wrapper>
      ) : (
        <Wrapper>
          <h1>
            Sorry. We could not get your reservation information on this time.
            Please refresh your page or contact the customer service to see your
            reservation.
          </h1>
        </Wrapper>
      )}
      <TombDiv>
        <TomImg src={tombstone}></TomImg>
      </TombDiv>
    </ReservationDiv>
  );
};
const BreakLine = styled.div`
  height: 2px;
  background-color: var(--color-cadmium-red);
  margin: 3px 0 5px;
`;
const ReservationTitle = styled.p`
  color: var(--color-cadmium-red);
  font-size: 25px;
`;
const TomImg = styled.img`
  height: 150px;
  margin-top: 25px;
`;
const TombDiv = styled.div``;
const Wrapper = styled.div`
  width: fit-content;
  border: solid 2px var(--color-cadmium-red);
  padding: 20px;
  line-height: 2em;
`;
const ReservationDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  margin-top: 10%;
`;

export default Reservation;
