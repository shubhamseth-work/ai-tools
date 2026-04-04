// weather.test.js

import axios from 'axios';
import { getWeatherByCity } from '../weather/weatherService.js';

jest.mock('axios');

describe('Integration Test - Weather API (Mocked)', () => {

  it('should return formatted weather data', async () => {
    axios.get.mockResolvedValue({
      data: {
        name: 'Delhi',
        main: {
          temp: 30,
          humidity: 60
        },
        weather: [{ description: 'clear sky' }],
        wind: { speed: 5 }
      }
    });

    const result = await getWeatherByCity('Delhi');

    expect(result).toEqual({
      city: 'Delhi',
      temperature: 30,
      description: 'clear sky',
      humidity: 60,
      windSpeed: 5
    });
  });

  it('should throw error when city is missing', async () => {
    await expect(getWeatherByCity()).rejects.toThrow('City is required');
  });

});