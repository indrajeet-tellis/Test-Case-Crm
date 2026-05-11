"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProject } from "@/lib/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const router = useRouter()

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      const result = await createProject(name, description)
      
      if (result && 'error' in result) {
        toast.error(result.error)
        return
      }
      
      toast.success("Project created successfully")
      setIsOpen(false)
      setName("")
      setDescription("")
      router.push(`/dashboard?projectId=${(result as any).id}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to create project")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(171,0,255,0.4)]">
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="border-primary/20 bg-card/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              placeholder="e.g. Mobile App Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-primary/20 bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              placeholder="Brief description of the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-primary/20 bg-background/50"
            />
          </div>
          <Button onClick={handleCreate} className="w-full">
            Initialize Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
