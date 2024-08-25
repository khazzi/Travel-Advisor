import React, { useState, useEffect, useCallback } from 'react';
import { CssBaseline, Grid } from '@material-ui/core';
import { LoadScript } from '@react-google-maps/api';
import { getPlacesData, getWeatherData } from './api/travelAdvisorAPI';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map from './components/Map/Map';

const App = () => {
  const [type, setType] = useState('restaurants');
  const [rating, setRating] = useState('');

  const [coords, setCoords] = useState({});
  const [bounds, setBounds] = useState(null);

  const [weatherData, setWeatherData] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [places, setPlaces] = useState([]);

  const [autocomplete, setAutocomplete] = useState(null);
  const [childClicked, setChildClicked] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const libraries = ['places'];

  // Get user's current location on first load
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
      },
      (error) => console.error('Error getting location', error)
    );
  }, []);

  // Filter places based on rating
  useEffect(() => {
    const filtered = places.filter((place) => Number(place.rating) > rating);
    setFilteredPlaces(filtered);
  }, [rating, places]);

  // Fetch places and weather data when bounds or type changes
  useEffect(() => {
    if (bounds) {
      setIsLoading(true);
  
      getWeatherData(coords.lat, coords.lng)
        .then((data) => {
          console.log('Weather Data:', data); // Log weather data
          setWeatherData(data);
        })
        .catch((error) => console.error('Error fetching weather data', error));
  
      getPlacesData(type, bounds.sw, bounds.ne)
        .then((data) => {
          console.log('Places Data:', data); // Log places data
          if (data) {
            const filtereddata = data.filter((place) => place.name && place.num_reviews > 0);
            setPlaces(filtereddata);
          } else {
            console.error('Unexpected data format:', data);
          }
          setFilteredPlaces([]);
          setRating('');
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching places data', error);
          setIsLoading(false);
        });
    }
  }, [bounds, type, coords.lat, coords.lng]);
  
  const onLoad = useCallback((autoC) => setAutocomplete(autoC), []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoords({ lat, lng });
      }
    }
  };

  return (
    <>
      <LoadScript googleMapsApiKey="AIzaSyBuQbVSuNxxFP7MFndF5IlcmRnHP_moDpI" libraries={libraries}>
        <CssBaseline />
        <Header onPlaceChanged={onPlaceChanged} onLoad={onLoad} />
        <Grid container spacing={3} style={{ width: '100%' }}>
          <Grid item xs={12} md={4}>
            <List
              isLoading={isLoading}
              childClicked={childClicked}
              places={filteredPlaces.length ? filteredPlaces : places}
              type={type}
              setType={setType}
              rating={rating}
              setRating={setRating}
            />
          </Grid>
          <Grid item xs={12} md={8} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Map
              setChildClicked={setChildClicked}
              setBounds={setBounds}
              setCoords={setCoords}
              coords={coords}
              places={filteredPlaces.length ? filteredPlaces : places}
              weatherData={weatherData}
            />
          </Grid>
        </Grid>
      </LoadScript>
    </>
  );
};

export default App;
