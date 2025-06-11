'use client'

import { useState, useEffect } from 'react'
import { GitHubService } from '@/app/src/services/github'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface RepositorySelectorProps {
  username: string
  pat: string
  onSelect: (repo: string) => void
}

export function RepositorySelector({ username, pat, onSelect }: RepositorySelectorProps) {
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username || !pat) {
      setLoading(false)
      return
    }

    const github = new GitHubService(pat)
    github.getRepositories(username)
      .then(setRepos)
      .catch((error) => {
        console.error('Failed to fetch repositories:', error)
        setRepos([])
      })
      .finally(() => setLoading(false))
  }, [username, pat])

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (repos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No repositories found or unable to fetch repositories.
      </p>
    )
  }

  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select a repository" />
      </SelectTrigger>
      <SelectContent>
        {repos.map((repo) => (
          <SelectItem key={repo.id} value={repo.name}>
            {repo.name}
            {repo.private && <span className="text-muted-foreground ml-2">(private)</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}