import './common.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import debounce from 'lodash.debounce';

//ustawienie techniki Debounce na opóźnienie 3 sekundy
const DEBOUNCE_DELAY = 300; 

//ustawienie zmiennej na wyszukiwanie państw z zasobu name
const fetchCountries = name => {
  const BASE_URL = 'https://restcountries.com/v3.1/name/';
  const properties = 'fields=name,capital,population,flags,languages';

  return fetch(`${BASE_URL}${name}?${properties}`).then(response => {
      console.log(!response.ok);
      if (!response.ok) {
          throw new Error(response.status);
      }
      return response.json();
  });
};

//opisanie zmiennych
const refs = {
  searchEl : document.querySelector('#search-box'),
  countryInfo : document.querySelector('.country-info'),
  countryList : document.querySelector('.country-list'),
};

// inna opcja na zapisanie powyższych zmiennych:
// const searchEl = document.querySelector('#search-box');
//const countryInfo = document.querySelector('.country-info');
// const countryList = document.querySelector('.country-list');


//funkcja czyszczenia znaków
const clearMarkup = ref => (ref.innerHTML = '');

const inputHandler = e => {
  const textInput = e.target.value.trim();

  if (!textInput) {
    clearMarkup(refs.countryList);
    clearMarkup(refs.countryInfo);
    return;
  }

  //wyszukiwanie państw
  fetchCountries(textInput) 
    .then(data => {
      console.log(data);
      if (data.length > 10) {
        clearMarkup(refs.countryList);
        clearMarkup(refs.countryInfo);
        Notify.info(
          'Too many matches found. Please enter a more specific name' //jeśli po podanym ciągu znaków jest więcej niż 10 możliwości zostanie zwrócony ten komunikat
        );
        return;
      }
      renderMarkup(data);
    })
    .catch(err => {
      clearMarkup(refs.countryList);
      clearMarkup(refs.countryInfo);
      Notify.failure('Oops..., there is no country with that name'); //zwracanie błędu w przypadku braku dopasowania
    });
};

//zwracanie listy obiektów w przypadku dopasowania
const renderMarkup = data => {
  if (data.length === 1) {
    clearMarkup(refs.countryList);
    const markupInfo = createInfoMarkup(data);
    refs.countryInfo.innerHTML = markupInfo;
  } else {
    clearMarkup(refs.countryInfo);
    const markupList = createListMarkup(data);
    refs.countryList.innerHTML = markupList;
  }
};

//przygotowanie detali obiektu w przypadku znalezienia dopasowania
const createListMarkup = data => {
  return data
    .map(
      ({ name, flags }) =>
        `<li><img src="${flags.png}" alt="${name.official}" width="60" height="40">${name.official}</li>`
    )
    .join('');
    
};

const createInfoMarkup = data => {
  return data.map(
    ({ name, capital, population, flags, languages }) =>
      `<img src="${flags.png}" alt="${name.official}" width="200" height="100">
      <h1>${name.official}</h1>
      <p>Capital: ${capital}</p>
      <p>Population: ${population}</p>
      <p>Languages: ${Object.values(languages)}</p>`
  );
};

//ustawienie opóźnienia w wykonaniu wyszukiwania po wpisaniu jakiegokolwiek znaku w wyszukiwarce
refs.searchEl.addEventListener('input', debounce(inputHandler, DEBOUNCE_DELAY));
