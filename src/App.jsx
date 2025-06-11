import { useRef, useState, useCallback, useEffect } from 'react';
import { updateUserPlaces } from './http.js';
import { fetchUserPlaces } from './http.js';
import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import ErrorPage from './components/Error.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';

function App() {
  const selectedPlace = useRef();

  const [isFetching, setIsFetching] = useState(false)
  const [availablePlaces, setAvailablePlaces] = useState([]);

  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();



  useEffect(() => {
    async function fetchPlaces() {
      setIsFetching(true);
      try {
        const places = await fetchUserPlaces();
        setUserPlaces(places);
      } catch (error) {
        setError({ message: error.message || 'Failed to fetch user places.' })
      }

      setIsFetching(false);
    }
    fetchPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);

    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || 'Failed to update places.'
      });
    }

  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );
    try {
      await updateUserPlaces(
        userPlaces.filter((place) => place.id !== selectedPlace.current.id)
      );

    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || 'Failed to update places.'
      });
    }

    console.log('setModalIsOpen');
    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setErrorUpdatingPlaces(null);
  }


  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <ErrorPage title={'Mistakes were made!'}
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )};
      </Modal>


      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="Whoopsie!!" message={error.message} />}
        <Places
          title="I'd like to visit ..."
          isLoading={isFetching}
          loadingText="Fetchingyour places..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
