import useGroups, { UseGroupActionsReturn } from '../hooks/useGroupActions';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@svu-community/ui';
import { Button } from '@svu-community/ui';
import { Badge } from '@svu-community/ui';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@svu-community/ui';
import type { StudyGroup, Course } from '../types';

import { useGroups } from './useGroups';
import CreateGroupDialog from './CreateGroupDialog';

interface GroupListProps {
  courseCodes: string[];
  userId: string;
  enabled: boolean;
  onError: (message: string) => void;
}

export function GroupList({ courseCodes, userId, enabled, onError }: GroupListProps) {
  const { availableGroups, fetchError, hasMore, isLoadingMore, loadMore } = useGroups({ courseCodes, enabled });
  const groupActions = useGroupActions();

  return (
    <div className="space-y-4">
      {Object.entries(availableGroups).map(([courseCode, groups]) => (
        <Card key={courseCode}>
          <CardHeader>
            <CardTitle>{groups[0]?.courseName || courseCode}</CardTitle>
            <CardDescription>{groups.length} study group{groups.length === 1 ? '' : 's'} available</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No study groups available yet.</p>
            ) : (
              <div className="space-y-3">
                {groups.map((group: StudyGroup) => {
                  const isMember = group.members.includes(userId);
                  const memberCount = group.members.length;

                  return (
                    <div key={group.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{group.name}</p>
                        {group.description && (
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {memberCount} member{memberCount === 1 ? '' : 's'}
                          </Badge>
                          {isMember && (
                            <Badge variant="outline" className="text-xs">
                              Joined
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isMember ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              groupActions.leaveGroup({
                                groupId: group.id,
                                userId,
                                currentMembers: group.members,
                                onError,
                              })
                            }
                            disabled={groupActions.isLeaving}
                          >
                            Leave
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              groupActions.joinGroup({
                                groupId: group.id,
                                userId,
                                currentMembers: group.members,
                                onError,
                              })
                            }
                            disabled={groupActions.isJoining}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasMore[courseCode] && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={() => loadMore(courseCode)}
                  disabled={isLoadingMore[courseCode]}
                >
                  {isLoadingMore[courseCode] ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {fetchError && (
        <p className="text-sm text-red-500">{fetchError}</p>
      )}
    </div>
  );
}
