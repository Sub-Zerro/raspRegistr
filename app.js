const express = require("express");

const app = express();
const ip = require('ip');

let idCount = 0;
const PORT = process.env.PORT || 3000;



function sendDB(userName, userEmail, phoneinfo, ip){
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

    `, (err, res)=>{
        console.log(err, res);
        pool.end();
    })
}

function sendEmail(nameOfUser, emailOfUser){
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

    smtpTransport.sendMail(mail, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        smtpTransport.close();
    });


}

// создаем парсер для данных application/x-www-form-urlencoded
const urlencodedParser = express.urlencoded({extended: false});

app.get("/", function (request, response) {
    response.sendFile(__dirname + "/index.html");

});
app.post("/", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    console.log(request.body);
    response.send(
        `${request.body.userName} - ${request.body.userAge}`,
    );


    // const fs = require('fs');
    //
    // fs.readFile('id.json', 'utf8', (err, data) => {
    //
    //     if (err) {
    //         console.log(`Error reading file from disk: ${err}`);
    //     } else {
    //
    //         // parse JSON string to JSON object
    //         const databases = JSON.parse(data);
    //
    //         // print all databases
    //         databases.forEach(db => {
    //             console.log(`${db.id}`);
    //             db.id++;
    //             idCount=db.id;
    //             console.log(idCount);
    //
    //
    //         });
    //
    //     }
    //
    // });
    var str = /\(/
    let findStr;

        for(let i = 0; i<request.rawHeaders.length; i++){
            if (request.rawHeaders[i].match(str)){
                findStr = request.rawHeaders[i];
            }
        }
    sendDB(request.body.userName, request.body.userAge, findStr, ip.address());

    setTimeout(()=>{sendEmail(request.body.userName, request.body.userAge);}, 3000)

    // console.log(request.headers);
    // let key1 = Object.keys(request.headers)(8);
    // let value = request.headers[key1];
    // console.log(value);





    // console.log(request.rawHeaders[17]);
    console.log(findStr);


    console.log(request.headers['x-forwarded-for'])
    console.log(request.connection.remoteAddress);
    console.log(ip.address());



});



app.listen(PORT, ()=>console.log("Сервер запущен..."));