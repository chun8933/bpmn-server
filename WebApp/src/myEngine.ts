import { DataStore, Engine, Execution, ExecutionContext } from "bpmn-server";

class MyEngine extends Engine{
    /**
     *	loads a definitions  and start execution
     *
     * @param name		name of the process to start
     * @param data		input data
     * @param startNodeId	in process has multiple start node; you need to specify which one
     */
     async start(name, data = {}, startNodeId = null, options = {}) {
            this.logger.log(`Action:engine.start ${name}!!!!!!!!!!!!`);
            const definitions = this.definitions;
            const source = await definitions.getSource(name);
            const executionContext = new ExecutionContext(this.server);
                
            // added for listener
            executionContext.listener.on("start", c => {
                
                let node = c.context.item.token.currentNode;
                console.log('!!start:' + node.id);
                if (!node.def.extensionElements) return;

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
                console.log('!!end'+ node.id);

                if (!node.def.extensionElements) return;

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





            const execution = new Execution(name, source, executionContext);
            executionContext.execution = execution;
            // new dataStore for every execution to be monitored 
            const newDataStore = new DataStore(executionContext.server);
            executionContext.server.dataStore = newDataStore;
            newDataStore.monitorExecution(execution);
            this.cache.add(executionContext);
            executionContext.worker = execution.execute(startNodeId, data, options);


            if (options['noWait'] == true) {
                return executionContext;
            }
            else {
                const waiter = await executionContext.worker;
                this.logger.log(`.engine.start ended for ${name}`);
                return executionContext;
            }
            execution.promises.push(execution.execute(startNodeId, data, options));
            await execution.execute(startNodeId, data, options);
            await executionContext.dataStore.save();
            this.logger.log(`.engine.start ended for ${name}`);
            return executionContext;
    }

}

export { MyEngine };