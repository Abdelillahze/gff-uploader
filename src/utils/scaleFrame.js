const Jimp = require("jimp");

const scaleFrame = async function (frame) {
  const image = await Jimp.read(frame);

  image.resize(Jimp.AUTO, 1920 / 1.38);

  return image;
};

module.exports = { scaleFrame };
