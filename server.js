const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(3000).sockets;

mongo.connect('mongodb://127.0.0.1/chatapp',function(err,db){

      if (err) {
          throw err;
      }

      console.log('MongoDB connected');

      io.on('connection',function(socket){

          let chat = db.collection('chats');

          sendStatus = function(stat){
             socket.emit('status',stat);
          }

// Obtaining Chats from collection
          chat.find().limit(100).sort({_id:1}).toArray(function(err,res){

             if (err) {
                throw err;
             }

             socket.emit('output',res);
          });

// Input events
          socket.on('input',function(data){

              let name = data.name;
              let message = data.message;

              if (name=='' || message =='') {
                  sendStatus('Name/Message missing');
              } else {

                chat.insert({name:name, message:message},function(){

                    io.emit('output',[data]);

                    sendStatus({
                      message: 'Message sent',
                      clear: true
                    });
                });

              }
          });

// Clear Chats
          socket.on('clear',function(data){
            chat.remove({},function(){
              socket.emit('cleared');
            });
          });
      });
});
