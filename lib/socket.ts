import { Server } from "socket.io";

export function initSocket(server:any){

const io = new Server(server,{
cors:{
origin:"*"
}
})

io.on("connection",(socket)=>{

socket.on("join_stream",(streamId)=>{
socket.join(streamId)
})

socket.on("send_message",(data)=>{
io.to(data.streamId).emit("receive_message",data)
})

})

}