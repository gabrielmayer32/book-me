// dateTimeHelpers.js
export const adjustTimeToNearestQuarterHour = (time) => {
    const roundedMinutes = Math.round(time.getMinutes() / 15) * 15;
    return new Date(time.setMinutes(roundedMinutes));
  };
  
  export const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  