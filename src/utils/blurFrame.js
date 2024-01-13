const Jimp = require("jimp");

const blurFrame = async function (frame) {
  return (await Jimp.read(frame)).blur(5).resize(Jimp.AUTO, 1920);
};

module.exports = { blurFrame };
