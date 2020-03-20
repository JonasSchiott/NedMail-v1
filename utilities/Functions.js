module.exports = {
	capitalise: str => str.slice(0, 1).toUpperCase() + str.slice(1),
	cleanName: tag => {
		const name = tag.split("#");
		const cleanName = name[0].replace(/\W+/g, "") || "unknown";
		return `${cleanName.slice(0, 95)}-${name[1]}`;
	},
	format: (str, ...args) => {
		for (const arg of args) str = str.replace(/{}/, arg);
		return str;
	}
};
