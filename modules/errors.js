exports.ResourceNotFound = (name, specifics) => {
    const message = `(${name}) did not return results.`;
    const options = { 
        cause: specifics
    };
    return new Error(message, options);
}