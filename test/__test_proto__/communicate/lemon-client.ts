import { EventEmitter } from "events";
import * as net from 'net'
import { getUserListRes } from '../bin/ample' 
import { $WriteHead } from "./utils";
class LemonClient {

    public localData : Buffer | undefined; // 本地缓冲区
    public Position:number;
    public BufferLength:number;
    public Servant;
    public Connection;
    public Socket   :   net.Socket;

    constructor(Servant:net.SocketConnectOpts){
        // super()
        this.Reset();
        this.Socket = new net.Socket();
        this.Socket.connect(Servant)
        this.Registration(this.Socket)
    }

    // 拿到包以后需要先判断包是否完整
    // 如果不完整，则存入localData中
    $OnData(buf:Buffer){
        const View = new DataView(buf.buffer)
        const exist = this.Position === 0;
        // 当前缓冲区是正常的
        if(!exist){
            const BufferLength = View.getInt32(0)
            // 完整包
            if(View.byteLength == BufferLength){
                this.$WriteToServer(buf);
                this.Reset()
                return;
            }
            // 不完整包 包大小 < 给定的大小
            if(View.byteLength < BufferLength){
                this.BufferLength = BufferLength;
                this.Position += View.byteLength;
                this.localData = Buffer.concat([this.localData!,buf])
                return;
            }
        }

        if(exist){
            const BufferLength = buf.byteLength;
            const canWrite = this.Position + BufferLength === this.BufferLength;
            if(canWrite){
                const feedBuf = Buffer.concat([this.localData!,buf])
                this.$WriteToServer(feedBuf);
                this.Reset()
            }
            if(!canWrite){
                this.Position += View.byteLength;
                this.localData = Buffer.concat([this.localData!,Buffer.from(View.buffer)])
            }
        }
    }
    $OnConncet(){
        const write_getuserres = new getUserListRes.Write();
        debugger;
        const wgres = write_getuserres
          .Serialize({
            code: 0,
            message: "ok",
            data: [
              {
                id: 0,
                name: "leemulus",
                age: 13,
                phone: "12321412321",
                address: "wuhan",
              },
              {
                id: 1,
                name: "leemulus",
                age: 14,
                phone: "12321412321",
                address: "wuhan",
              },
              {
                id: 2,
                name: "leemulus",
                age: 15,
                phone: "12321412321",
                address: "wuhan",
              },
            ],
            user: {
              id: 0,
              name: "leemulus",
              age: 13,
              phone: "12321412321",
              address: "wuhan",
            },
          })
          .toBuf()!;
        this.$WriteToServer(wgres)
        console.log("已连接至24001");
    }

    $WriteToServer(data:Buffer){
        const _buf = $WriteHead(data)
        this.Socket.write(_buf)
    }

    Registration(Socket:net.Socket){
        Socket.on('data',this.$OnData);
        Socket.on('connect',this.$OnConncet.bind(this))
    }
    
    Reset(){
        this.localData = undefined;
        this.localData = Buffer.alloc(0);
        this.Position = 0;
        this.BufferLength = 0;
    }

}

new LemonClient({
    'port':24001
})