import { motion } from 'motion/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Users, UserPlus, UserMinus, Plus } from 'lucide-react';
import type { ExtractionResult, StudyGroup } from '../services/types';
import type { User } from '@svu-community/types';

interface ResultsTabProps {
  extractionResult: ExtractionResult | null;
  availableGroups: Record<string, StudyGroup[]>;
  user: User | null;
  error: string | null;
  isActionLoading: boolean;
  onJoinGroup: (groupId: string, members: string[]) => void;
  onLeaveGroup: (groupId: string, members: string[]) => void;
  onCreateGroup: (course: { code: string; name: string }) => void;
  onReupload: () => void;
  hasMore: Record<string, boolean>;
  isLoadingMore: Record<string, boolean>;
  onLoadMore: (courseCode: string) => Promise<void>;
}

export function ResultsTab({
  extractionResult,
  availableGroups,
  user,
  error,
  isActionLoading,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup,
  onReupload,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ResultsTabProps) {
  if (!user || !extractionResult) return null;

  const userId = user.id;

  return (
    <motion.div
      key="results-tab"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Extracted Courses</h2>
          <p className="text-slate-500">Major: {extractionResult.major}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReupload}>
          Re-upload
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {extractionResult.courses.map((course) => {
          const groups = availableGroups[course.code] || [];
          const courseKey = course.code;

          return (
            <Card key={courseKey} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase">
                      {course.code}
                    </span>
                    {course.section && (
                      <span className="text-xs text-slate-400">Section {course.section}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{course.name}</h3>
                  {course.instructor && (
                    <p className="text-sm text-slate-500">Instructor: {course.instructor}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {groups.length > 0 ? (
                    <div className="space-y-3 w-full md:w-auto">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Available Groups</p>
                      {groups.map(group => {
                        const isMember = group.members.includes(userId);
                        return (
                          <div key={group.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{group.name}</p>
                                <p className="text-xs text-slate-500">{group.members.length} members</p>
                              </div>
                            </div>
                            {isMember ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => onLeaveGroup(group.id, group.members)}
                                disabled={isActionLoading}
                                aria-label={`Leave ${group.name}`}
                              >
                                <UserMinus className="w-4 h-4 mr-2" aria-hidden="true" /> Leave
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onJoinGroup(group.id, group.members)}
                                disabled={isActionLoading}
                                aria-label={`Join ${group.name}`}
                              >
                                <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" /> Join
                              </Button>
                            )}
                          </div>
                        );
                      })}
                      {hasMore[courseKey] && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => onLoadMore(course.code)}
                          disabled={isLoadingMore[courseKey] || isActionLoading}
                        >
                          {isLoadingMore[courseKey] ? 'Loading...' : 'Load More'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-right space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 justify-end" role="alert">
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        <span className="text-sm">No groups found for this course</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onCreateGroup(course)}
                        disabled={isActionLoading}
                        aria-label={`Create study group for ${course.code}`}
                      >
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Create Group
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
