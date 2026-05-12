"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProjectSummaryTabs({ projectStats }: { projectStats: any[] }) {
  if (!projectStats || projectStats.length === 0) return null;

  return (
    <Tabs defaultValue={projectStats[0]?.id} className="w-full flex flex-col gap-4">
      <div className="overflow-x-auto pb-2">
        <TabsList className="inline-flex h-auto w-auto min-w-full justify-start gap-2 bg-transparent p-0">
          {projectStats.map((project) => (
            <TabsTrigger
              key={project.id}
              value={project.id}
              className="rounded-lg border border-primary/20 bg-card/50 px-4 py-2 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_rgba(255,0,255,0.2)] hover:bg-primary/5 min-w-[120px]"
            >
              {project.name}
              <Badge variant="outline" className="ml-2 border-primary/30 text-[10px]">
                {project.totalTests}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {projectStats.map((project) => (
        <TabsContent key={project.id} value={project.id} className="mt-0 focus-visible:outline-none focus-visible:ring-0 w-full">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                {project.name} Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-primary/10 bg-background/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/10 hover:bg-transparent">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Module Name</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Total Categories</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Total Test Cases</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.modules.map((module: any) => (
                      <TableRow key={module.name} className="border-primary/5 hover:bg-primary/5">
                        <TableCell className="font-medium text-sm">{module.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            {module.categoryCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {module.testCount}
                        </TableCell>
                      </TableRow>
                    ))}
                    {project.modules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No test cases found in this project.
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
