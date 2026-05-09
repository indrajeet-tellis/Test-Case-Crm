"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, Trash2Icon, CheckCircle2Icon, TagIcon } from "lucide-react"
import { toast } from "sonner"
import { addCategory, addStatus, deleteCategory, deleteStatus, getProjectConfigs } from "@/lib/actions"

export function ProjectConfigManager({ projects }: { projects: any[] }) {
  const [selectedProjectId, setSelectedProjectId] = React.useState(projects[0]?.id)
  const [configs, setConfigs] = React.useState<{ statuses: any[], categories: any[] }>({ statuses: [], categories: [] })
  const [newStatus, setNewStatus] = React.useState({ name: "", color: "#3b82f6" })
  const [newCategory, setNewCategory] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const loadConfigs = React.useCallback(async () => {
    if (!selectedProjectId) return
    setLoading(true)
    const data = await getProjectConfigs(selectedProjectId)
    setConfigs(data)
    setLoading(false)
  }, [selectedProjectId])

  React.useEffect(() => {
    loadConfigs()
  }, [loadConfigs])

  const handleAddStatus = async () => {
    if (!newStatus.name) return
    try {
      await addStatus(selectedProjectId, newStatus.name, newStatus.color)
      setNewStatus({ name: "", color: "#3b82f6" })
      loadConfigs()
      toast.success("Status added")
    } catch (e) {
      toast.error("Failed to add status")
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory) return
    try {
      await addCategory(selectedProjectId, newCategory)
      setNewCategory("")
      loadConfigs()
      toast.success("Category added")
    } catch (e) {
      toast.error("Failed to add category")
    }
  }

  const handleDeleteStatus = async (id: string) => {
    try {
      await deleteStatus(id)
      loadConfigs()
      toast.success("Status deleted")
    } catch (e) {
      toast.error("Failed to delete status")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      loadConfigs()
      toast.success("Category deleted")
    } catch (e) {
      toast.error("Failed to delete category")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
          <CardDescription>Select a project to manage its status and categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5" />
              Statuses
            </CardTitle>
            <CardDescription>Manage test case statuses for this project.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="status-name">Status Name</Label>
                <Input 
                  id="status-name" 
                  placeholder="e.g. In Progress" 
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status-color">Color</Label>
                <Input 
                  id="status-color" 
                  type="color" 
                  className="w-16 h-10 p-1"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                />
              </div>
              <Button size="icon" onClick={handleAddStatus}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {configs.statuses.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color || "#ccc" }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteStatus(s.id)}>
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {configs.statuses.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No statuses defined.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              Categories
            </CardTitle>
            <CardDescription>Manage test case categories for this project.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input 
                  id="category-name" 
                  placeholder="e.g. UI/UX" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <Button size="icon" onClick={handleAddCategory}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {configs.categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCategory(c.id)}>
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {configs.categories.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No categories defined.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
