import { WeatherData } from "@/types/weather";
import {
  getWindDirectionIcon,
  getHourString,
  getTemperatureColor,
  getPersonalizedGreeting,
} from "@/lib/utils";
import { getWeatherIcon } from "@/components/WeatherIcons";
import { useTemperatureUnit } from "@/contexts/TemperatureUnitContext";
import PrecipitationChart from "@/components/PrecipitationChart";

interface WeatherContentProps {
  weatherData: WeatherData;
}

export default function WeatherContent({ weatherData }: WeatherContentProps) {
  // Get temperature unit context
  const { unit, convertToDisplayUnit, unitSymbol } = useTemperatureUnit();

  
  
  // Create array of forecast days ensuring we maintain the original array
  const forecastArray = [...weatherData.forecast.forecastday];
  
  console.log("ORIGINAL FORECAST DATES:", forecastArray.map(day => day.date));
  
  // Filter the forecast to ONLY include today (April 2) and future days
  let forecastToUse = forecastArray;

  // Group forecast days
  const days = forecastToUse.map((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dayNum = date.getDate();
    const shortDayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      ...day,
      display: `${dayName} ${dayNum}`,
      shortDisplay: `${shortDayName} ${dayNum}`,
    };
  });

  // Determine the grid layout based on the number of forecast days
  const numberOfDays = days.length;
  const isExtendedForecast = numberOfDays > 4;

  // Hours to show in 2-hour intervals from 0am to 22pm
  const hoursToShow = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]; // 2-hour intervals

  // For backward compatibility with the rest of the code
  const fixedHoursToShow = hoursToShow;
  const currentDayHours = hoursToShow;

  // Get the current hour for highlighting the current time
  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  // Helper function to check if an hour is the current hour (or close to it)
  const isCurrentTimeColumn = (
    dayIndex: number,
    hour: number,
    hours: number[],
  ) => {
    return (
      dayIndex === 0 &&
      ((currentHour >= hour && currentHour < hour + 2) ||
        (hour === hours[hours.length - 1] && currentHour >= hour))
    );
  };

  // Calculate the grid columns based on days and 12 hours per day (2-hour intervals)
  // For 4 days: 1 + (12×4) = 49 columns (12 hours for 4 days)
  // For 6 days: 1 + (12×6) = 73 columns (12 hours for 6 days)
  let gridCols = "grid-cols-49";

  if (numberOfDays >= 6) {
    gridCols = "grid-cols-73";
  } else if (numberOfDays === 5) {
    gridCols = "grid-cols-61"; // 1 + (12×5) = 61
  }

  // Each day gets 12 columns (for 12 hours per day in 2-hour intervals)
  const dayColSpan = 12;

  // Current weather summary
  const current = weatherData.current;
  const location = weatherData.location;

  // Helper function to determine if it's daytime
  const isDaytime = (hour: number) => {
    return hour >= 6 && hour < 18; // Consider 6 AM to 6 PM as daytime
  };

  // Helper function to get background color based on time
  const getTimeBackgroundColor = (hour: number, isCurrentHour: boolean) => {
    if (isCurrentHour) {
      return 'bg-blue-100 dark:bg-blue-800';
    }
    return isDaytime(hour)
      ? 'bg-sky-50 dark:bg-slate-700'
      : 'bg-slate-100 dark:bg-slate-800';
  };

  // Helper function to get text color based on time
  const getTimeTextColor = (hour: number, isCurrentHour: boolean) => {
    if (isCurrentHour) {
      return 'text-blue-800 dark:text-blue-200';
    }
    return isDaytime(hour)
      ? 'text-slate-800 dark:text-slate-200'
      : 'text-slate-600 dark:text-slate-400';
  };

  // Helper function to get the time period indicator
  const getTimePeriodIndicator = (hour: number) => {
    if (hour >= 6 && hour < 12) return '🌅'; // Morning
    if (hour >= 12 && hour < 17) return '☀️'; // Afternoon
    if (hour >= 17 && hour < 20) return '🌅'; // Evening
    return '��'; // Night
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Current Weather Summary */}
      <div className="p-4 bg-blue-50 dark:bg-slate-700 border-b">
        {/* Personalized Greeting */}
        <div className="mb-3 p-3 bg-white dark:bg-slate-600 bg-opacity-70 dark:bg-opacity-50 rounded-lg shadow-sm">
          <p className="dark:text-white font-medium">
            {getPersonalizedGreeting(
              location.localtime,
              current.condition.text,
              current.condition.code,
              current.temp_c,
            )}
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold dark:text-white">
              {location.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {location.region}, {location.country}
            </p>
            <div className="mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded ${isExtendedForecast ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"}`}
              >
                {isExtendedForecast
                  ? `Extended forecast (${days.length} days)`
                  : `Standard forecast (${days.length} days)`}
              </span>
            </div>
          </div>
          <div className="mt-3 md:mt-0 flex items-center">
            <div className="mr-4">
              <span className="text-4xl font-bold">
                {Math.round(convertToDisplayUnit(current.temp_c))}
                {unitSymbol}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm">
                Feels like{" "}
                {Math.round(convertToDisplayUnit(current.feelslike_c))}
                {unitSymbol}
              </span>
              <span className="text-sm">{current.condition.text}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div
            className={`${current.wind_kph > 15 ? "bg-blue-100 dark:bg-blue-800" : "bg-white dark:bg-slate-600 bg-opacity-50 dark:bg-opacity-30"} p-2 rounded`}
          >
            <p
              className={`${current.wind_kph > 15 ? "text-blue-800 dark:text-blue-100" : "text-gray-600 dark:text-gray-200"} font-medium`}
            >
              Wind
            </p>
            <p
              className={`${current.wind_kph > 15 ? "text-blue-900 dark:text-blue-50 font-semibold" : "dark:text-white"}`}
            >
              {current.wind_kph} km/h {current.wind_dir}
              {current.wind_kph > 15 && (
                <span className="ml-1 text-xs">(strong)</span>
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-600 bg-opacity-50 dark:bg-opacity-30 p-2 rounded">
            <p className="text-gray-600 dark:text-gray-200 font-medium">
              Humidity
            </p>
            <p className="dark:text-white">{current.humidity}%</p>
          </div>
          <div className="bg-white dark:bg-slate-600 bg-opacity-50 dark:bg-opacity-30 p-2 rounded">
            <p className="text-gray-600 dark:text-gray-200 font-medium">
              Visibility
            </p>
            <p className="dark:text-white">{current.vis_km} km</p>
          </div>
          <div className="bg-white dark:bg-slate-600 bg-opacity-50 dark:bg-opacity-30 p-2 rounded">
            <p className="text-gray-600 dark:text-gray-200 font-medium">
              UV Index
            </p>
            <p className="dark:text-white">{current.uv}</p>
          </div>
        </div>
      </div>

      {/* Weather data rows */}
      <div className="overflow-x-auto relative">
        <div className="min-w-max">
          {/* Days header */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10 shadow-md">
              Time
            </div>
            {days.map((day, dayIndex) => (
              <div
                key={`${day.date}-header`}
                className={`col-span-12 text-center py-3 font-semibold border-r dark:border-slate-600 ${
                  dayIndex === days.length - 1 ? "border-r-0" : ""
                }`}
              >
                <span className="hidden sm:inline dark:text-white">
                  {day.display}
                </span>
                <span className="sm:hidden dark:text-white">
                  {day.shortDisplay}
                </span>
              </div>
            ))}
          </div>

          {/* Time row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-2 px-2 bg-gray-50 dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10 shadow-md">
              Hour
            </div>
            {days.map((day, dayIndex) =>
              fixedHoursToShow.map((hour) => {
                const isCurrentTime = isCurrentTimeColumn(dayIndex, hour, fixedHoursToShow);
                return (
                  <div
                    key={`${day.date}-${hour}`}
                    className={`col-span-1 py-2 text-center border-r dark:border-slate-600 ${
                      getTimeBackgroundColor(hour, isCurrentTime)
                    }`}
                  >
                    <div className={`text-sm font-medium ${getTimeTextColor(hour, isCurrentTime)}`}>
                      {hour}:00
                      <span className="ml-1 text-xs">
                        {getTimePeriodIndicator(hour)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Temperature row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-2 px-2 bg-gray-50 dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10 shadow-md">
              Temp
            </div>
            {days.map((day, dayIndex) =>
              fixedHoursToShow.map((hour) => {
                const hourData = day.hour.find((h) => new Date(h.time).getHours() === hour);
                const isCurrentTime = isCurrentTimeColumn(dayIndex, hour, fixedHoursToShow);
                return (
                  <div
                    key={`${day.date}-${hour}-temp`}
                    className={`col-span-1 py-2 text-center border-r dark:border-slate-600 ${
                      getTimeBackgroundColor(hour, isCurrentTime)
                    }`}
                  >
                    <span className={`text-sm font-medium ${getTimeTextColor(hour, isCurrentTime)}`}>
                      {hourData ? Math.round(convertToDisplayUnit(hourData.temp_c)) : "-"}
                      {hourData ? unitSymbol : ""}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Daily Summary row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10 shadow-md">
              Forecast range:
            </div>
            {days.map((day, dayIndex) => (
              <div
                key={`${day.date}-summary`}
                className={`col-span-12 text-center py-2 border-r dark:border-slate-600 ${dayIndex === days.length - 1 ? "border-r-0" : ""}`}
              >
                <div className="flex flex-col items-center px-1 sm:px-2">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <div className="hidden xs:block">
                      {getWeatherIcon(day.day.condition.code, 1)}
                    </div>
                    <span className="text-xs sm:text-sm font-medium dark:text-white truncate max-w-[70px] sm:max-w-full">
                      {day.day.condition.text}
                    </span>
                  </div>
                  <div className="flex gap-1 sm:gap-3 text-xs sm:text-sm dark:text-gray-300">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {Math.round(convertToDisplayUnit(day.day.mintemp_c))}
                      {unitSymbol}
                    </span>
                    <span>-</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {Math.round(convertToDisplayUnit(day.day.maxtemp_c))}
                      {unitSymbol}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] sm:text-xs flex items-center gap-1 whitespace-nowrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2 w-2 sm:h-3 sm:w-3 text-blue-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                    </svg>
                    <span className="dark:text-gray-400">
                      {day.day.totalprecip_mm > 0
                        ? `${day.day.totalprecip_mm}mm`
                        : "No rain"}
                      {day.hour.some(
                        (h) => h.chance_of_rain > 20 || h.chance_of_snow > 20,
                      ) && (
                        <span className="ml-1 text-blue-500 dark:text-blue-400 font-semibold">
                          (
                          {Math.max(
                            ...day.hour.map((h) =>
                              Math.max(
                                h.chance_of_rain || 0,
                                h.chance_of_snow || 0,
                              ),
                            ),
                          )}
                          %)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weather icon row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-600 dark:text-gray-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
              </svg>
            </div>
            {days.map((day, dayIndex) => {
              const hoursSet =
                dayIndex === 0 ? currentDayHours : fixedHoursToShow;

              return hoursSet.map((hour) => {
                const hourData = day.hour.find(
                  (h) => new Date(h.time).getHours() === hour,
                );
                if (!hourData) return null;
                // Check if this is the first day and current hour (or closest to current hour)
                const isCurrentHour =
                  dayIndex === 0 &&
                  ((currentHour >= hour && currentHour < hour + 2) ||
                    (hour === hoursSet[hoursSet.length - 1] &&
                      currentHour >= hour));

                return (
                  <div
                    key={hourData.time}
                    className={`col-span-1 py-3 px-1 text-center border-r dark:border-slate-600 
                      ${isCurrentHour ? "bg-blue-50 dark:bg-blue-900" : ""}`}
                  >
                    {getWeatherIcon(hourData.condition.code, hourData.is_day)}
                  </div>
                );
              });
            })}
          </div>

          {/* Rain row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
              <span>Rain</span>
              <span className="ml-1 text-xs">mm</span>
            </div>
            {days.map((day, dayIndex) => {
              const hoursSet =
                dayIndex === 0 ? currentDayHours : fixedHoursToShow;

              return hoursSet.map((hour) => {
                const hourData = day.hour.find(
                  (h) => new Date(h.time).getHours() === hour,
                );
                if (!hourData) return null;
                const precipitation = hourData.precip_mm;
                return (
                  <div
                    key={hourData.time}
                    className="col-span-1 py-3 px-1 text-center text-xs border-r dark:text-gray-300 dark:border-slate-600"
                  >
                    {precipitation > 0 ? precipitation.toFixed(2) : "-"}
                  </div>
                );
              });
            })}
          </div>

          {/* Precipitation Probability Chart */}
          <PrecipitationChart
            weatherData={weatherData}
            currentDayHours={currentDayHours}
            fixedHoursToShow={fixedHoursToShow}
            days={days}
            gridCols={gridCols}
            isCurrentTimeColumn={isCurrentTimeColumn}
            currentHour={currentHour}
          />

          {/* Air Quality row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
              <span>Air quality</span>
            </div>
            {days.map((day, dayIndex) => {
              const hoursSet =
                dayIndex === 0 ? currentDayHours : fixedHoursToShow;

              return hoursSet.map((hour) => {
                const hourData = day.hour.find(
                  (h) => new Date(h.time).getHours() === hour,
                );
                if (!hourData) return null;

                // Air quality index (US EPA standard: 1-6)
                // 1 = Good, 2 = Moderate, 3 = Unhealthy for sensitive groups,
                // 4 = Unhealthy, 5 = Very Unhealthy, 6 = Hazardous
                const airQualityIndex =
                  hourData.air_quality?.["us-epa-index"] || 1;

                // Color based on air quality
                let bgColorClass = "bg-green-100 text-green-800"; // Default Good
                if (airQualityIndex === 2)
                  bgColorClass = "bg-yellow-100 text-yellow-800"; // Moderate
                else if (airQualityIndex === 3)
                  bgColorClass = "bg-orange-100 text-orange-800"; // Unhealthy for sensitive
                else if (airQualityIndex === 4)
                  bgColorClass = "bg-red-100 text-red-800"; // Unhealthy
                else if (airQualityIndex === 5)
                  bgColorClass = "bg-purple-100 text-purple-800"; // Very Unhealthy
                else if (airQualityIndex === 6)
                  bgColorClass = "bg-gray-800 text-white"; // Hazardous

                // Text label
                let qualityLabel = "Good";
                if (airQualityIndex === 2) qualityLabel = "Moderate";
                else if (airQualityIndex === 3) qualityLabel = "Sensitive";
                else if (airQualityIndex === 4) qualityLabel = "Unhealthy";
                else if (airQualityIndex === 5) qualityLabel = "Very Unhealthy";
                else if (airQualityIndex === 6) qualityLabel = "Hazardous";

                return (
                  <div
                    key={hourData.time}
                    className={`col-span-1 py-1 px-1 text-center text-xs border-r dark:border-slate-600 ${bgColorClass}`}
                  >
                    <div className="font-medium">{qualityLabel}</div>
                    <div>{airQualityIndex}</div>
                  </div>
                );
              });
            })}
          </div>

          {/* Wind gusts row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
              <span>Wind gusts</span>
              <span className="ml-1 text-xs">kt</span>
            </div>
            {days.map((day, dayIndex) => {
              const hoursSet =
                dayIndex === 0 ? currentDayHours : fixedHoursToShow;

              return hoursSet.map((hour) => {
                const hourData = day.hour.find(
                  (h) => new Date(h.time).getHours() === hour,
                );
                if (!hourData) return null;
                // Convert km/h to knots (1 km/h = 0.539957 knots)
                const windGustKnots = Math.round(hourData.gust_kph * 0.539957);
                const isStrong = windGustKnots >= 20;
                return (
                  <div
                    key={hourData.time}
                    className={`col-span-1 py-3 px-1 text-center text-xs border-r dark:text-gray-300 dark:border-slate-600 ${isStrong ? "bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-100" : ""}`}
                  >
                    {windGustKnots}
                  </div>
                );
              });
            })}
          </div>

          {/* Wind speed row */}
          <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
              <span>Wind</span>
              <span className="ml-1 text-xs">km/h</span>
            </div>
            {days.map((day, dayIndex) => {
              const hoursSet =
                dayIndex === 0 ? currentDayHours : fixedHoursToShow;

              return hoursSet.map((hour) => {
                const hourData = day.hour.find(
                  (h) => new Date(h.time).getHours() === hour,
                );
                if (!hourData) return null;
                const windSpeed = hourData.wind_kph;
                const isStrong = windSpeed > 15;
                return (
                  <div
                    key={hourData.time}
                    className={`col-span-1 py-3 px-1 text-center text-xs border-r dark:text-gray-300 dark:border-slate-600 ${isStrong ? "bg-blue-50 dark:bg-blue-900 dark:text-blue-100 font-semibold" : ""}`}
                  >
                    {windSpeed}
                  </div>
                );
              });
            })}
          </div>

          {/* Wind direction row */}
          <div className={`grid ${gridCols} dark:border-slate-600`}>
            <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
              <span>Wind dir.</span>
            </div>
            {days.map((day, dayIndex) => {
              const hoursSet =
                dayIndex === 0 ? currentDayHours : fixedHoursToShow;

              return hoursSet.map((hour) => {
                const hourData = day.hour.find(
                  (h) => new Date(h.time).getHours() === hour,
                );
                if (!hourData) return null;
                const windDirection = hourData.wind_dir;
                return (
                  <div
                    key={hourData.time}
                    className="col-span-1 py-3 px-1 text-center border-r dark:border-slate-600 last:border-r-0 dark:text-gray-300"
                    dangerouslySetInnerHTML={{
                      __html: getWindDirectionIcon(windDirection),
                    }}
                  ></div>
                );
              });
            })}
          </div>
        </div>
      </div>

      {/* Summary table at the bottom */}
      <div className="mt-4 p-2 sm:p-4 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 dark:text-white px-2">
          Forecast Summary
        </h3>
        <div className="overflow-x-auto rounded-lg border dark:border-slate-600">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Day / Date
                </th>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Forecast
                </th>
                <th
                  scope="col"
                  className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-indigo-600 dark:text-indigo-300 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30"
                >
                  Wind & Air Quality
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
              {days.map((day) => {
                const date = new Date(day.date);
                const formattedDate = date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                });

                // For mobile, create a shorter date format
                const shortFormattedDate = date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr key={day.date}>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      <span className="hidden sm:inline">{formattedDate}</span>
                      <span className="sm:hidden">{shortFormattedDate}</span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="flex-shrink-0 mr-3">
                            {getWeatherIcon(day.day.condition.code, 1)}
                          </div>
                          <div className="sm:hidden font-medium">
                            {day.day.condition.text}
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="hidden sm:block font-medium">
                            {day.day.condition.text}
                          </div>
                          <div className="flex flex-wrap sm:flex-nowrap mt-1 gap-x-3 gap-y-2">
                            <span className="flex items-center">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                Min:{" "}
                                {Math.round(
                                  convertToDisplayUnit(day.day.mintemp_c),
                                )}
                                {unitSymbol}
                              </span>
                            </span>
                            <span className="flex items-center">
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                Max:{" "}
                                {Math.round(
                                  convertToDisplayUnit(day.day.maxtemp_c),
                                )}
                                {unitSymbol}
                              </span>
                            </span>
                            <span className="flex items-center whitespace-nowrap">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                              </svg>
                              <span className="hidden sm:inline">
                                {day.day.totalprecip_mm > 0
                                  ? `${day.day.totalprecip_mm}mm precipitation`
                                  : "No precipitation"}
                                {day.hour.some(
                                  (h) =>
                                    h.chance_of_rain > 20 ||
                                    h.chance_of_snow > 20,
                                ) &&
                                  `, ${Math.max(...day.hour.map((h) => Math.max(h.chance_of_rain || 0, h.chance_of_snow || 0)))}% max chance`}
                              </span>
                              <span className="sm:hidden">
                                {day.day.totalprecip_mm > 0
                                  ? `${day.day.totalprecip_mm}mm`
                                  : "No rain"}
                                {day.hour.some(
                                  (h) =>
                                    h.chance_of_rain > 20 ||
                                    h.chance_of_snow > 20,
                                ) &&
                                  ` (${Math.max(...day.hour.map((h) => Math.max(h.chance_of_rain || 0, h.chance_of_snow || 0)))}%)`}
                              </span>
                            </span>
                            <span className="flex items-center whitespace-nowrap">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9.6 20H14.4"></path>
                                <path d="M12 12V16"></path>
                                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"></path>
                              </svg>
                              <span className="hidden sm:inline">
                                Humidity: {day.day.avghumidity}%
                              </span>
                              <span className="sm:hidden">
                                Hum: {day.day.avghumidity}%
                              </span>
                            </span>
                          </div>
                          <div className="flex flex-wrap sm:flex-nowrap mt-2 gap-x-3 gap-y-2">
                            {/* Wind speed information */}
                            <span className="flex items-center whitespace-nowrap">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                              </svg>
                              <span
                                className={`${day.day.maxwind_kph > 15 ? "font-semibold text-blue-600 dark:text-blue-300" : ""}`}
                              >
                                <span className="hidden sm:inline">
                                  Wind: {day.day.maxwind_kph} km/h max
                                </span>
                                <span className="sm:hidden">
                                  Wind: {day.day.maxwind_kph} km/h
                                </span>
                                {day.day.maxwind_kph > 15 && (
                                  <span className="ml-1 text-xs">(strong)</span>
                                )}
                              </span>
                            </span>

                            {/* Air quality information */}
                            <span className="flex items-center whitespace-nowrap">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {(() => {
                                // Find the average air quality for the day (noon time usually best represents the day)
                                const noonHour = day.hour.find(
                                  (h) => new Date(h.time).getHours() === 12,
                                );
                                const airQualityIndex =
                                  noonHour?.air_quality?.["us-epa-index"] || 1;

                                // Get appropriate color and text
                                let qualityClass =
                                  "text-green-600 dark:text-green-400";
                                let qualityText = "Good";

                                if (airQualityIndex === 2) {
                                  qualityClass =
                                    "text-yellow-600 dark:text-yellow-400";
                                  qualityText = "Moderate";
                                } else if (airQualityIndex === 3) {
                                  qualityClass =
                                    "text-orange-600 dark:text-orange-400";
                                  qualityText = "Unhealthy (sensitive)";
                                } else if (airQualityIndex === 4) {
                                  qualityClass =
                                    "text-red-600 dark:text-red-400";
                                  qualityText = "Unhealthy";
                                } else if (airQualityIndex === 5) {
                                  qualityClass =
                                    "text-purple-600 dark:text-purple-400";
                                  qualityText = "Very Unhealthy";
                                } else if (airQualityIndex === 6) {
                                  qualityClass =
                                    "text-gray-800 dark:text-gray-300";
                                  qualityText = "Hazardous";
                                }

                                return (
                                  <span
                                    className={`${qualityClass} font-medium`}
                                  >
                                    <span className="hidden sm:inline">
                                      Air Quality: {qualityText}
                                    </span>
                                    <span className="sm:hidden">
                                      AQ: {qualityText}
                                    </span>
                                  </span>
                                );
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm bg-indigo-50/50 dark:bg-indigo-900/10">
                      <div className="flex flex-col gap-2">
                        {/* Wind speed information */}
                        <div className="flex flex-col">
                          <div className="flex items-center mb-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                            </svg>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Wind Speed
                            </span>
                          </div>
                          <div
                            className={`ml-5 ${day.day.maxwind_kph > 15 ? "text-blue-600 dark:text-blue-300 font-semibold" : "text-gray-600 dark:text-gray-300"}`}
                          >
                            <span className="whitespace-nowrap">
                              {day.day.maxwind_kph} km/h max
                              {day.day.maxwind_kph > 15 && (
                                <span className="ml-1 text-xs inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-blue-700 dark:text-blue-200">
                                  strong
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Air quality information */}
                        <div className="flex flex-col mt-2">
                          <div className="flex items-center mb-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" />
                              <path d="M10 6C9.44772 6 9 6.44772 9 7V10C9 10.5523 9.44772 11 10 11H12C12.5523 11 13 10.5523 13 10C13 9.44772 12.5523 9 12 9H11V7C11 6.44772 10.5523 6 10 6Z" />
                            </svg>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              Air Quality
                            </span>
                          </div>
                          {(() => {
                            // Find the average air quality for the day (noon time usually best represents the day)
                            const noonHour = day.hour.find(
                              (h) => new Date(h.time).getHours() === 12,
                            );
                            const airQualityIndex =
                              noonHour?.air_quality?.["us-epa-index"] || 1;

                            // Get appropriate color and background
                            let qualityClass =
                              "text-green-700 dark:text-green-400";
                            let bgClass = "bg-green-100 dark:bg-green-900/40";
                            let qualityText = "Good";

                            if (airQualityIndex === 2) {
                              qualityClass =
                                "text-yellow-700 dark:text-yellow-400";
                              bgClass = "bg-yellow-100 dark:bg-yellow-900/40";
                              qualityText = "Moderate";
                            } else if (airQualityIndex === 3) {
                              qualityClass =
                                "text-orange-700 dark:text-orange-400";
                              bgClass = "bg-orange-100 dark:bg-orange-900/40";
                              qualityText = "Sensitive";
                            } else if (airQualityIndex === 4) {
                              qualityClass = "text-red-700 dark:text-red-400";
                              bgClass = "bg-red-100 dark:bg-red-900/40";
                              qualityText = "Unhealthy";
                            } else if (airQualityIndex === 5) {
                              qualityClass =
                                "text-purple-700 dark:text-purple-400";
                              bgClass = "bg-purple-100 dark:bg-purple-900/40";
                              qualityText = "Very Unhealthy";
                            } else if (airQualityIndex === 6) {
                              qualityClass = "text-gray-800 dark:text-gray-300";
                              bgClass = "bg-gray-200 dark:bg-gray-800";
                              qualityText = "Hazardous";
                            }

                            return (
                              <div className="ml-5">
                                <span
                                  className={`inline-block px-2 py-1 rounded ${bgClass} ${qualityClass} font-medium`}
                                >
                                  {qualityText}
                                  <span className="ml-1 font-normal text-xs">
                                    ({airQualityIndex}/6)
                                  </span>
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
