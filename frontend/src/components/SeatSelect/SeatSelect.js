import React, { useEffect, useContext } from "react";
import styled from "styled-components";
import Plane from "./Plane";
import BookSeat from "./BookSeat";
import { SeatContext } from "./SeatContext";
const SeatSelect = ({}) => {
  const { flightNumber, setFlightNumber, listOfFlights, setListOfFlights } =
    useContext(SeatContext);

  const handleSelect = (event) => {
    setFlightNumber(event.target.value);
  };

  useEffect(() => {
    fetch(`/api/get-flights`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setListOfFlights(data.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, []);

  return (
    <>
      <FlightSelectDiv>
        <span>FLIGHT NUMBERS</span>
        <select onChange={handleSelect}>
          <option disabled selected>
            Choose a flight
          </option>
          {listOfFlights.map((flight, index) => {
            return (
              <option value={flight} key={index} name="flight">
                {flight}
              </option>
            );
          })}
        </select>
      </FlightSelectDiv>
      <h2>Select your seat and Provide your information!</h2>
      <PlaneAndBookSeatdiv>
        <Plane />
        <BookSeat />
      </PlaneAndBookSeatdiv>
    </>
  );
};

const FlightSelectDiv = styled.div`
  background-color: red;
  height: 70px;
`;
const PlaneAndBookSeatdiv = styled.div`
  display: flex;
`;

export default SeatSelect;
