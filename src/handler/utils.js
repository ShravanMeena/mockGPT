export function capitalizeString(str) {
    return typeof str === "string" ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}