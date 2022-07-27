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
    <>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="First Name"
          type="text"
          name="givenName"
          //   value={values ? values.name : ""}
          onChange={handleChange}
        />

        <input
          placeholder="Last Name"
          type="text"
          name="surname"
          //   value={values.lastName || ""}
          onChange={handleChange}
        />
        <input
          placeholder="Email"
          type="email"
          name="email"
          //   value={values.email || ""}
          onChange={handleChange}
        />

        <SubmitButton
          type="submit"
          onClick={handleSubmit}
          value="Confirm"
          disabled={!clickedSeatYet}
        />
      </form>
    </>
  );
};
const SubmitButton = styled.input`
  cursor: pointer;
`;

const Form = styled.form``;
const Input = styled.input``;
const TypingArea = styled.input`
  ::placeholder {
    opacity: 0.3;
  }
`;
const BookDiv = styled.div``;

export default BookSeat;
