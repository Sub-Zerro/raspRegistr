const express = require("express");

const app = express();
const ip = require('ip');
ipfilter = require('express-ipfilter').IpFilter;

let idCount = 0;
const PORT = process.env.PORT || 3000;


function sendDB(userName, userEmail, phoneinfo, ip) {
    const {Pool, Client} = require('pg');

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const pool = new Pool({
        host: 'ec2-44-195-169-163.compute-1.amazonaws.com',
        // Do not hard code your username and password.
        // Consider using Node environment variables.
        user: 'dovpfdvtqiqpig',
        password: '29582c9e51b7a58a215fecb40aa88311170b4e49bc3953347f3d433704d36b9a',
        database: 'd30845016oob61',
        port: 5432,
        ssl: true
    })

    pool.query(`
            INSERT INTO users(name,email,phoneinfo,ip)values('${userName}','${userEmail}', '${phoneinfo}', '${ip}')

    `, (err, res) => {
        console.log(err, res);
        pool.end();
    })
}

function sendBadDB(IP) {
    const {Pool, Client} = require('pg');

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const pool = new Pool({
        host: 'ec2-44-195-169-163.compute-1.amazonaws.com',
        // Do not hard code your username and password.
        // Consider using Node environment variables.
        user: 'dovpfdvtqiqpig',
        password: '29582c9e51b7a58a215fecb40aa88311170b4e49bc3953347f3d433704d36b9a',
        database: 'd30845016oob61',
        port: 5432,
        ssl: true
    })

    pool.query(`
            INSERT INTO bad_users(badip)values('${IP}')

    `, (err, res) => {
        console.log(err, res);
        pool.end();
    })
}

function sendEmail(nameOfUser, emailOfUser) {
    var mailer = require("nodemailer");


    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Use Smtp Protocol to send Email
    var smtpTransport = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'rasp17gimn@gmail.com',
            pass: 'galin@227'
        }
    });

    var mail = {
        from: "Разработчики расписания <rasp17gimn@gmail.com>",
        to: `${emailOfUser}`,
        subject: "Регистрация в базе расписания 17 гимназии",
        text: `${nameOfUser}, вы успешно прошли регистрацию в базе расписания 17 гимназии. Теперь вы сможете получать уведомления о новых изменениях себе на указаную почту.
        `,
    }

    smtpTransport.sendMail(mail, function (error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
    });


}

// создаем парсер для данных application/x-www-form-urlencoded
const urlencodedParser = express.urlencoded({extended: false});

let bad_arr = [];
let threeLastPosts = [];

function checkBadIP() {
    const pg = require('pg');

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const config = {
        host: 'ec2-44-195-169-163.compute-1.amazonaws.com',
        // Do not hard code your username and password.
        // Consider using Node environment variables.
        user: 'dovpfdvtqiqpig',
        password: '29582c9e51b7a58a215fecb40aa88311170b4e49bc3953347f3d433704d36b9a',
        database: 'd30845016oob61',
        port: 5432,
        ssl: true
    };

    const client = new pg.Client(config);

    client.connect(err => {
        if (err) throw err;
        else {
            queryDatabase();
        }
    });


    function queryDatabase() {

        console.log(`Running query to PostgreSQL server: ${config.host}`);

        const query = "select * from bad_users;";

        client.query(query)
            .then(res => {
                const rows = res.rows;

                rows.map(row => {
                    console.log(`Read: ${JSON.stringify(row)}`);
                });

                for (let i = 0; i < res.rows.length; i++) {
                    bad_arr.push(res.rows[i]['badip']);
                }


            })
            .catch(err => {
                console.log(err);
            });
    }
}

checkBadIP();


function checkThreeLastPosts() {
    const pg = require('pg');

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

    const config = {
        host: 'ec2-44-195-169-163.compute-1.amazonaws.com',
        // Do not hard code your username and password.
        // Consider using Node environment variables.
        user: 'dovpfdvtqiqpig',
        password: '29582c9e51b7a58a215fecb40aa88311170b4e49bc3953347f3d433704d36b9a',
        database: 'd30845016oob61',
        port: 5432,
        ssl: true
    };

    const client = new pg.Client(config);

    client.connect(err => {
        if (err) throw err;
        else {
            queryDatabase();
        }
    });


    function queryDatabase() {

        console.log(`Running query to PostgreSQL server: ${config.host}`);

        const query = "select * from users ORDER BY ID DESC LIMIT 3;";

        client.query(query)
            .then(res => {
                const rows = res.rows;

                rows.map(row => {
                    console.log(`Read: ${JSON.stringify(row)}`);
                });

                for (let i = 0; i < res.rows.length; i++) {
                    threeLastPosts.push(res.rows[i]['ip']);
                }


            })
            .catch(err => {
                console.log(err);
            });
    }
}

checkThreeLastPosts();

function checkSpamerAgain(){
    if(bad_arr.length!==0){
        for (let i = 0; i<bad_arr.length; i++){
            if(ip.address()!==bad_arr[i]){
                app.post("/", urlencodedParser, function (request, response) {
                    if (!request.body) return response.sendStatus(400);
                    console.log(request.body);
                    response.send(
                        `${request.body.userName} - ${request.body.userAge}`,
                    );

                    var str = /\(/
                    let findStr;
                    for (let i = 0; i < request.rawHeaders.length; i++) {
                        if (request.rawHeaders[i].match(str)) {
                            findStr = request.rawHeaders[i];
                        }
                    }
                    sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
                    console.log(findStr);
                    console.log(request.headers['x-forwarded-for'])
                    console.log(request.connection.remoteAddress);
                    console.log(ip.address());
                    console.log("Bad_users:", bad_arr);
                    console.log("ЛАСТ ЗАПИСИ:", threeLastPosts);

                    checkThreeLastPosts();
                    for(let i = 0; i<threeLastPosts.length; i++){ // цикл перебора 3-х последних записей
                        if(threeLastPosts[i]===ip.address()){ // нахождение сходства ip компьютера пользователя и ip в базе
                            sendBadDB(ip.address())
                        }
                    }
                    threeLastPosts = [];
                    checkBadIP()
                });
            } else {
                console.log("Плохой IP!!!");
                app.post("/", urlencodedParser, function (request, response) {
                    response.end();
                });
            }
        }
    }
}



app.get("/", function (request, response) {
    response.sendFile(__dirname + "/index.html");
});

check();

for (let i = 0; i<threeLastPosts.length; i++){
    if(threeLastPosts[i] === null || threeLastPosts[i] === 'null'){
        threeLastPosts = [];
    }
}

async function check(){
    if (bad_arr.length !== 0) { // проверка на плохие ip адреса
        console.log("BADIP:", bad_arr);
        for (let i = 0; i < bad_arr.length; i++) {
            if (ip.address()!==bad_arr[i]) {
                app.post("/", urlencodedParser, function (request, response) {
                    if (!request.body) return response.sendStatus(400);
                    console.log(request.body);
                    response.send(
                        `${request.body.userName} - ${request.body.userAge}`,
                    );
                    checkSpamerAgain();
                    var str = /\(/
                    let findStr;
                    for (let i = 0; i < request.rawHeaders.length; i++) {
                        if (request.rawHeaders[i].match(str)) {
                            findStr = request.rawHeaders[i];
                        }
                    }
                    if(bad_arr.length !==0){
                        for(let i = 0; i<bad_arr.length; i++){
                            if (ip.address() !== bad_arr[i]){
                                sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
                            } else{
                                app.post("/", urlencodedParser, function (request, response) {
                                    response.end();
                                });
                            }
                        }
                    } else{
                        sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
                    }
                    console.log(findStr);
                    console.log(request.headers['x-forwarded-for'])
                    console.log(request.connection.remoteAddress);
                    console.log(ip.address());
                    console.log("Bad_users:", bad_arr);
                    console.log("ЛАСТ ЗАПИСИ:", threeLastPosts);

                    checkThreeLastPosts();
                    for(let i = 0; i<threeLastPosts.length; i++){ // цикл перебора 3-х последних записей
                        if(threeLastPosts[i]===ip.address() && (threeLastPosts[i]!==null || threeLastPosts[i]!=='null')){ // нахождение сходства ip компьютера пользователя и ip в базе
                            sendBadDB(ip.address())
                        }
                    }
                    threeLastPosts = [];
                    checkBadIP();




                });
            } else {
                console.log("ПЛОХОЙ IP!!!!!!!!!!!!!!!!!!");
                app.post("/", urlencodedParser, function (request, response) {
                    response.end();
                });
            }
        }
    } else{ // если нет плохих ip адресов
        app.post("/", urlencodedParser, function (request, response) {
            if (!request.body) return response.sendStatus(400);
            console.log(request.body);
            response.send(
                `${request.body.userName} - ${request.body.userAge}`,
            );


            var str = /\(/
            let findStr;
            for (let i = 0; i < request.rawHeaders.length; i++) {
                if (request.rawHeaders[i].match(str)) {
                    findStr = request.rawHeaders[i];
                }
            }

            if(bad_arr.length !==0){
                for(let i = 0; i<bad_arr.length; i++){
                    if (ip.address() !== bad_arr[i]){
                        sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
                    } else{
                        app.post("/", urlencodedParser, function (request, response) {
                            response.end();
                        });
                    }
                }
            } else{
                sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
            }



            console.log(findStr);
            console.log(request.headers['x-forwarded-for'])
            console.log(request.connection.remoteAddress);
            console.log(ip.address());
            console.log("Bad_users:", bad_arr);
            console.log("ЛАСТ ЗАПИСИ:", threeLastPosts);

            checkThreeLastPosts();
            for(let i = 0; i<threeLastPosts.length; i++){ // цикл перебора 3-х последних записей
                if(threeLastPosts[i]===ip.address() && (threeLastPosts[i]!==null || threeLastPosts[i]!=='null')){ // нахождение сходства ip компьютера пользователя и ip в базе
                    sendBadDB(ip.address())
                } else{
                    app.post("/", urlencodedParser, function (request, response) {
                        response.end();
                    });
                }
            }
            threeLastPosts = [];
            checkBadIP()
            checkSpamerAgain();

        });
    }
}











// for(let i = 0; i<bad_arr.length; i++){
//     if(ip.address() === bad_arr[i]){
//         app.post("/", urlencodedParser, function (request, response) {
//             response.end();
//             // request.end();
//         });
//     }
// }



// setTimeout(()=>{
//     console.log("BadIP:", bad_arr);
//
//     if(bad_arr.length!==0){
//         for (let i = 0; i<bad_arr.length; i++){
//             if (ip.address()!==bad_arr[i]){
//                 app.post("/", urlencodedParser, function (request, response) {
//                     if(!request.body) return response.sendStatus(400);
//                     console.log(request.body);
//                     response.send(
//                         `${request.body.userName} - ${request.body.userAge}`,
//                     );
//
//
//
//
//                     // const fs = require('fs');
//                     //
//                     // fs.readFile('id.json', 'utf8', (err, data) => {
//                     //
//                     //     if (err) {
//                     //         console.log(`Error reading file from disk: ${err}`);
//                     //     } else {
//                     //
//                     //         // parse JSON string to JSON object
//                     //         const databases = JSON.parse(data);
//                     //
//                     //         // print all databases
//                     //         databases.forEach(db => {
//                     //             console.log(`${db.id}`);
//                     //             db.id++;
//                     //             idCount=db.id;
//                     //             console.log(idCount);
//                     //
//                     //
//                     //         });
//                     //
//                     //     }
//                     //
//                     // });
//                     var str = /\(/
//                     let findStr;
//
//                     for(let i = 0; i<request.rawHeaders.length; i++){
//                         if (request.rawHeaders[i].match(str)){
//                             findStr = request.rawHeaders[i];
//                         }
//                     }
//                     sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
//
//                     // setTimeout(()=>{sendEmail(request.body.userName, request.body.userAge);}, 3000)
//
//                     // console.log(request.headers);
//                     // let key1 = Object.keys(request.headers)(8);
//                     // let value = request.headers[key1];
//                     // console.log(value);
//
//
//
//
//
//                     // console.log(request.rawHeaders[17]);
//                     console.log(findStr);
//
//
//                     console.log(request.headers['x-forwarded-for'])
//                     console.log(request.connection.remoteAddress);
//                     console.log(ip.address());
//
//                     let spammersExist;
//                     for (let i = 0; i<threeLastPosts.length; i++){
//                         let first = threeLastPosts[0];
//                         if(threeLastPosts[i] === first && threeLastPosts[i] === ip.address()){
//                             spammersExist = true;
//                         }
//                     }
//                     if(spammersExist === true){
//                         sendBadDB();
//                     }
//
//                     console.log("ЛАСТ ЗАПИСИ:",threeLastPosts);
//
//
//
//                 });
//             } else{
//                 console.log("BADIP!!!!!!!!!!!!!!!!!");
//             }
//         }
//     } else {
//         app.post("/", urlencodedParser, function (request, response) {
//             if(!request.body) return response.sendStatus(400);
//             console.log(request.body);
//             response.send(
//                 `${request.body.userName} - ${request.body.userAge}`,
//             );
//
//
//             // const fs = require('fs');
//             //
//             // fs.readFile('id.json', 'utf8', (err, data) => {
//             //
//             //     if (err) {
//             //         console.log(`Error reading file from disk: ${err}`);
//             //     } else {
//             //
//             //         // parse JSON string to JSON object
//             //         const databases = JSON.parse(data);
//             //
//             //         // print all databases
//             //         databases.forEach(db => {
//             //             console.log(`${db.id}`);
//             //             db.id++;
//             //             idCount=db.id;
//             //             console.log(idCount);
//             //
//             //
//             //         });
//             //
//             //     }
//             //
//             // });
//             var str = /\(/
//             let findStr;
//
//             for(let i = 0; i<request.rawHeaders.length; i++){
//                 if (request.rawHeaders[i].match(str)){
//                     findStr = request.rawHeaders[i];
//                 }
//             }
//             sendDB(request.body.userName, request.body.userAge, findStr, ip.address());
//
//             // setTimeout(()=>{sendEmail(request.body.userName, request.body.userAge);}, 3000)
//
//             // console.log(request.headers);
//             // let key1 = Object.keys(request.headers)(8);
//             // let value = request.headers[key1];
//             // console.log(value);
//
//
//
//
//
//             // console.log(request.rawHeaders[17]);
//             console.log(findStr);
//
//
//             console.log(request.headers['x-forwarded-for'])
//             console.log(request.connection.remoteAddress);
//             console.log(ip.address());
//
//
//             let spammersExist;
//             for (let i = 0; i<threeLastPosts.length; i++){
//                 let first = threeLastPosts[0];
//                 if(threeLastPosts[i] === first && threeLastPosts[i] === ip.address()){
//                     spammersExist = true;
//                 }
//             }
//             if(spammersExist === true){
//                 sendBadDB(ip.);
//             }
//
//             console.log("ЛАСТ ЗАПИСИ:",threeLastPosts);
//
//         });
//     }
//
//
//
// }, 3000)


app.listen(PORT, () => console.log("Сервер запущен..."));