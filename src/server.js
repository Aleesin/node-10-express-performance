const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const logger = require("morgan");

const AppRouter = require("./routes/AppRouter");
const Router = new AppRouter().router;

class Server {
  constructor() {
    this.express = express();
    this.middleware();
    this.productionSetup();
    this.routes();
    this.noRouteErrorHandling();
    this.genericErrorHandling();
  }

  isProd() {
    return this.express.get("env") === "production";
  }

  middleware() {
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
    this.express.use(cookieParser());
    this.express.disable("x-powered-by");
    this.express.use((request, response, next) => {
      response.header("Content-Type", "application/json");
      next();
    });
  }

  productionSetup() {
    this.isProd()
      ? this.express.use(logger("combined"))
      : this.express.use(logger("dev"));
    this.express.set("trust proxy", this.isProd());
  }

  routes() {
    this.express.use("/", Router);
  }

  noRouteErrorHandling() {
    // catch 404 and forward to error handler
    this.express.use((request, response, next) => {
      const error = new Error("Not Found");
      error.status = 404;
      next(error);
    });
  }

  genericErrorHandling() {
    this.express.use((error, request, response, next) => {
      response.locals.message = error.message;
      response.locals.error = error;
      // send error
      response
        .status(error.status || 500)
        .send({error: response.locals.error.message});
    });
  }
}

module.exports = Server;
