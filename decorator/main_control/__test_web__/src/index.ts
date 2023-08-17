import TarsusHttpApplication from "../../decorator/app/http";
import {LoadController, LoadInit, LoadServer, LoadStruct, LoadTaro} from "../../load_server/load_web_app";
import UserController from "./controller/UserController";

@TarsusHttpApplication
class HttpServer{
    static main(){
        LoadController([UserController])
        // init
        LoadInit((app)=>{
            console.log("hello world")
        });
        LoadStruct()
        LoadTaro()
        // load
        LoadServer({
            load_ms:true
        })
    }
}

HttpServer.main()