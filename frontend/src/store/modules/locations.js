import europeCountries from '../../assets/meta-info-europe-countries.json';
import swedishCounties from '../../assets/meta-info-sweden-counties.json';
import swedishMunicipalities from '../../assets/meta-info-sweden-municipalities.json';
import swedishCities from '../../assets/meta-info-sweden-cities.json';
import { cleanString } from '../helpers';

const state = {
  countries: europeCountries.map(x => ({ ...x, name: cleanString(x.name), active: true })).filter(({ name }) => name !== "sweden"),
  counties: swedishCounties.map(x => ({ ...x, name: cleanString(x.name), active: true })),
  municipalities: swedishMunicipalities.map(x => ({ ...x, name: cleanString(x.name), active: false })),
  cities: swedishCities.map(x => ({ ...x, name: cleanString(x.name), active: true })),
  mapCities: [],
  selectedCounty: null,
  previousSelectedCounty: null,
}

const getters = {
  countries: state => {
    return state.countries;
  },
  counties: state => {
    return state.counties;
  },
  municipalities: state => {
    return state.municipalities;
  },
  cities: state => {
    return state.cities;
  },
  mapCities: state => {
    return state.mapCities;
  },
  selectedCounty: state => {
    return state.selectedCounty;
  },
  countyByName: state => (name = "") => {
    return state.counties.find(county => cleanString(county.name) === cleanString(name));
  },
  municipalityByName: (state) => (name = "") => {
    return state.municipalities.find(municipality => cleanString(municipality.name) === cleanString(name));
  },
}

const actions = {
  selectCounty: ({ commit }, countyName) => commit('selectCounty', countyName),
  setActiveMapCitiesBasedOnPopulation: ({ commit }, population) => commit('setActiveMapCitiesBasedOnPopulation', population),
  countyClick: ({ dispatch }, county) => {
    dispatch('selectCounty', county.name);
    dispatch('setActiveNewsItemId', null);
  },
}

const mutations = {
  selectCounty(state, countyName) {
    state.selectedCounty = countyName

    state.counties.map(county => county.active = !(county.name === countyName));
    state.municipalities.map(municipality => municipality.active = municipality.county === countyName)
  },
  openDrawer(state) {
    state.selectedCounty = state.previousSelectedCounty
    state.previousSelectedCounty = null
    state.counties.map(county => county.active = !(county.name === state.selectedCounty));
    state.municipalities.map(municipality => municipality.active = municipality.county === state.selectedCounty)
  },
  closeDrawer(state) {
    state.counties.map(county => county.active = true)
    state.municipalities.map(municipality => municipality.active = false)

    state.previousSelectedCounty = state.selectedCounty
    state.selectedCounty = null
  },
  toggleActive(state) {
    state.selectedCounty = null
  },
  setActiveMapCitiesBasedOnPopulation(state, population) {
    state.mapCities = state.cities.filter(city => city.population > population)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
