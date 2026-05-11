"use client";

import * as React from "react";
import { Plus, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { createProject, importTestCases } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProjectHeader({
  projects,
  selectedProjectId,
  onProjectChange,
  categories,
  statuses,
}: {
  projects: any[];
  selectedProjectId?: string;
  onProjectChange: (id: string) => void;
  categories?: any[];
  statuses?: any[];
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();


  const handleDownloadSample = () => {
    const headers = [
      "Category",
      "Test Case Id",
      "Action",
      "Cases/Conditions",
      "Steps/Description",
      "Expected Output",
      "Actual Output",
      "Status",
    ];
    const sampleData = [
      {
        Category: "Login",
        "Test Case Id": "TC-001",
        Action: "Login with valid credentials",
        "Cases/Conditions": "Internet available",
        "Steps/Description": "1. Open app\n2. Enter email\n3. Click login",
        "Expected Output": "Dashboard should open",
        "Actual Output": "",
        Status: "Pending",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Test Cases");
    XLSX.writeFile(wb, "test_case_sample.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            await importTestCases(selectedProjectId, results.data);
            toast.success("Imported CSV successfully");
          },
        });
      } else {
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        await importTestCases(selectedProjectId, data);
        toast.success("Imported Excel successfully");
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const [isCreatingTestCase, setIsCreatingTestCase] = React.useState(false);
  const [newTestCase, setNewTestCase] = React.useState({
    category: "",
    testCaseId: "",
    action: "",
    conditions: "",
    steps: "",
    expectedOutput: "",
    status: "",
  });

  const handleCreateTestCase = async () => {
    if (!selectedProjectId) return;
    try {
      await importTestCases(selectedProjectId, [{
        Category: newTestCase.category,
        "Test Case Id": newTestCase.testCaseId,
        Action: newTestCase.action,
        "Cases/Conditions": newTestCase.conditions,
        "Steps/Description": newTestCase.steps,
        "Expected Output": newTestCase.expectedOutput,
        Status: newTestCase.status,
      }]);
      setNewTestCase({
        category: "",
        testCaseId: "",
        action: "",
        conditions: "",
        steps: "",
        expectedOutput: "",
        status: "",
      });
      setIsCreatingTestCase(false);
      toast.success("Test case created");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="w-full max-w-[300px]">
          <Label className="mb-1 block text-xs text-muted-foreground uppercase tracking-widest">
            Active Project
          </Label>
          <Select value={selectedProjectId} onValueChange={onProjectChange}>
            <SelectTrigger className="border-primary/20 bg-card/50">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
              {projects.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground">No projects found</div>
              )}
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="flex items-center gap-2 lg:mt-5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          className="hidden"
          accept=".csv,.xlsx,.xls"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadSample}
          className="border-primary/20 hover:bg-primary/10"
        >
          <Download className="mr-2 size-4" /> Sample
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={!selectedProjectId}
          className="border-primary/20 hover:bg-primary/10"
        >
          <Upload className="mr-2 size-4" /> Import
        </Button>

        <Dialog open={isCreatingTestCase} onOpenChange={setIsCreatingTestCase}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!selectedProjectId} className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(171,0,255,0.4)]">
              <Plus className="mr-2 size-4" /> New Test Case
            </Button>
          </DialogTrigger>
          <DialogContent className="border-primary/20 bg-card/90 backdrop-blur-xl sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Test Case</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newTestCase.category}
                  onValueChange={(val) => setNewTestCase({ ...newTestCase, category: val })}
                >
                  <SelectTrigger className="border-primary/20 bg-card/50">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                    {!categories?.length && (
                      <div className="p-2 text-sm text-muted-foreground">No categories</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Test Case ID</Label>
                <Input
                  placeholder="TC-001"
                  value={newTestCase.testCaseId}
                  onChange={(e) => setNewTestCase({ ...newTestCase, testCaseId: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Action</Label>
                <Input
                  value={newTestCase.action}
                  onChange={(e) => setNewTestCase({ ...newTestCase, action: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Steps</Label>
                <Textarea
                  value={newTestCase.steps}
                  onChange={(e) => setNewTestCase({ ...newTestCase, steps: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Output</Label>
                <Input
                  value={newTestCase.expectedOutput}
                  onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newTestCase.status}
                  onValueChange={(val) => setNewTestCase({ ...newTestCase, status: val })}
                >
                  <SelectTrigger className="border-primary/20 bg-card/50">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses?.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        <span className="capitalize">{s.name}</span>
                      </SelectItem>
                    ))}
                    {!statuses?.length && (
                      <div className="p-2 text-sm text-muted-foreground">No statuses</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreateTestCase} className="w-full">
              Deploy Test Case
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
