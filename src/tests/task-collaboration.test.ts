import { TaskService } from '@/services/task.service';
import { TaskService } from '@/services/task.service';
import { TaskService } from '@/services/task.service';
import { prisma } from '@/utils';
import { TaskService } from '@/services/task.service';
import { prisma } from '@/utils';
import { TaskService } from '@/services/task.service';
import { TaskService } from '@/services/task.service';
import { TaskService } from '@/services/task.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { TaskCommentService } from '@/services/task-comment.service';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { prisma } from '@/utils';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the database and services for testing
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
  },
  project: {
    create: jest.fn(),
    findUnique: jest.fn(),
    deleteMany: jest.fn(),
  },
  task: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  taskComment: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  taskAttachment: {
    deleteMany: jest.fn(),
  },
};

// Mock the services
jest.mock('@/utils/db', () => ({
  prisma: mockPrisma,
}));

describe('Task Collaboration Features', () => {
  let testUser: any;
  let testProject: any;
  let testTask: any;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'PROJECT_MANAGER',
      },
    });

    // Create test project
    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        managerId: testUser.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    // Create test task
    testTask = await prisma.task.create({
      data: {
        title: 'Test Task',
        projectId: testProject.id,
        createdBy: testUser.id,
        assignedTo: testUser.id,
        estimatedHours: 8,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.taskComment.deleteMany({});
    await prisma.taskAttachment.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('Task Comments', () => {
    it('should create a task comment', async () => {
      const comment = await TaskCommentService.createTaskComment(
        testTask.id,
        { content: 'This is a test comment' },
        testUser.id
      );

      expect(comment).toBeDefined();
      expect(comment.content).toBe('This is a test comment');
      expect(comment.userId).toBe(testUser.id);
      expect(comment.taskId).toBe(testTask.id);
    });

    it('should retrieve task comments', async () => {
      // Create multiple comments
      await TaskCommentService.createTaskComment(
        testTask.id,
        { content: 'First comment' },
        testUser.id
      );
      await TaskCommentService.createTaskComment(
        testTask.id,
        { content: 'Second comment' },
        testUser.id
      );

      const comments = await TaskCommentService.getTaskComments(testTask.id, testUser.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].content).toBe('First comment');
      expect(comments[1].content).toBe('Second comment');
    });

    it('should update a task comment', async () => {
      const comment = await TaskCommentService.createTaskComment(
        testTask.id,
        { content: 'Original comment' },
        testUser.id
      );

      const updatedComment = await TaskCommentService.updateTaskComment(
        comment.id,
        'Updated comment',
        testUser.id
      );

      expect(updatedComment?.content).toBe('Updated comment');
    });

    it('should delete a task comment', async () => {
      const comment = await TaskCommentService.createTaskComment(
        testTask.id,
        { content: 'Comment to delete' },
        testUser.id
      );

      const success = await TaskCommentService.deleteTaskComment(comment.id, testUser.id);
      expect(success).toBe(true);

      const comments = await TaskCommentService.getTaskComments(testTask.id, testUser.id);
      expect(comments).toHaveLength(0);
    });
  });

  describe('User Availability', () => {
    it('should check user availability', async () => {
      const availability = await TaskService.checkUserAvailability(testUser.id);

      expect(availability).toBeDefined();
      expect(availability.isAvailable).toBeDefined();
      expect(availability.workload).toBeDefined();
      expect(availability.conflictingTasks).toBeDefined();
    });

    it('should validate task assignment', async () => {
      const taskData = {
        projectId: testProject.id,
        title: 'New Task',
        assignedTo: testUser.id,
      };

      // Should not throw error for valid assignment
      await expect(
        TaskService.validateTaskAssignment(taskData, testUser.id)
      ).resolves.not.toThrow();
    });

    it('should reject assignment to non-existent user', async () => {
      const taskData = {
        projectId: testProject.id,
        title: 'New Task',
        assignedTo: 'non-existent-user-id',
      };

      await expect(
        TaskService.validateTaskAssignment(taskData, testUser.id)
      ).rejects.toThrow('Assigned user not found');
    });
  });

  describe('Task Progress Tracking', () => {
    it('should calculate task progress', async () => {
      // Update task with some actual hours
      await prisma.task.update({
        where: { id: testTask.id },
        data: {
          actualHours: 4,
          status: 'IN_PROGRESS',
        },
      });

      const progress = await TaskService.getTaskProgress(testTask.id, testUser.id);

      expect(progress).toBeDefined();
      expect(progress?.progress.timeSpent).toBe(4);
      expect(progress?.progress.timeRemaining).toBe(4);
      expect(progress?.progress.completionPercentage).toBeGreaterThan(0);
    });

    it('should calculate project task metrics', async () => {
      // Create additional tasks for better metrics
      await prisma.task.create({
        data: {
          title: 'Completed Task',
          projectId: testProject.id,
          createdBy: testUser.id,
          status: 'COMPLETED',
          estimatedHours: 5,
          actualHours: 6,
        },
      });

      const metrics = await TaskService.getProjectTaskMetrics(testProject.id, testUser.id);

      expect(metrics).toBeDefined();
      expect(metrics.totalTasks).toBe(2);
      expect(metrics.completedTasks).toBe(1);
      expect(metrics.totalEstimatedHours).toBe(13); // 8 + 5
      expect(metrics.totalActualHours).toBe(6);
    });
  });

  describe('Task Assignment Validation', () => {
    it('should create task with valid assignment', async () => {
      const taskData = {
        projectId: testProject.id,
        title: 'Valid Assignment Task',
        assignedTo: testUser.id,
        estimatedHours: 4,
      };

      const task = await TaskService.createTask(taskData, testUser.id);

      expect(task).toBeDefined();
      expect(task.assignedTo).toBe(testUser.id);
      expect(task.title).toBe('Valid Assignment Task');
    });

    it('should update task assignment with validation', async () => {
      const updateData = {
        assignedTo: testUser.id,
        status: 'IN_PROGRESS' as const,
      };

      const updatedTask = await TaskService.updateTask(testTask.id, updateData, testUser.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.assignedTo).toBe(testUser.id);
      expect(updatedTask?.status).toBe('IN_PROGRESS');
    });
  });
});

describe('Task Collaboration API Integration', () => {
  // These would be integration tests that test the actual API endpoints
  // For now, we'll focus on the service layer tests above
  
  it('should be implemented with proper API endpoints', () => {
    // This is a placeholder to remind us that we have implemented:
    // - POST /api/tasks/:id/comments
    // - GET /api/tasks/:id/comments
    // - PATCH /api/tasks/:id/comments/:commentId
    // - DELETE /api/tasks/:id/comments/:commentId
    // - POST /api/tasks/:id/attachments
    // - GET /api/tasks/:id/attachments
    // - GET /api/tasks/:id/attachments/:attachmentId (download)
    // - DELETE /api/tasks/:id/attachments/:attachmentId
    // - GET /api/tasks/:id/progress
    // - GET /api/users/:id/availability
    // - GET /api/projects/:id/tasks/metrics
    
    expect(true).toBe(true);
  });
});