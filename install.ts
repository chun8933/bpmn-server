import { BPMNServer } from '.';

const fs = require('fs');
const cwd = process.cwd();

let configuration;
const configPath = cwd + '/configuration.js';

if (fs.existsSync(configPath)) {

    configuration= require(configPath).configuration;

    install();

}
else {
    console.log(`**Error** configuration.js file does not exist in this folder '${cwd}'**`)
    console.log("please run this script from the folder containing 'configuration.js'");
}

async function install() {

    console.log('Installing a new Database');

    console.log('current directory is ' + process.cwd());
    console.log('Installing a new Database based on configuration in current directory');
    console.log('current directory is ' + process.cwd());
    console.log(configuration);
    console.log(configuration.database);

    const server = new BPMNServer(configuration);

    const dataStore = server.dataStore;

    const modelsDataStore = server.definitions;

    await dataStore.install();

    await modelsDataStore.install();

    const sampleModelsJson = fs.readFileSync(__dirname+'/sampleModels.json',
            { encoding: 'utf8', flag: 'r' });

    const models = JSON.parse(sampleModelsJson);
    models.forEach(model => {
        model._id = undefined;
    });


    const res = await modelsDataStore.import(models);
    console.log(res);
    console.log('---done.');

}


