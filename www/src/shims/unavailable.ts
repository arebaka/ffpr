// load and save of ffpr need the file system, the editor uses only unpack and pack
const unavailable = (): never => {
	throw new Error('There is no file system in the browser');
};

export {
	unavailable as readFileSync,
	unavailable as resolve,
	unavailable as writeFileSync,
};
