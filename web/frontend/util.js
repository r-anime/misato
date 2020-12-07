/**
 * Gets a URL from a Discord icon hash
 * @param {string} guildID Guild ID
 * @param {string} icon Icon hash
 * @param {number} [size] Size in pixels
 * @returns {string}
 */
export function discordIconURL (guildID, icon, size) {
	return `https://cdn.discordapp.com/icons/${guildID}/${icon}.png${size ? `?size=${size}` : ''}`;
}
