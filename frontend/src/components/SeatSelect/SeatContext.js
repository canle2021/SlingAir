import React, { useState, createContext } from "react";
export const SeatContext = createContext();
export const SeatProvider = ({ children }) => {
  const [flightNumber, setFlightNumber] = useState(null);
  const [listOfFlights, setListOfFlights] = useState([]);
  const [seating, setSeating] = useState([]);

  const [inputs, setInputs] = useState({});
  const [seatId, setSeatId] = useState(null);
  const [clickedSeatYet, setClickedSeatYet] = useState(false);
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
      }}
    >
      {children}
    </SeatContext.Provider>
  );
};
