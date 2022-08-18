import { Engine, ExecutionContext } from "bpmn-server";
declare class MyEngine extends Engine {
    /**
     *	loads a definitions  and start execution
     *
     * @param name		name of the process to start
     * @param data		input data
     * @param startNodeId	in process has multiple start node; you need to specify which one
     */
    start(name: any, data?: {}, startNodeId?: any, options?: {}): Promise<ExecutionContext>;
}
export { MyEngine };
