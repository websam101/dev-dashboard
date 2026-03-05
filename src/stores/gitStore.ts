import { defineStore } from 'pinia'
import { IndexedDbAdapter } from '../services/db/adapter/IndexedDbAdapter'
import type { GitRepo } from '../services/db/adapter/IndexedDbAdapter'

export const useGitStore = defineStore('git', {
  state: () => ({
    repos: [] as GitRepo[],
    db: new IndexedDbAdapter()
  }),
  actions: {
    async loadRepos() {
      this.repos = await this.db.getGitRepos()
    },
    async addRepo(repo: GitRepo) {
      await this.db.addGitRepo(repo)
      this.repos = await this.db.getGitRepos()
    },
    async updateRepo(repo: GitRepo) {
      await this.db.updateGitRepo(repo)
      this.repos = await this.db.getGitRepos()
    },
    async deleteRepo(url: string) {
      await this.db.deleteGitRepo(url)
      this.repos = await this.db.getGitRepos()
    },
    checkGitStatus(_path: string): { branch: string; status: 'clean' | 'dirty' | 'ahead' | 'behind' } {
      return { branch: 'main', status: 'clean' }
    },
    cloneRepo(_url: string, _dest: string): void {
      // Implementation: git clone
    },
    pullRepo(_path: string): void {
      // Implementation: git pull
    },
    pushRepo(_path: string): void {
      // Implementation: git push
    }
  }
})
