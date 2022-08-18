"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyBpmnServer = void 0;
const bpmn_server_1 = require("bpmn-server");
const events_1 = require("events");
const myEngine_1 = require("./myEngine");
const _version_ = "1.1.10";
class MyBpmnServer {
    /**
     * Server Constructor
     *
     * @param configuration	see
     * @param logger
     */
    constructor(configuration, logger = null, options = {}) {
        if (logger == null) {
            logger = new bpmn_server_1.Logger({});
        }
        this.listener = new events_1.EventEmitter();
        this.logger = logger;
        this.configuration = configuration;
        this.cron = new bpmn_server_1.Cron(this);
        this.cache = new bpmn_server_1.CacheManager(this);
        this.engine = new myEngine_1.MyEngine(this);
        this.dataStore = configuration.dataStore(this);
        this.definitions = configuration.definitions(this);
        this.appDelegate = configuration.appDelegate(this);
        console.log("bpmn-server version " + MyBpmnServer.getVersion());
        if (options['cron'] == false) {
            return;
        }
        this.cron.start();
    }
    static getVersion() {
        return _version_;
    }
}
exports.MyBpmnServer = MyBpmnServer;
//# sourceMappingURL=myBpmnServer.js.map