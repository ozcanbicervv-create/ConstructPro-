import { NextRequest, NextResponse } from 'next/server';
import { presenceService } from '@/utils/socket';
import { authenticateRequest } from '@/middleware/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const projectId = params.id;
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const members = presenceService.getProjectMembers(projectId);
    const stats = presenceService.getProjectStats(projectId);

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        members,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project members' },
      { status: 500 }
    );
  }
}