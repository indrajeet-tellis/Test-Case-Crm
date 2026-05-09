"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, Trash2Icon, UserIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/actions"

export function UserManager() {
  const [users, setUsers] = React.useState<any[]>([])
  const [newUser, setNewUser] = React.useState({ name: "", email: "", password: "", role: "USER" })
  const [editingUser, setEditingUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  const loadUsers = React.useCallback(async () => {
    setLoading(true)
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill all fields")
      return
    }
    try {
      await createUser(newUser)
      setNewUser({ name: "", email: "", password: "", role: "USER" })
      loadUsers()
      toast.success("User created")
    } catch (e) {
      toast.error("Failed to create user")
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser.name || !editingUser.email) return
    try {
      await updateUser(editingUser.id, editingUser)
      setEditingUser(null)
      loadUsers()
      toast.success("User updated")
    } catch (e) {
      toast.error("Failed to update user")
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await deleteUser(id)
      loadUsers()
      toast.success("User deleted")
    } catch (e) {
      toast.error("Failed to delete user")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {editingUser ? "Edit User" : "Add New User"}
          </CardTitle>
          <CardDescription>
            {editingUser ? "Update existing user details." : "Create a new user account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="grid gap-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input 
                id="user-name" 
                placeholder="John Doe" 
                value={editingUser ? editingUser.name : newUser.name}
                onChange={(e) => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input 
                id="user-email" 
                type="email" 
                placeholder="john@example.com" 
                value={editingUser ? editingUser.email : newUser.email}
                onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            {!editingUser && (
              <div className="grid gap-2">
                <Label htmlFor="user-password">Password</Label>
                <Input 
                  id="user-password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="user-role">Role</Label>
              <Select 
                value={editingUser ? editingUser.role : newUser.role} 
                onValueChange={(v) => editingUser ? setEditingUser({...editingUser, role: v}) : setNewUser({ ...newUser, role: v })}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingUser && (
              <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
            )}
            <Button onClick={editingUser ? handleUpdateUser : handleCreateUser}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>Manage your team members and their roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingUser(user)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
