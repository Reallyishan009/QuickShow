const timeFormat = (minutes) =>{
    const hours = Math.floor(minutes / 60);
    const minsRemainder = minutes % 60;

    return `${hours}h ${minsRemainder}m`;
}

export default timeFormat;