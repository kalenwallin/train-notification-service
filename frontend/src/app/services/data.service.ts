import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Node {
  id: number;
  title: string;
  blocked: boolean;
  created_at: Date;
}

interface APINode {
  title: string,
  state: NodeState,
  created_at: number
}
export enum NodeState {
  Unknown,
  Clear,
  Detection
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public nodes: Node[] = []

  constructor(private http: HttpClient) { }

  public async fetchNodes(): Promise<void> {
    const response = await firstValueFrom(this.http.get<{ nodes: Record<number, APINode> }>('http://localhost:8081/api/nodes'))

    if (response) {
      const nodes: Node[] = []
      for(const [id, node] of Object.entries(response.nodes)) {
        nodes.push({
          id: Number(id),
          created_at: new Date(node.created_at),
          blocked: node.state === NodeState.Detection,
          title: node.title
        })
      }
      this.nodes = nodes
    }
  }

  public getNodes(): Node[] {
    return this.nodes;
  }

  public getNodeById(id: number): Node|undefined {
    return this.nodes.find(node => node.id === id);
  }

  public isFavoriteNode(id: number): boolean {
    const favoriteNodes: number[] = JSON.parse(localStorage.getItem('favoriteNodes') || '[]');

    if (favoriteNodes.find((favorite: number) => favorite === id)) {
      return true;
    } else {
      return false;
    }
  }

  public toggleFavoriteNode(id: number): void {
    const favoriteNodes: number[] = JSON.parse(localStorage.getItem('favoriteNodes') || '[]');

    if (favoriteNodes.find((favorite: number) => favorite === id)) {

      // need to remove it
      favoriteNodes.splice(favoriteNodes.findIndex((favorite: number) => favorite === id), 1);

      localStorage.setItem('favoriteNodes', JSON.stringify(favoriteNodes));
    } else {
      // need to add it
      favoriteNodes.push(id);

      localStorage.setItem('favoriteNodes', JSON.stringify(favoriteNodes));
    }
  }

  public startPolling() {
    setInterval(() => this.pollService(), 5000);
  }

  private async pollService() {
    console.log('About to poll the service');
    const favoriteNodes: number[] = JSON.parse(localStorage.getItem('favoriteNodes') || '[]');

    favoriteNodes.forEach(async (nodeId: number) => {
      const response = await firstValueFrom(this.http.get<any>(`http://JACKSONS_SERVER/api/${nodeId}`)); // TODO need to type this once we know the shape

      if (response) {
        const nodeIndex = this.nodes.findIndex((node: Node) => node.id === response.id)

        const nodeCache = this.nodes;
        nodeCache.splice(nodeIndex, 1, response);

        this.nodes = [ ...nodeCache ];
      }
    });

  }
}
