/*
 Copyright 2024 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

 const express = require('express');
 const app = express();
 const bodyParser = require('body-parser');
 
 const port  = 8080;
 const urlencodedParser = bodyParser.urlencoded({extended:true}); 
 
 function main() {
   app.use('/', express.static('public'));
   app.use(urlencodedParser);
   app.use(express.json());
 
   app.post('/request-route', (req,res) => {    
     fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "X-Goog-Api-Key": "YOUR_API_KEY",
         "X-Goog-FieldMask": "*"
       },
       body: JSON.stringify(req.body)
     }).then((response) => {
       return response.json();
     }).then((data) => {
       if('error' in data){
         console.log(data.error);
       } else if(!data.hasOwnProperty("routes")){
         console.log("No route round");
       } else {
         res.end(JSON.stringify(data));
       }
     }).catch((error) => {
       console.log(error)
     });
   });
 
   app.listen(port, () => {
       console.log('App listening on port ${port}: ' + port);
       console.log('Press Ctrl+C to quit.');
   });
 }
 
 main();
 