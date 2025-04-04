# WeatherWizard 🌤️

A modern, responsive weather application built with React, TypeScript, and TailwindCSS that provides real-time weather information and forecasts. The application features a Progressive Web App (PWA) implementation for native-like experience on mobile devices.

## Features ✨

- **Real-time Weather Data**: Get current weather conditions including temperature, humidity, wind speed, and more
- **10-Day Forecast**: View detailed weather forecasts for the next 10 days
- **Hourly Forecasts**: Access hour-by-hour weather predictions
- **Air Quality Information**: Monitor air quality index and pollutant levels
- **Multiple Locations**: Save and switch between different locations
- **Geolocation Support**: Automatically detect user's location
- **PWA Support**: Install as a native app on mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Temperature Units**: Switch between Celsius and Fahrenheit
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Location Search**: Search for any location worldwide
- **Persistent Settings**: Save user preferences locally

## Tech Stack 🛠️

- **Frontend**:
  - React 18
  - TypeScript
  - TailwindCSS
  - Shadcn/ui Components
  - Tanstack Query (React Query)
  - Vite

- **Backend**:
  - Node.js
  - Express
  - WeatherAPI Integration

## Prerequisites 📋

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- A WeatherAPI key (get one at [WeatherAPI.com](https://www.weatherapi.com))

## Installation 🚀

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/WeatherWizard.git
   cd WeatherWizard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   WEATHER_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Building for Production 🏗️

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure 📁

```
WeatherWizard/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
├── server/                # Backend server
│   ├── routes.ts         # API routes
│   └── types.ts          # Server-side types
└── package.json          # Project dependencies
```

## API Integration 🔌

The application uses the WeatherAPI.com service for weather data. The following endpoints are used:

- `/api/weather/forecast`: Get weather forecast data
- `/api/weather/search`: Search for locations
- `/api/weather/location`: Get location details from coordinates

## Progressive Web App Features 📱

- Installable on mobile devices
- Offline support
- Push notifications (coming soon)
- Background sync (coming soon)

## Performance Optimizations ⚡

- Request caching
- Debounced API calls
- Memoized components
- Lazy loading
- Image optimization

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Weather data provided by [WeatherAPI.com](https://www.weatherapi.com)
- Icons by [Lucide Icons](https://lucide.dev)
- UI components by [shadcn/ui](https://ui.shadcn.com)

## Support 💬

For support, email support@weatherwizard.com or open an issue in the repository.

---

Made with ❤️ by [Your Name] 