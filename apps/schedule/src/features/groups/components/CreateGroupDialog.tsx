import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@svu-community/ui';
import { Button } from '@svu-community/ui';
import { Input } from '@svu-community/ui';
import { Label } from '@svu-community/ui';
import { Textarea } from '@svu-community/ui';
import { useGroupActions } from '../hooks/useGroupActions';
import type { Course } from '../types';

interface CreateGroupDialogProps {
  course: Course;
  userId: string;
  trigger?: React.ReactNode;
  onError: (message: string) => void;
  onSuccess?: () => void;
}

export function CreateGroupDialog({ course, userId, trigger, onError, onSuccess }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const groupActions = useGroupActions();

  const handleCreate = async () => {
    try {
      await groupActions.createGroup({ course, userId, onError });
      setOpen(false);
      onSuccess?.();
    } catch {
      // Error handled in hook via onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">Create Group</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Study Group</DialogTitle>
          <DialogDescription>
            Create a new study group for {course.code}: {course.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              defaultValue={`${course.code} Study Group`}
              disabled={groupActions.isCreating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-description">Description (optional)</Label>
            <Textarea
              id="group-description"
              placeholder="Add a description for your study group..."
              disabled={groupActions.isCreating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={groupActions.isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={groupActions.isCreating}>
            {groupActions.isCreating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
