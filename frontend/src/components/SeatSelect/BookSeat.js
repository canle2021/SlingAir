import React, { useState, useContext } from "react";
import styled from "styled-components";
import { SeatContext } from "./SeatContext";
import { useHistory } from "react-router-dom";
const BookSeat = ({}) => {
  const {
    inputs,
    setInputs,
    seatId,
    flightNumber,
    setFlightNumber,
    clickedSeatYet,
    setClickedSeatYet,
    reservationId,
    setReservationId,
    showReservationButton,
    setShowReservationButton,
  } = useContext(SeatContext);
  const [values, setValues] = useState();
  const history = useHistory();
  let postingStatus = 0;
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setValues((values) => ({ ...values, [name]: value }));
    // values is just a temperary variable which is holding an object contents inputs
  };
  //   console.log("choseSeat", seatId);
  const objectToBePosted = {
    flight: flightNumber,
    ...seatId,
    ...values,
  };
  //   console.log("objectToBePosted", objectToBePosted);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setInputs(values);

    try {
      const posting = await fetch(`/api/add-reservation`, {
        method: "POST",
        body: JSON.stringify(objectToBePosted),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const converToJson = await posting.json();
      window.alert(`${converToJson.message}`);
      postingStatus = converToJson.status;
      if (postingStatus === 200) {
        setReservationId(converToJson.reservationId);
        localStorage.setItem("reservationId", `${converToJson.reservationId}`);
        setFlightNumber(null);
        setClickedSeatYet(false);
        // set the confirm back to disable after booking successfully
        history.push(`/confirmed`);
      }
      console.log("converToJson", converToJson);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <BookDiv>
      <Form onSubmit={handleSubmit}>
        <Input
          placeholder="First Name"
          type="text"
          name="givenName"
          onChange={handleChange}
        />

        <Input
          placeholder="Last Name"
          type="text"
          name="surname"
          onChange={handleChange}
        />
        <Input
          placeholder="Email"
          type="email"
          name="email"
          onChange={handleChange}
        />

        <SubmitButton
          type="submit"
          value="Confirm"
          disabled={!clickedSeatYet}
          name="confirmButton"
          className={!clickedSeatYet ? "disabled" : ""}
        ></SubmitButton>
      </Form>
    </BookDiv>
  );
};

const SubmitButton = styled.input`
  font-family: var(--font-heading);
  background-color: var(--color-alabama-crimson);
  color: #fff;
  cursor: pointer;
  font-family: var("Permanent Marker", Arial, Helvetica, sans-serif);
  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  padding: 25px;
`;
const Input = styled.input``;

const BookDiv = styled.div`
  border: solid 2px var(--color-alabama-crimson);
  height: fit-content;
`;

export default BookSeat;
