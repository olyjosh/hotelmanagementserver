/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var cron = require('node-schedule');



function cronStart() {

    cron.scheduleJob('1 * * * * *', function () {
        console.log('This runs at the 1 mintue.');
    });

}

function cron2(){
    var date = new Date(2016, 9, 07, 05, 17, 00);
    var rule = new cron.RecurrenceRule();
    rule.second = 30;
    cron.scheduleJob(date,function () {
        console.log(new Date(), "Somthing YYYY important is going to happen today!");
    });

}
cron2();

//cronStart();

module.exports = cron;