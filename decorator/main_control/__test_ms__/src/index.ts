import TarsusMsApplication from '../../decorator/app/microservice'
import {LoadInterface, LoadServer, LoadStruct, LoadTaro} from "../../load_server/load_ms_app";
import TaroInterFaceImpl from "./interface/TaroInterFace";

@TarsusMsApplication
class ArcServerTest {
    static main() {
        LoadInterface([TaroInterFaceImpl]);
        LoadTaro()
        LoadStruct()
        LoadServer();

    }
}

ArcServerTest.main()