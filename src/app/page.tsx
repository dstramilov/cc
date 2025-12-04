"use client"

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { QuickActions } from "@/components/layout/quick-actions";
import { KPICard } from "@/components/dashboard/kpi-card";
import { HoursChart } from "@/components/dashboard/hours-chart";
import { BurnChart } from "@/components/dashboard/burn-chart";
import { ProjectTimeline } from "@/components/dashboard/project-timeline";
import { TodoWidget } from "@/components/dashboard/todo-widget";
import { DollarSign, Clock, Activity, AlertCircle, LayoutDashboard, PieChart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, projectStorage } from "@/lib/project-storage";
import { customerStorage, Customer } from "@/lib/customer-storage";
import { timeLogStorage } from "@/lib/time-log-storage";
import { getOverallHealth } from "@/lib/project-health";
import { FilterBar } from "@/components/filter-bar";
import { useFilter } from "@/context/filter-context";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalHoursLogged, setTotalHoursLogged] = useState(0);
  const [timeLogsData, setTimeLogsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCustomerId, selectedProjectIds } = useFilter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsData = await projectStorage.getProjects();
        const customersData = await customerStorage.getCustomers();
        const timeLogsData = await timeLogStorage.getTimeLogs();

        // Enrich projects with customer names
        const enrichedProjects = projectsData.map(p => {
          const customer = customersData.find(c => c.id === p.customerId);
          return { ...p, customerName: customer?.name || 'Unknown' };
        });

        setProjects(enrichedProjects);
        setCustomers(customersData);
        setTimeLogsData(timeLogsData);

        // Calculate total hours from approved time logs
        const approvedHours = timeLogsData
          .filter(log => log.status === 'approved')
          .reduce((sum, log) => sum + log.hours, 0);
        setTotalHoursLogged(approvedHours);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
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

        {loading || projectCount > 0 ? (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Total Projects"
                value={filteredProjects.length}
                icon={LayoutDashboard}
                description={`${filteredProjects.filter(p => p.status === 'active').length} active`}
                loading={loading}
              />
              <KPICard
                title="Total Budget (Hrs)"
                value={totalHoursBudget.toLocaleString()}
                icon={PieChart}
                description="Across all projects"
                loading={loading}
              />
              <Card className="glass-card border-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Used</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{totalHoursUsed.toLocaleString()}</div>
                      <div className="h-2 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${percentHoursUsed > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(percentHoursUsed, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {percentHoursUsed}% of budget
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
              <KPICard
                title="Active Customers"
                value={activeCount}
                icon={Users}
                description={`${customers.length} total customers`}
                loading={loading}
              />
            </div>



            {/* Charts & Widgets */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <HoursChart loading={loading} />
              </div>
              <div className="lg:col-span-1 space-y-4">
                <TodoWidget />
                <RecentActivity />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-4">
                <BurnChart loading={loading} />
              </div>
            </div>

            {/* Timeline */}
            <div className="grid gap-4 md:grid-cols-1">
              <ProjectTimeline loading={loading} />
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
