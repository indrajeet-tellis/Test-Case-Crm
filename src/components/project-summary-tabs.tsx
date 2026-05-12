"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectSummaryTabs({ projectStats }: { projectStats: any[] }) {
  if (!projectStats || projectStats.length === 0) return null;

  return (
    <Tabs defaultValue={projectStats[0]?.id} className="w-full space-y-6">
      <div className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start gap-2 bg-transparent p-0 flex-wrap">
          {projectStats.map((project) => (
            <TabsTrigger
              key={project.id}
              value={project.id}
              className="group relative min-w-[140px] rounded-xl border border-primary/10 bg-card/40 px-6 py-3 text-sm font-bold transition-all data-[state=active]:border-primary/50 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_rgba(255,0,255,0.15)] hover:bg-primary/10 hover:border-primary/30"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="truncate w-full text-left">{project.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-data-[state=active]:text-primary/70">
                  {project.totalTests} Tests
                </span>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all group-data-[state=active]:w-full" />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {projectStats.map((project) => (
        <TabsContent 
          key={project.id} 
          value={project.id} 
          className="mt-0 focus-visible:outline-none animate-in fade-in-50 duration-500"
        >
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card/60 to-card/30 backdrop-blur-2xl shadow-2xl">
            <CardHeader className="border-b border-primary/10 bg-primary/5 px-6 py-4">
              <CardTitle className="text-xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(255,0,255,0.5)]" />
                {project.name} Project Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-primary/10 hover:bg-transparent">
                      <TableHead className="h-12 px-6 text-xs font-black uppercase tracking-[0.2em] text-primary/70">Module</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-black uppercase tracking-[0.2em] text-primary/70 text-center">Categories</TableHead>
                      <TableHead className="h-12 px-6 text-xs font-black uppercase tracking-[0.2em] text-primary/70 text-right">Tests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.modules.map((module: any) => (
                      <TableRow key={module.name} className="group border-primary/5 hover:bg-primary/5 transition-colors">
                        <TableCell className="px-6 py-4 font-bold text-sm text-foreground/90 group-hover:text-primary transition-colors">
                          {module.name}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center min-w-[40px] rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 shadow-[0_0_10px_rgba(255,0,255,0.05)]">
                            {module.categoryCount}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <span className="font-mono text-sm font-bold text-primary/90 group-hover:text-primary transition-colors">
                            {module.testCount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {project.modules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground font-medium italic">
                          No module data found for this project.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
