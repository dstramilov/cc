"use client"

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { QuickActions } from "@/components/layout/quick-actions";
import { KPICard } from "@/components/dashboard/kpi-card";
import { HoursChart } from "@/components/dashboard/hours-chart";
import { BurnChart } from "@/components/dashboard/burn-chart";
import { ProjectTimeline } from "@/components/dashboard/project-timeline";
import { DollarSign, Clock, Activity, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Project, projectStorage } from "@/lib/project-storage";
import { customerStorage } from "@/lib/customer-storage";
import { timeLogStorage } from "@/lib/time-log-storage";
import { getOverallHealth } from "@/lib/project-health";
import { FilterBar } from "@/components/filter-bar";
import { useFilter } from "@/context/filter-context";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalHoursLogged, setTotalHoursLogged] = useState(0);
  const [timeLogsData, setTimeLogsData] = useState<any[]>([]);
  const { selectedCustomerId, selectedProjectIds } = useFilter();

  useEffect(() => {
    const loadData = async () => {
      const projectsData = await projectStorage.getProjects();
      const customersData = await customerStorage.getCustomers();
      const timeLogsData = await timeLogStorage.getTimeLogs();

      // Enrich projects with customer names
      const enrichedProjects = projectsData.map(p => {
        const customer = customersData.find(c => c.id === p.customerId);
        return { ...p, customerName: customer?.name || 'Unknown' };
      });

      setProjects(enrichedProjects);
      setTimeLogsData(timeLogsData);

      // Calculate total hours from approved time logs
      const approvedHours = timeLogsData
        .filter(log => log.status === 'approved')
        .reduce((sum, log) => sum + log.hours, 0);
      setTotalHoursLogged(approvedHours);
    };
    loadData();
  }, []);

  // Filter projects based on global filter
  const filteredProjects = projects.filter(p => {
    // 1. Filter by Customer
    if (selectedCustomerId && p.customerId !== selectedCustomerId) {
      return false;
    }
    // 2. Filter by Selected Projects (if any are selected)
    if (selectedProjectIds.length > 0 && !selectedProjectIds.includes(p.id)) {
      return false;
    }
    return true;
  });

  // Aggregate Data
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalHoursBudget = filteredProjects.reduce((sum, p) => sum + (p.hoursBudget || 0), 0);

  // Calculate actual hours used from time logs (filtered by selected projects)
  const filteredProjectIds = filteredProjects.map(p => p.id);
  const totalHoursUsed = Math.round(
    timeLogsData
      .filter(log => log.status === 'approved' && filteredProjectIds.includes(log.projectId))
      .reduce((sum, log) => sum + log.hours, 0)
  );

  const hoursRemaining = totalHoursBudget - totalHoursUsed;
  const percentHoursUsed = totalHoursBudget > 0 ? Math.round((totalHoursUsed / totalHoursBudget) * 100) : 0;

  // Calculate $ spent based on hours used (assuming $150/hour rate)
  const hourlyRate = 150;
  const dollarSpent = totalHoursUsed * hourlyRate;
  const dollarRemaining = totalBudget - dollarSpent;
  const percentBudgetUsed = totalBudget > 0 ? Math.round((dollarSpent / totalBudget) * 100) : 0;

  // Determine status
  const activeCount = filteredProjects.filter(p => p.status === 'active').length;
  const projectCount = filteredProjects.length;

  // Calculate overall project health
  const healthInfo = getOverallHealth(totalBudget, dollarSpent, totalHoursBudget, totalHoursUsed);

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <QuickActions
            onLogTime={() => window.location.href = '/time-logs'}
            onAddNote={() => window.location.href = '/meeting-notes'}
            onCreateProject={() => window.location.href = '/settings'}
            onUploadDocument={() => alert('Document upload coming soon!')}
          />
        </div>

        {/* Unified Filter Bar */}
        <FilterBar />

        {projectCount > 0 ? (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <KPICard
                title="Hours Budget"
                value={totalHoursBudget.toLocaleString()}
                icon={Clock}
                description={`${projectCount} Project${projectCount !== 1 ? 's' : ''}`}
              />
              <KPICard
                title="Hours Used"
                value={totalHoursUsed.toLocaleString()}
                icon={Clock}
                description={`${percentHoursUsed}% of hours budget`}
                trend={`${hoursRemaining.toLocaleString()} hours remaining`}
                trendUp={hoursRemaining > 0}
              />
              <KPICard
                title="$ Budget"
                value={`$${totalBudget.toLocaleString()}`}
                icon={DollarSign}
                description={`${percentBudgetUsed}% spent`}
              />
              <KPICard
                title="$ Spent"
                value={`$${dollarSpent.toLocaleString()}`}
                icon={Activity}
                description={`$${dollarRemaining.toLocaleString()} remaining`}
                trend={`At $${hourlyRate}/hour rate`}
                trendUp={dollarRemaining > 0}
              />
              <Card className="overflow-hidden" style={{ borderColor: healthInfo.color }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: healthInfo.bgColor }}
                      >
                        <AlertCircle className="h-5 w-5" style={{ color: healthInfo.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Project Health</p>
                        <h3
                          className="text-2xl font-bold mt-1"
                          style={{ color: healthInfo.color }}
                        >
                          {healthInfo.label}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activeCount}/{projectCount} Active
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <HoursChart />
              <BurnChart />
            </div>

            {/* Timeline */}
            <div className="grid gap-4 md:grid-cols-1">
              <ProjectTimeline />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">
                No projects found matching your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
