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
exports.MyEngine = void 0;
const bpmn_server_1 = require("bpmn-server");
class MyEngine extends bpmn_server_1.Engine {
    /**
     *	loads a definitions  and start execution
     *
     * @param name		name of the process to start
     * @param data		input data
     * @param startNodeId	in process has multiple start node; you need to specify which one
     */
    start(name, data = {}, startNodeId = null, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log(`Action:engine.start ${name}!!!!!!!!!!!!`);
            const definitions = this.definitions;
            const source = yield definitions.getSource(name);
            const executionContext = new bpmn_server_1.ExecutionContext(this.server);
            // added for listener
            executionContext.listener.on("start", c => {
                let node = c.context.item.token.currentNode;
                console.log('!!start:' + node.id);
                if (!node.def.extensionElements)
                    return;
                let values = node.def.extensionElements.values;
                let executionListeners = values.filter(value => value.$type == 'camunda:executionListener');
                let executionListeners_start = executionListeners.filter(e => e.event == 'start');
                for (const listener of executionListeners_start) {
                    // console.log(listener.$children);
                    for (const child of listener.$children) {
                        var f = new Function(child.$body);
                        f();
                    }
                }
            });
            executionContext.listener.on("end", c => {
                let node = c.context.item.token.currentNode;
                console.log('!!end' + node.id);
                if (!node.def.extensionElements)
                    return;
                let values = node.def.extensionElements.values;
                let executionListeners = values.filter(value => value.$type == 'camunda:executionListener');
                let executionListeners_end = executionListeners.filter(e => e.event == 'end');
                for (const listener of executionListeners_end) {
                    for (const child of listener.$children) {
                        var f = new Function(child.$body);
                        f();
                    }
                }
                // c.context.execution.terminate();
            });
            const execution = new bpmn_server_1.Execution(name, source, executionContext);
            executionContext.execution = execution;
            // new dataStore for every execution to be monitored 
            const newDataStore = new bpmn_server_1.DataStore(executionContext.server);
            executionContext.server.dataStore = newDataStore;
            newDataStore.monitorExecution(execution);
            this.cache.add(executionContext);
            executionContext.worker = execution.execute(startNodeId, data, options);
            if (options['noWait'] == true) {
                return executionContext;
            }
            else {
                const waiter = yield executionContext.worker;
                this.logger.log(`.engine.start ended for ${name}`);
                return executionContext;
            }
            execution.promises.push(execution.execute(startNodeId, data, options));
            yield execution.execute(startNodeId, data, options);
            yield executionContext.dataStore.save();
            this.logger.log(`.engine.start ended for ${name}`);
            return executionContext;
        });
    }
}
exports.MyEngine = MyEngine;
//# sourceMappingURL=myEngine.js.map