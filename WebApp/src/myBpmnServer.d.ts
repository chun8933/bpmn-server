/// <reference types="node" />
import { CacheManager, Cron, IBPMNServer, Logger } from "bpmn-server";
import { EventEmitter } from "events";
import { MyEngine } from "./myEngine";
declare class MyBpmnServer implements IBPMNServer {
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
    constructor(configuration: any, logger?: any, options?: {});
    static getVersion(): string;
}
export { MyBpmnServer };
