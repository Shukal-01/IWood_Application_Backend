const getDateTimeInStringFormat = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function getTimeDifference(datetime1, datetime2) {
    // Convert the datetime strings to Date objects
    const date1 = new Date(datetime1);
    const date2 = new Date(datetime2);

    // Calculate the difference in milliseconds
    const diffInMs = Math.abs(date2 - date1);

    // Convert the difference to minutes and seconds
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInSeconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

    // Return the result as an object
    return {
        minutes: diffInMinutes,
        seconds: diffInSeconds,
    };
}

function getCurrentDateFormated() {
    // Get the current timestamp
    const timestamp = Date.now();

    // Convert the timestamp into a Date object
    const dateObject = new Date(timestamp);

    // Extract day, month, and year
    const day = String(dateObject.getDate()).padStart(2, '0'); // Add leading zero if needed
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = dateObject.getFullYear();

    // Format the date as dd-mm-yyyy
    return `${day}-${month}-${year}`;
}
 



module.exports = { getDateTimeInStringFormat, getTimeDifference,getCurrentDateFormated }