// weather/weatherService.test.js
import { expect } from 'chai';
import { getWeatherByCity } from './weatherService.js';
import axios from 'axios';
import sinon from 'sinon';

describe('getWeatherByCity()', () => {
  let axiosGetStub;

  beforeEach(() => {
    axiosGetStub = sinon.stub(axios, 'get');
  });

  afterEach(() => {
    axiosGetStub.restore();
  });

  it('should return weather data for a valid city', async () => {
    const mockResponse = {
      data: {
        name: 'Delhi',
        main: { temp: 30, humidity: 40 },
        weather: [{ description: 'clear sky' }],
        wind: { speed: 5 },
      },
    };

    axiosGetStub.resolves(mockResponse);

    const result = await getWeatherByCity('Delhi');

    expect(result).to.deep.equal({
      city: 'Delhi',
      temperature: 30,
      description: 'clear sky',
      humidity: 40,
      windSpeed: 5,
    });
  });

  it('should throw an error if city is missing', async () => {
    try {
      await getWeatherByCity();
    } catch (err) {
      expect(err.message).to.equal('City is required');
    }
  });
});
