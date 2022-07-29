import React, { useEffect, useContext } from "react";
import styled from "styled-components";
import Plane from "./Plane";
import BookSeat from "./BookSeat";
import { SeatContext } from "./SeatContext";
import { createGlobalStyle } from "styled-components";
const FlightSelect = ({}) => {
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
        <Flight>
          <h3>FLIGHT NUMBERS</h3>
          <Select onChange={handleSelect} defaultValue={"default"}>
            <option value={"default"}>Choose a flight</option>
            {listOfFlights.map((flight, index) => {
              return (
                <option value={flight} key={index} name="flight">
                  {flight}
                </option>
              );
            })}
          </Select>
        </Flight>
      </FlightSelectDiv>
      <h2>Select your seat and Provide your information!</h2>
      <Note>
        Please try to refresh your page to get the most updated available seats
        and flights.
      </Note>
      <PlaneAndBookSeatdiv>
        <Plane />
        <BookSeat />
      </PlaneAndBookSeatdiv>
    </>
  );
};

const Select = styled.select`
  font-size: 16px;
`;

const FlightSelectDiv = styled.div`
  background-color: var(--color-cadmium-red);
  min-height: 70px;
`;
const Flight = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-left: 20px;
  display: flex;
  h3 {
    margin-right: 25px;
  }
`;
const PlaneAndBookSeatdiv = styled.div`
  display: flex;
  justify-content: center;
  /* flex-direction: row; */
  align-items: center;
  align-content: center;
`;
const Note = styled.p`
  color: #fff;
  font-size: 15px;
  margin-top: 10px;
  text-align: center;
`;
export default FlightSelect;
