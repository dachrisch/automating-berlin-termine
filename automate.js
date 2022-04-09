const puppeteer = require('puppeteer');

let browser, selector, errorMessage;

require('es6-promise').polyfill();
require('isomorphic-fetch');


const website = process.argv[2] || "https://service.berlin.de/terminvereinbarung/termin/tag.php?termin=1&anliegen[]=121593&dienstleisterlist=122210,122217,122219,122227,122231,122238,122243,122252,122260,122262,122254,122271,122273,122277,122280,122282,122284,327539,122291,122285,122286,122296,150230,122301,122297,122294,122312,122314,122304,122311,122309,122281,122279,122276,122274,122267,122246,122251,122257,122208,122226&herkunft=http%3A%2F%2Fservice.berlin.de%2Fdienstleistung%2F121593%2F";

function start() {
    console.log('START');

    (async () => {

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(website);

        const check = async selector => {
            let element=await page.$(selector)
            if (element !== null) {
                return element
            } else {
                return false;
            }
        };

        const recursion = async function myself() {

            console.log(`trying to find appointment: ${page.url()}`);

            if (await check(".calendar-month-table .buchbar")) {

                console.log("!!!!!! found appointment !!!!!!");
                finished();

            } else if (await check(".controll .next a")) {
                let next_page = await check(".controll .next a")
                let next_page_jshandle=await next_page.getProperty("href")
                let next_page_uri=next_page_jshandle._remoteObject.value
                console.log(`no appointment found, checking next page`);
                await page.goto(next_page_uri)
                setTimeout(() => myself(), 0);

            } else {

                console.log("end of page, try again! :(");
                await page.goto(website);
                setTimeout(() => myself(), 15000);

            }

        };

        recursion();

        function finished() {
            browser.close();
            console.log("END");
        }

    })();

}

start();
