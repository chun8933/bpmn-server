import { CacheManager, Cron, IBPMNServer, Logger } from "bpmn-server";
import { EventEmitter } from "events";
import { MyEngine } from "./myEngine";

const _version_ = "1.1.10";

class MyBpmnServer implements IBPMNServer{
	listener: EventEmitter;
	logger: Logger;
	configuration: any;
	cron: Cron;
	cache: CacheManager;
	engine: MyEngine;
	dataStore: any;
	definitions: any;
	appDelegate: any;
    /**
     * Server Constructor
     *
     * @param configuration	see
     * @param logger
     */
	 constructor(configuration, logger = null, options = {}) {
        if (logger == null) {
            logger = new Logger({});
        }
        this.listener = new EventEmitter();
        this.logger = logger;
        this.configuration = configuration;
        this.cron = new Cron(this);
        this.cache = new CacheManager(this);
        this.engine = new MyEngine(this);
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

export { MyBpmnServer };