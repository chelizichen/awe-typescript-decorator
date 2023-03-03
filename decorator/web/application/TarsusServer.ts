import express, { Express } from "express";
import { controllers } from "../controller/routers";
import { Application, ApplicationEvents } from "./index";
import { TarsusGlobalPipe } from "../pipe";
import { nextTick, cwd } from "process";
import path from "path";
import { TarsusOrm } from "../orm/TarsusOrm";

function loadController(args: Function[]) {
  args.forEach((el) => {
    console.log(el.name, " is  loader success");
  });

  ApplicationEvents.emit(Application.LOAD_SERVER);
}

function loadServer() {
  // 加载配置
  ApplicationEvents.emit(Application.LOAD_CONFIG);

  // 最后监听
  ApplicationEvents.emit(Application.LOAD_LISTEN);
}

function loadInit(callback: (app: Express) => void) {
  ApplicationEvents.on(Application.LOAD_INIT, (app) => {
    callback(app);
  });
}

const TarsusHttpApplication = (value: any, context: ClassDecoratorContext) => {
  let port = 9811;
  context.addInitializer(() => {
    const app = express();
    app.use(express.json());

    // 执行初始化逻辑

    // 加载配置文件
    ApplicationEvents.on(Application.LOAD_CONFIG, function () {
      const config_path = path.resolve(cwd(), "tarsus.config.js");
      const _config = require(config_path);
      port = _config.servant.port;
      ApplicationEvents.emit(Application.LOAD_DATABASE, _config);
    });

    // 加载数据库
    ApplicationEvents.on(Application.LOAD_DATABASE, TarsusOrm.CreatePool);
    // 全局管道
    ApplicationEvents.on(
      Application.LOAD_PIPE,
      function (args: Array<new () => TarsusGlobalPipe>) {
        args.forEach((pipe) => {
          let _pipe = new pipe();
          app.use("*", (req, res, next) => _pipe.next(req, res, next));
        });
      }
    );

    // 加载路由
    ApplicationEvents.on(Application.LOAD_SERVER, () => {
      controllers.forEach((value: any) => {
        app.use(value);
      });
    });

    // 监听
    ApplicationEvents.on(Application.LOAD_LISTEN, () => {
      nextTick(() => {
        ApplicationEvents.emit(Application.LOAD_INIT, app);
        app.listen(port, function () {
          console.log("Server started at port: ", port);
        });
      });
    });
  });
};

export { TarsusHttpApplication, loadController, loadServer, loadInit };
