const Jimp = require("jimp");

const combineFrames = async function (bluredFrame, scaledFrame) {
  const bluredImage = await Jimp.read(bluredFrame);
  const scaledImage = await Jimp.read(scaledFrame);
  const { width: mWidth, height: mHeight } = bluredImage.bitmap;
  const { width: sWidth, height: sHeight } = scaledImage.bitmap;

  const resultImage = bluredImage.composite(
    scaledImage,
    mWidth / 2 - sWidth / 2,
    mHeight / 2 - sHeight / 2
  );

  return resultImage;
};

module.exports = { combineFrames };
