"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  VisibilityState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, History, Plus, SlidersHorizontal } from "lucide-react";
import { addComment, updateTestCaseStatus } from "@/lib/actions";
import { toast } from "sonner";

interface TestCase {
  id: string;
  user: { name: string | null; email: string };
  category: { name: string };
  testCaseId: string;
  module: string | null;
  action: string;
  conditions: string;
  steps: string;
  expectedOutput: string;
  actualOutput: string | null;
  status: string;
  comments: any[];
}

const COLUMN_SIZING_KEY = "crm-column-sizing";

function loadColumnSizing(): ColumnSizingState {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(COLUMN_SIZING_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveColumnSizing(sizing: ColumnSizingState) {
  try {
    localStorage.setItem(COLUMN_SIZING_KEY, JSON.stringify(sizing));
  } catch {
    // ignore storage errors
  }
}

function CommentDialog({
  testCase,
  onCommentAdded,
}: {
  testCase: TestCase;
  onCommentAdded: (testCaseId: string, comment: any) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <div className="flex justify-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 shrink-0">
            <MessageSquare className="size-4" />
            {testCase.comments.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {testCase.comments.length}
              </span>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="border-primary/20 bg-card/90 backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <History className="size-5" />
              Comment History
            </DialogTitle>
            <DialogDescription className="sr-only">
              View and add comments for this test case.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 max-h-[300px] space-y-4 overflow-y-auto pr-2">
            {testCase.comments.map((c: any) => (
              <div key={c.id} className="rounded-lg border border-primary/10 bg-background/50 p-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-bold text-primary">{c.user?.name ?? "You"}</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm">{c.content}</p>
              </div>
            ))}
            {testCase.comments.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">No comments yet</p>
            )}
          </div>
          <div className="mt-4 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[80px] border-primary/20 bg-background/50"
            />
            <Button
              disabled={isSubmitting || !commentText.trim()}
              onClick={async () => {
                if (!commentText.trim()) return;
                const text = commentText;
                setIsSubmitting(true);
                try {
                  const optimisticComment = {
                    id: `temp-${Date.now()}`,
                    content: text,
                    createdAt: new Date().toISOString(),
                    user: { name: "You" },
                  };
                  onCommentAdded(testCase.id, optimisticComment);
                  setCommentText("");
                  setOpen(false);
                  toast.success("Comment added");
                  await addComment(testCase.id, text);
                } catch {
                  toast.error("Failed to add comment");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="w-full"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TestCasesTable({
  data,
  statusConfigs,
  categories,
  projectId,
}: {
  data: TestCase[];
  statusConfigs: any[];
  categories?: any[];
  projectId: string;
}) {
  const [tableData, setTableData] = React.useState<TestCase[]>(data);

  React.useEffect(() => {
    setTableData(data);
  }, [data]);

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>(loadColumnSizing);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    saveColumnSizing(columnSizing);
  }, [columnSizing]);

  const handleStatusChange = React.useCallback((testCaseId: string, newStatus: string) => {
    setTableData((prev) =>
      prev.map((tc) => (tc.id === testCaseId ? { ...tc, status: newStatus } : tc))
    );
    updateTestCaseStatus(testCaseId, newStatus);
    toast.success("Status updated");
  }, []);

  const handleCommentAdded = React.useCallback((testCaseId: string, comment: any) => {
    setTableData((prev) =>
      prev.map((tc) =>
        tc.id === testCaseId
          ? { ...tc, comments: [...tc.comments, comment] }
          : tc
      )
    );
  }, []);

  const columns: ColumnDef<TestCase>[] = React.useMemo(
    () => [
      {
        id: "numbering",
        header: "#",
        size: 50,
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return <span>{pageIndex * pageSize + row.index + 1}</span>;
        },
      },
      {
        accessorKey: "user",
        header: "User",
        size: 120,
        cell: ({ row }) => <span className="font-medium">{row.original.user.name || row.original.user.email}</span>
      },
      {
        accessorKey: "module",
        header: "Module",
        size: 120,
        cell: ({ row }) => row.original.module ?? "—",
      },
      {
        id: "category",
        accessorFn: (row) => row.category?.name,
        header: "Category",
        size: 120,
      },
      {
        accessorKey: "testCaseId",
        header: "ID",
        size: 90,
      },
      {
        accessorKey: "action",
        header: "Action",
        size: 200,
      },
      {
        accessorKey: "conditions",
        header: "Conditions",
        size: 180,
      },
      {
        accessorKey: "steps",
        header: "Steps/Description",
        size: 240,
      },
      {
        accessorKey: "expectedOutput",
        header: "Expected",
        size: 180,
      },
      {
        accessorKey: "actualOutput",
        header: "Actual",
        size: 150,
        cell: ({ row }) => row.original.actualOutput ?? "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        cell: ({ row }) => (
          <Select
            value={row.original.status}
            onValueChange={(val) => handleStatusChange(row.original.id, val)}
          >
            <SelectTrigger className="h-8 w-full border-primary/20 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusConfigs.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  <span className="capitalize">{s.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        id: "comments",
        header: "Latest Comment",
        size: 250,
        cell: ({ row }) => {
          const latestComment = row.original.comments[row.original.comments.length - 1];
          return (
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs text-muted-foreground flex-1 break-words">
                {latestComment ? latestComment.content : "No comments"}
              </span>
              <CommentDialog testCase={row.original} onCommentAdded={handleCommentAdded} />
            </div>
          );
        },
      },
    ],
    [statusConfigs, handleStatusChange, handleCommentAdded]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnVisibility,
      columnSizing,
      columnFilters,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onColumnFiltersChange: setColumnFilters,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const modules = React.useMemo(() => {
    const uniqueModules = new Set(data.map((tc) => tc.module).filter(Boolean));
    return Array.from(uniqueModules).sort() as string[];
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={(table.getColumn("module")?.getFilterValue() as string) ?? "all"}
            onValueChange={(val) => table.getColumn("module")?.setFilterValue(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[150px] border-primary/20 bg-card/50 text-xs h-8">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(table.getColumn("category")?.getFilterValue() as string) ?? "all"}
            onValueChange={(val) => table.getColumn("category")?.setFilterValue(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[150px] border-primary/20 bg-card/50 text-xs h-8">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(val) => table.getColumn("status")?.setFilterValue(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[150px] border-primary/20 bg-card/50 text-xs h-8">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statusConfigs?.map((s) => (
                <SelectItem key={s.id} value={s.name} className="capitalize">{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5">
              Columns <SlidersHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px] border-primary/20 bg-card/90 backdrop-blur-xl">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "testCaseId" ? "ID" : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-x-auto rounded-md border border-primary/20 bg-card/50">
        <Table className="w-full" style={{ tableLayout: "fixed", minWidth: table.getTotalSize() }}>
          <colgroup>
            {table.getHeaderGroups()[0]?.headers.map((header, index, arr) => (
              <col
                key={header.id}
                style={index === arr.length - 1 ? undefined : { width: header.getSize() }}
              />
            ))}
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-primary/20 hover:bg-primary/5">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-primary font-bold text-xs uppercase tracking-wider relative select-none group"
                  >
                    {header.isPlaceholder
                       ? null
                       : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none transition-colors group-hover:bg-primary/30 ${
                          header.column.getIsResizing() ? "bg-primary w-2" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-primary/10 hover:bg-primary/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-2.5 px-2 text-sm break-words"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tableData.length} test case{tableData.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-primary/20 hover:bg-primary/5"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-primary/20 hover:bg-primary/5"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
