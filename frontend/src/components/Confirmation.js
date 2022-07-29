import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";

import tombstone from "../assets/tombstone.png";
import { SeatContext } from "./SeatSelect/SeatContext";
const Confirmation = () => {
  const { reservationId } = useContext(SeatContext);
  const [confirmedSeat, setConfirmedSeat] = useState({});
  const [retrievedFlightStatus, setRetrievedFlightStatus] = useState(null);
  useEffect(() => {
    fetch(`/api/get-reservation/${reservationId}`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setConfirmedSeat(data.data);
        setRetrievedFlightStatus(data.status);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [reservationId]);

  return (
    <ConfirmationDiv>
      {retrievedFlightStatus === 200 ? (
        <Wrapper>
          <ConfirmTitle> Your flight is confirmed!</ConfirmTitle>
          <BreakLine></BreakLine>
          <p>
            <span>Reservation #:</span> {confirmedSeat._id}
          </p>
          <p>
            <span>Flight #: </span>
            {confirmedSeat.flight}
          </p>
          <p>
            <span>Seat #: </span>
            {confirmedSeat.seat}
          </p>
          <p>
            <span>Name: </span>
            {confirmedSeat.givenName} {confirmedSeat.surname}
          </p>
          <p>
            <span>Email: </span>
            {confirmedSeat.email}
          </p>
        </Wrapper>
      ) : (
        <Wrapper>
          <h1>
            Sorry. We could not confirm your seat booking at this time. Please
            refresh your page or contact the customer service to see your
            reservation.
          </h1>
        </Wrapper>
      )}
      <TombDiv>
        <TomImg src={tombstone}></TomImg>
      </TombDiv>
    </ConfirmationDiv>
  );
};
const BreakLine = styled.div`
  height: 2px;
  background-color: var(--color-cadmium-red);
  margin: 3px 0 5px;
`;
const ConfirmTitle = styled.p`
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
  span {
    font-size: 1.2rem;
    color: var(--color-cadmium-red);
  }
`;
const ConfirmationDiv = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
  margin-top: 10%;
`;
export default Confirmation;
