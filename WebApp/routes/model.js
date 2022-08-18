"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * GET users listing.
 */
const express = require("express");
const Modeller_1 = require("../views/Modeller");
var bodyParser = require('body-parser');
const FS = require('fs');
const __1 = require("../");
const config = require('../configuration.js').configuration;
const bpmnServer = new __1.BPMNServer(config);
const definitions = bpmnServer.definitions;
const router = express.Router();
const awaitHandlerFactory = (middleware) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield middleware(req, res, next);
        }
        catch (err) {
            next(err);
        }
    });
};
router.get('/new', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.render('models/add');
})));
router.post('/new', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let processName = request.body.processName;
    response.redirect('/model/add/' + processName);
})));
router.get('/add/:process', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let processName = request.params.process;
    console.log('adding ' + processName);
    let view = new Modeller_1.Modeller();
    view.displayNew(processName, request, response);
})));
router.get('/export', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.params);
    let procs = yield bpmnServer.definitions.getList();
    response.render('models/export', { procs });
})));
router.get('/download/:file', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.params.file);
    const filePath = config.definitionsPath + request.params.file;
    console.log('filePath:' + filePath);
    response.download(filePath); // Set disposition and send it.
})));
router.get('/import', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.params);
    response.render('models/import');
})));
var fsx = require('fs-extra'); //File System - for file manipulation
router.post('/import', awaitHandlerFactory((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fileUploaded, file, filename) {
        console.log("Uploading: " + filename);
        console.log(fileUploaded);
        //Path where image will be uploaded
        const filepath = __dirname + '/../tmp/' + filename;
        fstream = fsx.createWriteStream(filepath);
        file.pipe(fstream);
        fstream.on('close', function () {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Upload Finished of " + filename);
                const name = filename;
                const source = fsx.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });
                yield definitions.save(name, source, null);
                res.redirect('/');
            });
        });
        fstream.on('error', function (err) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('error' + err);
            });
        });
    });
})));
router.get('/delete/:process', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.params);
    response.render('models/delete', { processName: request.params.process });
})));
router.post('/delete', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.body);
    let process = request.body.processName;
    yield definitions.deleteModel(process);
    console.log('deleting ' + process);
    response.redirect('/');
})));
router.post('/rename', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(request.body);
    let process = request.body.processName;
    let newName = request.body.newName;
    yield definitions.renameModel(process, newName);
    console.log('renamed ' + process + " to " + newName);
    response.redirect('/');
})));
router.get('/rename/:process', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    response.render('models/rename', { processName: request.params.process });
})));
router.get('/edit/:process', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let output = [];
    console.log('model.ts/:process ');
    const config = require('../configuration.js').configuration;
    let xml, base_url, title, processName;
    processName = request.params.process;
    xml = yield definitions.getSource(processName);
    title = processName;
    let view = new Modeller_1.Modeller();
    view.display(processName, request, response);
})));
router.post('/add/:process?', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(" modeller add");
    let body = request.body;
    let name = body.processId;
    let bpmn = body.bpmn;
    let svg = body.svg;
    yield definitions.save(name, bpmn, svg);
    console.log(" save completed");
    //        console.log(request);
    response.status(200).send("");
})));
router.post('/edit/:process', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(" modeller posted");
    let body = request.body;
    let name = body.processId;
    let bpmn = body.bpmn;
    let svg = body.svg;
    let definitionsPath = bpmnServer.configuration.definitionsPath;
    let fullpath = definitionsPath + '/' + name + '.bpmn';
    fsx.writeFile(fullpath, bpmn, function (err) {
        if (err)
            throw err;
        console.log(`Saved bpmn to ${fullpath}`);
    });
    yield definitions.save(name, bpmn, svg);
    console.log(" save completed");
    //        console.log(request);
    response.status(200).send("");
})));
router.get('/getSvg/:process', awaitHandlerFactory((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    let processName = request.params.process;
    let fileName = __dirname + '/../processes/' + processName + '.svg';
    let svg = yield definitions.getSVG(processName);
    response.header("Content-Type", "image/svg+xml");
    response.send(svg);
})));
exports.default = router;
//# sourceMappingURL=model.js.map