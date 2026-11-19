import {createQaApi} from './qa-api.mjs';
const server=createQaApi({webOrigin:'http://127.0.0.1:5324'});
server.listen(5323,'127.0.0.1',()=>console.log('Synthetic homepage account QA: http://127.0.0.1:5323/qa'));
