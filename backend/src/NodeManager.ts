export enum NodeState {
    Unknown,
    Clear,
    Detection
}
export interface NodeData {
    state: NodeState,
    latitude: number,
    longitude: number
}
export default class NodeManager {
    // List of recently pushed endpoint data
    #nodes: Map<number, NodeData>

    constructor() {

    }

    setState(id: number, state: NodeState) {
        const nodeData = this.#nodes.get(id)
        nodeData.state = state
        this.#nodes.set(id, nodeData)
    }

    getNode(id: number) {
        return this.#nodes.get(id)
    }

    getNodes(ids: string[]): NodeData[] {
        const nodes = []
        for(const id of ids) {
            const node = this.#nodes.get(Number(id))
            if(!node) throw new Error("node not found: " + id)
            nodes.push(node)
        }
        return nodes
    }

    getNodesAll() {
        return { ... this.#nodes }
    }
}