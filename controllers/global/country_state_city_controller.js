import { Country, State, City } from "country-state-city";

// =================================================================
// const getAllCountries = async (req, res) => {
// handleGet(req, res, countryModel, {});
// };

const getAllCountries = async (req, res) => {
  try {
    // Get all countries
    const countries = Country.getAllCountries();

    // Filter to return only India (ISO code "IN")
    const india = countries.find((country) => country.isoCode === "IN");

    // Send response back to the client with the India object
    res.status(200).json({ message: "success", data: [india] });
  } catch (error) {
    // Handle errors if any
    zz.status(500).json({
      message: "success",
      detail: "Failed to retrieve country data",
    });
  }
};

// const getAllStates = async (req, res) => {
// handleGet(req, res, stateModel, {});
// };

const getAllStates = async (req, res) => {
  try {
    // Get all states in India (Country ISO code is "IN")
    const states = State.getStatesOfCountry("IN");

    // Send the list of states in India as a response
    // res.status(200).json(states);
    res.status(200).json({ message: "success", data: states });
  } catch (error) {
    // Handle errors if any
    res
      .status(500)
      .json({ message: "success", detail: "Failed to retrieve country data" });
  }
};

// const getAllCities = async (req, res) => {
//   handleGet(req, res, cityModel, {});
// };
const getAllCities = async (req, res) => {
  try {
    // Get all states in India (Country ISO code is "IN")
    const states = State.getStatesOfCountry("IN");

    let allCities = [];

    // Loop through each state and get cities
    states.forEach((state) => {
      const cities = City.getCitiesOfState("IN", state.isoCode);
      allCities = [...allCities, ...cities]; // Append cities to the overall list
    });

    // Send all cities as a response
    // res.status(200).json(allCities);
    res.status(200).json({ message: "success", data: allCities });
  } catch (error) {
    // Handle errors if any
    res
      .status(500)
      .json({ message: "success", detail: "Failed to retrieve country data" });
  }
};
// =================================================================

const globalCountryStateCityController = {
  getAllCities,
  getAllCountries,
  getAllStates,
};

export default globalCountryStateCityController;
