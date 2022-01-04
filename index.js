const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv/config");

const axios = require("axios").default;
const sharp = require("sharp");

app.use(cors({ origin: true }));

app.get("/", async (req, res) => {
  try {
    const { url, width, height, fit } = req.query;
    if (!url)
      return res.send(
        "Image Resize Proxy. Params: url, width, height, fit (cover, contain, fill, inside, outside)"
      );

    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    if (!response.headers["content-type"].startsWith("image"))
      return res.status(400).send("Only images are accepted");

    const options = { width: Number(width), height: Number(height), fit };

    for (const key in options) {
      if (!options[key]) delete options[key];
    }

    sharp(response.data)
      .resize(options)
      .toBuffer()
      .then((value) => {
        res.setHeader("content-type", response.headers["content-type"]);
        res.send(value);
      });
  } catch (error) {
    console.log(error);
    if (!res.headerSent) res.sendStatus(500);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
