import React, { useState, createContext } from "react";
export const SeatContext = createContext();
export const SeatProvider = ({ children }) => {
  const [flightNumber, setFlightNumber] = useState(null);
  const [listOfFlights, setListOfFlights] = useState([]);
  const [seating, setSeating] = useState([]);

  const [inputs, setInputs] = useState({});
  const [seatId, setSeatId] = useState(null);
  const [clickedSeatYet, setClickedSeatYet] = useState(false);

  const [reservationId, setReservationId] = useState(
    localStorage.getItem("reservationId")
      ? localStorage.getItem("reservationId")
      : null
  );
  return (
    <SeatContext.Provider
      value={{
        flightNumber,
        setFlightNumber,
        listOfFlights,
        setListOfFlights,
        seating,
        setSeating,

        inputs,
        setInputs,
        seatId,
        setSeatId,
        clickedSeatYet,
        setClickedSeatYet,
        reservationId,
        setReservationId,
      }}
    >
      {children}
    </SeatContext.Provider>
  );
};
