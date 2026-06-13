'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion';
import {
  Users,
  BookOpen,
  Users2,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@svu-community/ui/components/ui/card';
import { getStats, type DashboardStats } from '@/services/api';

type StatKey = 'totalUsers' | 'totalCourses' | 'activeStudyGroups' | 'newRegistrationsThisWeek';

interface StatConfig {
  key: StatKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  valueKey: keyof DashboardStats;
  growthKey: keyof DashboardStats;
}

const statsConfig: StatConfig[] = [
  {
    key: 'totalUsers',
    label: 'إجمالي المستخدمين',
    icon: Users,
    valueKey: 'users',
    growthKey: 'usersGrowth',
  },
  {
    key: 'totalCourses',
    label: 'إجمالي الدورات',
    icon: BookOpen,
    valueKey: 'courses',
    growthKey: 'coursesGrowth',
  },
  {
    key: 'activeStudyGroups',
    label: 'مجموعات الدراسة النشطة',
    icon: Users2,
    valueKey: 'groups',
    growthKey: 'groupsGrowth',
  },
  {
    key: 'newRegistrationsThisWeek',
    label: 'تسجيلات جديدة هذا الأسبوع',
    icon: UserPlus,
    valueKey: 'newRegistrationsThisWeek',
    growthKey: 'registrationsGrowth',
  },
];

interface StatsCardProps {
  title: string;
  value: number;
  growth: number;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
  error?: string | null;
}

function StatsCard({ title, value, growth, icon: Icon, isLoading, error }: StatsCardProps) {
  const isPositiveGrowth = growth >= 0;
  const isError = Boolean(error);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden transition-shadow duration-300 hover:shadow-lg dark:hover:shadow-primary/10 group">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
            className="rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded-md bg-muted" />
              </motion.div>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">فشل التحميل</span>
              </motion.div>
            ) : (
              <motion.div
                key="value"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-3xl font-bold tracking-tight text-foreground"
                >
                  {value.toLocaleString('ar-SA')}
                </motion.p>
                <div className="flex items-center gap-1 text-sm">
                  {growth !== 0 && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        isPositiveGrowth ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositiveGrowth ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {Math.abs(growth)}%
                    </motion.span>
                  )}
                  <span className="text-muted-foreground">مقارنة بالأسبوع الماضي</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatsCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  refreshInterval?: number;
}

export function StatsGrid({ refreshInterval = 30000 }: StatsGridProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    if (refreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      void fetchData();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
      {isLoading && !stats
        ? statsConfig.map((config) => <StatsCardSkeleton key={config.key} />)
        : error && !stats
          ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchData()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  إعادة المحاولة
                </button>
              </div>
            )
          : stats
            ? statsConfig.map((config) => (
                <StatsCard
                  key={config.key}
                  title={config.label}
                  value={config.valueKey === 'newRegistrationsThisWeek' ? stats.newRegistrationsThisWeek : stats[config.valueKey]}
                  growth={stats[config.growthKey]}
                  icon={config.icon}
                  isLoading={isLoading}
                  error={error}
                />
              ))
            : null}
    </div>
  );
}