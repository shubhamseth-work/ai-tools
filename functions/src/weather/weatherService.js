import axios from 'axios';
const API_KEY = process.env.WEATHER_API_KEY || '433cf557f5eea047e610f343c527b059';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeatherByCity(city) {
    if (!city) {
        throw new Error('City is required');
    }

    const apiKey = process.env.OPENWEATHER_API_KEY || API_KEY;
    const url = `${BASE_URL}?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    return {
        city: data.name,
        temperature: data.main.temp,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed
    };
}

export { getWeatherByCity };
