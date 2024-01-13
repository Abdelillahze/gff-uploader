const Jimp = require("jimp");
const fs = require("fs-extra");
const util = require("util");

const exec = util.promisify(require("child_process").exec);
const { blurFrame } = require("./utils/blurFrame");
const { scaleFrame } = require("./utils/scaleFrame");
const { combineFrames } = require("./utils/combineFrames");

const debug = true;
const videoEncoder = "h264";
const input = "jnon.mp4";
const output = `${input.split(".")[0]}_edited.mp4`;
(async function () {
  try {
    // temp files
    await fs.mkdir("temp");
    await fs.mkdir("temp/raw-frames");
    await fs.mkdir("temp/edited-frames");
    await fs.mkdir("temp/edited-frames/result");

    console.log("decoding");
    await exec(`ffmpeg -i "${input}" temp/raw-frames/%d.png`);

    console.log("rendering");
    const frames = fs.readdirSync("temp/raw-frames");
    let frameWidth = 0;

    for (let count = 1; count <= frames.length; count++) {
      let frame = await Jimp.read(`temp/raw-frames/${count}.png`);
      let bluredFrame = await blurFrame(frame);
      let scaledFrame = await scaleFrame(frame);
      let resultFrame = await combineFrames(bluredFrame, scaledFrame);

      frameWidth = resultFrame.bitmap.width;

      // await bluredFrame.writeAsync(`temp/edited-frames/blured/${count}.png`);
      await resultFrame.writeAsync(`temp/edited-frames/result/${count}.png`);
    }

    console.log("enconding");
    await exec(
      `ffmpeg -start_number 1 -i temp/edited-frames/result/%d.png -vcodec ${videoEncoder} -filter:v "setpts=0.825*PTS" -r 30 temp/no-audio.mp4`
    );

    console.log("adding audio");
    await exec(
      `ffmpeg -i temp/no-audio.mp4 -i "${input}" -filter:v "crop=w=1080:h=1920:x=${
        3415 / 2 - 1080 / 2
      }:y=0" -map 0:v:0 -map 1:a:0 -pix_fmt yuv420p "${output}"`
    );

    if (debug === false) {
      console.log("removing temp files");
      fs.remove("temp");
    }
    console.log("finished");
  } catch (err) {
    console.log("error: ", err);

    if (debug === false) {
      await fs.remove("temp");
    }
  }
})();
