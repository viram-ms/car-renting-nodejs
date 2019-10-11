const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');

function DownloadPdf(data) {
    const compile = async function(templateName, data){
        const filepath = path.join(process.cwd(), './Download/templates', `${templateName}.hbs`);
        console.log(filepath);
        const html= await fs.readFile(filepath, 'utf-8');
        console.log(data);
        console.log(html);
        return hbs.compile(html)(data);
    };
    
    (async function(){
        console.log('dsfd');
        try{
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            const content = await compile('bill', data);
            var pdfPath = path.join('./Download/Invoices', `${data.user[0].Name}-${data.bill[0].BillId}.pdf`);

            await page.setContent(content);
            await page.emulateMedia('screen');
            await page.pdf({
                path: pdfPath,
                format: 'A4',
                printBackground: true
            });
            console.log('done');
            await browser.close();
            process.exit();
            return true;
        }
        catch(e){
            console.log('our error', e);
        }
    })();
}

// DownloadPdf();   

module.exports = {DownloadPdf}
