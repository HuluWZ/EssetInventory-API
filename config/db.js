const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", true);
mongoose.connect(
  process.env.REMOTE_MONGODB_URL,
  { useNewUrlParser: true },
  (err) => {
    if (!err) {
      console.log("MongoDB connection succeeded.");
    } else {
      console.log(
        "Error in MongoDB connection : " + JSON.stringify(err, undefined, 2)
      );
    }
  }
);
mongoose.set("runValidators", true);
