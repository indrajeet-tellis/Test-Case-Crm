"use client";

import * as React from "react";
import { ProjectHeader } from "@/components/project-header";
import { TestCasesTable } from "@/components/test-case-table";
import { getTestCases, getProjectConfigs } from "@/lib/actions";

export function DashboardView({
  initialProjects,
}: {
  initialProjects: any[];
}) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(
    initialProjects[0]?.id
  );
  const [testCases, setTestCases] = React.useState<any[]>([]);
  const [statusConfigs, setStatusConfigs] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      if (!selectedProjectId) return;
      setLoading(true);
      const [data, configs] = await Promise.all([
        getTestCases(selectedProjectId),
        getProjectConfigs(selectedProjectId)
      ]);
      setTestCases(data);
      setStatusConfigs(configs.statuses);
      setCategories(configs.categories);
      setLoading(false);
    }
    loadData();
  }, [selectedProjectId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ProjectHeader
        projects={initialProjects}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        categories={categories}
        statuses={statusConfigs}
      />
      
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 lg:px-6 lg:pb-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <TestCasesTable data={testCases} statusConfigs={statusConfigs} categories={categories} />
        )}
      </div>
    </div>
  );
}
