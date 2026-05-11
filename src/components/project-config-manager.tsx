"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
    try {
      const data = await getProjectConfigs(selectedProjectId)
      setConfigs({
        statuses: data?.statuses || [],
        categories: data?.categories || []
      })
    } catch (e) {
      console.error("Failed to load configs:", e)
      toast.error("Failed to load configuration")
    } finally {
      setLoading(false)
    }
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
      <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-primary tracking-wider uppercase text-sm font-black">Select Project</CardTitle>
          <CardDescription>Select a project to manage its status and categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[300px] border-primary/20 bg-card/30">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent className="bg-card/90 backdrop-blur-xl border-primary/20">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary tracking-wider uppercase text-sm font-black">
              <CheckCircle2Icon className="h-5 w-5" />
              Statuses
            </CardTitle>
            <CardDescription>Manage test case statuses for this project.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="status-name" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Status Name</Label>
                <Input 
                  id="status-name" 
                  placeholder="e.g. In Progress" 
                  value={newStatus.name}
                  onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                  className="border-primary/20 bg-card/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status-color" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Color</Label>
                <Input 
                  id="status-color" 
                  type="color" 
                  className="w-16 h-10 p-1 border-primary/20 bg-card/30"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                />
              </div>
              <Button size="icon" onClick={handleAddStatus} className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(171,0,255,0.4)]">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {configs.statuses.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-primary/10 bg-card/30 p-2 transition-all hover:border-primary/30">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: s.color || "#ccc", color: s.color || "#ccc" }} />
                    <span className="text-sm font-medium">{s.name}</span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-primary/20 bg-card/90 backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Status</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the status "{s.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-primary/20">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteStatus(s.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              {configs.statuses.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4 italic">No statuses defined.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary tracking-wider uppercase text-sm font-black">
              <TagIcon className="h-5 w-5" />
              Categories
            </CardTitle>
            <CardDescription>Manage test case categories for this project.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="category-name" className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Category Name</Label>
                <Input 
                  id="category-name" 
                  placeholder="e.g. UI/UX" 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border-primary/20 bg-card/30"
                />
              </div>
              <Button size="icon" onClick={handleAddCategory} className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(171,0,255,0.4)]">
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {configs.categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-primary/10 bg-card/30 p-2 transition-all hover:border-primary/30">
                  <span className="text-sm font-medium">{c.name}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-primary/20 bg-card/90 backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the category "{c.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-primary/20">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteCategory(c.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
              {configs.categories.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4 italic">No categories defined.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
