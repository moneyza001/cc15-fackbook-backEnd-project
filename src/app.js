require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const morgan = require("morgan");

const notFoundMiddleware = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");
const rateLimitMiddleware = require("./middlewares/rate-limit");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const friendRoute = require("./routes/friendRoute");
const postRoute = require("./routes/postRoute");

app.use(cors());
app.use(morgan("dev"));
app.use(rateLimitMiddleware);
app.use(express.json());

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/friend", friendRoute);
app.use("/post", postRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || "5000";
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
