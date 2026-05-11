"use client";
import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  PlusCircle, 
  MessageSquare, 
  RefreshCcw, 
  Database, 
  UserPlus, 
  UserMinus, 
  History,
  Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const actionIcons: Record<string, any> = {
  CREATED_TEST_CASE: PlusCircle,
  ADDED_COMMENT: MessageSquare,
  UPDATED_STATUS: RefreshCcw,
  IMPORTED_TESTS: Database,
  CREATED_PROJECT: PlusCircle,
  CREATED_USER: UserPlus,
  DELETED_USER: UserMinus,
};

const actionColors: Record<string, string> = {
  CREATED_TEST_CASE: "text-green-400",
  ADDED_COMMENT: "text-blue-400",
  UPDATED_STATUS: "text-yellow-400",
  IMPORTED_TESTS: "text-purple-400",
  CREATED_PROJECT: "text-green-500",
  CREATED_USER: "text-cyan-400",
  DELETED_USER: "text-red-400",
};

export function ActivityLogs({ initialLogs }: { initialLogs: any[] }) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredLogs = initialLogs.filter((log) =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search activities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-primary/20 bg-card/50"
        />
      </div>

      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No recent activities found.</p>
        ) : (
          filteredLogs.map((log) => {
            const Icon = actionIcons[log.action] || History;
            const colorClass = actionColors[log.action] || "text-primary";

            return (
              <div 
                key={log.id} 
                className="group relative flex gap-x-4 rounded-xl border border-primary/10 bg-card/30 p-4 transition-all hover:border-primary/30 hover:bg-card/50"
              >
                <div className="relative flex h-10 w-10 flex-none items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-primary/10 blur-sm group-hover:bg-primary/20 transition-colors`} />
                  <Icon className={`relative size-5 ${colorClass}`} />
                </div>
                
                <div className="flex-auto">
                  <div className="flex items-center justify-between gap-x-4">
                    <p className="text-sm font-semibold leading-6 text-foreground">
                      {log.user?.name || log.user?.email}
                    </p>
                    <time dateTime={log.createdAt} className="flex-none text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {log.description}
                  </p>
                  {log.project && (
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-primary/30 bg-primary/5 text-primary">
                        {log.project.name}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
