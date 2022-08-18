/*
 * GET users listing.
 */
import express = require('express');
import { Modeller } from '../views/Modeller';
var bodyParser = require('body-parser')

const FS = require('fs');

import { BPMNServer} from '../';
const config = require('../configuration.js').configuration;


const bpmnServer = new BPMNServer(config);

const definitions = bpmnServer.definitions;
const router = express.Router();


const awaitHandlerFactory = (middleware) => {
    return async (req, res, next) => {
        try {
            await middleware(req, res, next)
        } catch (err) {
            next(err)
        }
    }
}
    router.get('/new', awaitHandlerFactory(async (request, response) => {

        response.render('models/add');

    }));
    router.post('/new', awaitHandlerFactory(async (request, response) => {

        let processName = request.body.processName;

        response.redirect('/model/add/' + processName);
    }));
    router.get('/add/:process', awaitHandlerFactory(async (request, response) => {

        let processName = request.params.process;

        console.log('adding ' + processName);

        let view = new Modeller();

        view.displayNew(processName, request, response);

}));
    router.get('/export', awaitHandlerFactory(async (request, response) => {
        console.log(request.params);
        let procs = await bpmnServer.definitions.getList();
        response.render('models/export', { procs});

    }));
    router.get('/download/:file', awaitHandlerFactory(async (request, response) => {
        console.log(request.params.file);

        const filePath = config.definitionsPath+request.params.file;
        console.log('filePath:'+ filePath);

        response.download(filePath); // Set disposition and send it.

    }));

router.get('/import', awaitHandlerFactory(async (request, response) => {
    console.log(request.params);
    response.render('models/import');

}));

    var fsx = require('fs-extra');       //File System - for file manipulation

    router.post('/import', awaitHandlerFactory(async (req, res) => {

            var fstream;
            req.pipe(req.busboy);
            req.busboy.on('file', function (fileUploaded, file, filename) {
                console.log("Uploading: " + filename);
                console.log(fileUploaded);
                

                //Path where image will be uploaded
                const filepath = __dirname + '/../tmp/' + filename;
                
                fstream = fsx.createWriteStream(filepath);
                
                file.pipe(fstream);
                
                fstream.on('close',async function () {
                    console.log("Upload Finished of " + filename);
                    const name = filename;
                    const source= fsx.readFileSync(filepath ,
                        { encoding: 'utf8', flag: 'r' });
                    await definitions.save(name, source, null);

                    res.redirect('/');

                });
                fstream.on('error', async function (err) {
                    console.log('error' + err);
                    
                });
            });


}));


    router.get('/delete/:process', awaitHandlerFactory(async (request, response) => {
        console.log(request.params);
        response.render('models/delete', { processName: request.params.process });

    }));
    router.post('/delete', awaitHandlerFactory(async (request, response) => {

        console.log(request.body);
        let process = request.body.processName;
        await definitions.deleteModel(process);
        console.log('deleting ' + process);
        response.redirect('/');

    }));
    router.post('/rename', awaitHandlerFactory(async (request, response) => {

        console.log(request.body);
        let process= request.body.processName;
        let newName = request.body.newName;
        await definitions.renameModel(process,newName);
        console.log('renamed ' + process+" to "+newName);
        response.redirect('/');

    }));
    router.get('/rename/:process', awaitHandlerFactory(async (request, response) => {

        response.render('models/rename', { processName: request.params.process });

    }));
    router.get('/edit/:process', awaitHandlerFactory(async (request, response) => {
        let output = [];

        console.log('model.ts/:process ');
        const config = require('../configuration.js').configuration;
        let xml, base_url, title, processName;

        processName = request.params.process;
        xml = await definitions.getSource(processName);
        title = processName;

        let view = new Modeller();

        view.display(processName,request, response);

    }));
router.post('/add/:process?', awaitHandlerFactory(async (request, response) => {
    console.log(" modeller add");

    let body = request.body;

    let name = body.processId;
    let bpmn = body.bpmn;
    let svg = body.svg;

    await definitions.save(name, bpmn, svg);
    console.log(" save completed");

    //        console.log(request);
    response.status(200).send("");
}));


    router.post('/edit/:process', awaitHandlerFactory(async (request, response) => {
        console.log(" modeller posted");

        let body = request.body;

        let name = body.processId;
        let bpmn = body.bpmn;
        let svg = body.svg;

        let definitionsPath = bpmnServer.configuration.definitionsPath;
        let fullpath = definitionsPath + '/' + name + '.bpmn';

        fsx.writeFile(fullpath, bpmn, function (err) {
            if (err) throw err;
            console.log(`Saved bpmn to ${fullpath}`);
        });
        await definitions.save(name, bpmn, svg);
        console.log(" save completed");

//        console.log(request);
        response.status(200).send("");
    }));

    router.get('/getSvg/:process', awaitHandlerFactory(async (request, response) => {

        let processName = request.params.process;
        let fileName = __dirname + '/../processes/' + processName + '.svg';

        let svg = await definitions.getSVG(processName);

        response.header("Content-Type", "image/svg+xml");
        response.send(svg);

    }));




export default router;